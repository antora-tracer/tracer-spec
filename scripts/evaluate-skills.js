#!/usr/bin/env node
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { spawn, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repo = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const configurations = ["with_skill", "without_skill"];
const tools = ["Skill", "Read", "Glob", "Grep", "Edit", "Write", "Bash"];
const allowedTools = ["Skill", "Read", "Glob", "Grep", "Edit", "Write", "Bash(antora-tracer *)"];
const expectationTypes = new Set(["assistant_contains", "assistant_not_contains", "transcript_contains", "workspace_unchanged", "workspace_changed_under", "new_file_contains", "file_exists", "file_not_exists", "file_contains", "directory_contains", "exit_code"]);
const injectedSkillPath = (name) => `.claude/skills/${name}/SKILL.md`;

function parseArgs(argv) {
  const options = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!["--skill", "--scenario", "--output", "--model", "--claude"].includes(arg) || !argv[i + 1]) {
      throw new Error("Usage: node scripts/evaluate-skills.js --skill <name> [--scenario <file>] [--output <dir>] [--model <id>] [--claude <executable>]");
    }
    options[arg.slice(2)] = argv[++i];
  }
  if (!options.skill) throw new Error("--skill is required");
  return options;
}

function safePath(root, file) {
  if (typeof file !== "string" || !file || isAbsolute(file)) throw new Error(`Expected a relative project path, got: ${file}`);
  const path = resolve(root, file);
  if (path !== root && !path.startsWith(`${root}${sep}`)) throw new Error(`Path escapes project: ${file}`);
  return path;
}

function snapshot(root, dir = root, result = {}) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const rel = relative(root, path).split(sep).join("/");
    const stat = statSync(path);
    if (stat.isDirectory()) snapshot(root, path, result);
    else if (stat.isFile()) result[rel] = createHash("sha256").update(readFileSync(path)).digest("hex");
  }
  return result;
}

function summarizeChanges(before, after) {
  const created = Object.keys(after).filter((path) => !(path in before)).sort();
  const deleted = Object.keys(before).filter((path) => !(path in after)).sort();
  const modified = Object.keys(after).filter((path) => path in before && before[path] !== after[path]).sort();
  return { created, modified, deleted, unchanged: created.length + modified.length + deleted.length === 0 };
}
function runClaude(executable, prompt, cwd, model, disableSkills) {
  const args = [
    "--print", "--output-format", "stream-json", "--verbose", "--no-session-persistence",
    "--permission-mode", "dontAsk", "--setting-sources", "project,local",
    "--tools", ...tools, "--allowedTools", ...allowedTools,
    ...(disableSkills ? ["--disable-slash-commands"] : []),
    ...(model ? ["--model", model] : []),
    "--", prompt,
  ];
  const started = Date.now();
  return new Promise((resolveResult, reject) => {
    const child = spawn(executable, args, {
      cwd,
      env: { ...process.env, PATH: `${join(repo, "node_modules", ".bin")}${sep === "\\" ? ";" : ":"}${process.env.PATH ?? ""}` },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
      setTimeout(() => child.kill("SIGKILL"), 2000).unref();
    }, 10 * 60 * 1000);
    child.stdout.setEncoding("utf8").on("data", (chunk) => { stdout += chunk; });
    child.stderr.setEncoding("utf8").on("data", (chunk) => { stderr += chunk; });
    child.on("error", (error) => { clearTimeout(timer); reject(error); });
    child.on("close", (code, signal) => {
      clearTimeout(timer);
      resolveResult({ stdout, stderr, exitCode: code, signal, timedOut, durationMs: Date.now() - started });
    });
  });
}

function assistantText(stdout) {
  let final = "";
  for (const line of stdout.split(/\r?\n/)) {
    try {
      const event = JSON.parse(line);
      if (event.type === "result" && typeof event.result === "string") final = event.result;
      else if (event.type === "assistant" && Array.isArray(event.message?.content)) {
        const text = event.message.content.filter((item) => item.type === "text").map((item) => item.text).join("\n");
        if (text) final = text;
      }
    } catch { /* Keep raw stream as the authoritative transcript. */ }
  }
  return final;
}

function modelId(stdout, fallback) {
  for (const line of stdout.split(/\r?\n/)) {
    try {
      const event = JSON.parse(line);
      if (event.type === "system" && typeof event.model === "string") return event.model;
      if (typeof event.canonicalModel === "string") return event.canonicalModel;
      if (typeof event.model === "string") return event.model;
    } catch { /* Ignore non-JSON output. */ }
  }
  return fallback;
}
function runFailed(run) {
  if (run.exitCode !== 0 || run.timedOut) return true;
  return run.stdout.split(/\r?\n/).some((line) => {
    try {
      const event = JSON.parse(line);
      return event.is_error === true || Boolean(event.api_error_status) || event.terminal_reason === "api_error";
    } catch {
      return false;
    }
  });
}

function filesUnder(path) {
  if (!existsSync(path)) return [];
  if (statSync(path).isFile()) return [path];
  const result = [];
  for (const name of readdirSync(path)) result.push(...filesUnder(join(path, name)));
  return result;
}

function checkExpectation(expectation, run, workspace) {
  const { type, value = "", path } = expectation;
  const text = run.assistantText;
  if (type === "assistant_contains") return { passed: text.includes(value), evidence: text.includes(value) ? `Found ${JSON.stringify(value)} in assistant response.` : `Assistant response did not contain ${JSON.stringify(value)}.` };
  if (type === "assistant_not_contains") return { passed: !text.includes(value), evidence: text.includes(value) ? `Found disallowed ${JSON.stringify(value)} in assistant response.` : `Assistant response did not contain ${JSON.stringify(value)}.` };
  if (type === "workspace_unchanged") return { passed: run.workspaceChanges.unchanged, evidence: JSON.stringify(run.workspaceChanges) };
  if (type === "workspace_changed_under") {
    const prefix = path.replace(/\/$/, "");
    const changed = [...run.workspaceChanges.created, ...run.workspaceChanges.modified, ...run.workspaceChanges.deleted];
    const matched = changed.filter((entry) => entry === prefix || entry.startsWith(`${prefix}/`));
    return { passed: matched.length > 0, evidence: matched.length ? `Changed paths: ${matched.join(", ")}` : `No changes under ${prefix}.` };
  }
  if (type === "transcript_contains") return { passed: run.stdout.includes(value), evidence: run.stdout.includes(value) ? `Found ${JSON.stringify(value)} in the saved CLI transcript.` : `Saved CLI transcript did not contain ${JSON.stringify(value)}.` };
  if (type === "file_exists" || type === "file_not_exists") {
    const target = safePath(workspace, path);
    const exists = existsSync(target);
    return { passed: type === "file_exists" ? exists : !exists, evidence: `${path} ${exists ? "exists" : "does not exist"}.` };
  }
  if (type === "file_contains" || type === "directory_contains") {
    const target = safePath(workspace, path);
    const candidates = type === "directory_contains" ? filesUnder(target) : [target];
    const match = candidates.find((file) => existsSync(file) && statSync(file).isFile() && readFileSync(file, "utf8").includes(value));
    return { passed: Boolean(match), evidence: match ? `${relative(workspace, match)} contains ${JSON.stringify(value)}.` : `No matching file under ${path} contains ${JSON.stringify(value)}.` };
  }
  if (type === "new_file_contains") {
    const prefix = path.replace(/\/$/, "");
    const candidates = [...run.workspaceChanges.created, ...run.workspaceChanges.modified].filter((entry) => entry.startsWith(`${prefix}/`));
    const match = candidates.find((entry) => readFileSync(safePath(workspace, entry), "utf8").includes(value));
    return { passed: Boolean(match), evidence: match ? `${match} contains ${JSON.stringify(value)}.` : `No newly written file under ${path} contains ${JSON.stringify(value)}.` };
  }
  if (type === "exit_code") return { passed: run.exitCode === expectation.value, evidence: `Process exit code was ${run.exitCode}; expected ${expectation.value}.` };
  throw new Error(`Unsupported expectation type: ${type}`);
}

function writeJson(file, value) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const skillDir = resolve(repo, "skills", options.skill);
  const skillFile = join(skillDir, "SKILL.md");
  if (!existsSync(skillFile)) throw new Error(`Unknown skill: ${options.skill}`);
  const scenarioFile = resolve(options.scenario ?? join(skillDir, "evals", "evals.json"));
  const suite = JSON.parse(readFileSync(scenarioFile, "utf8"));
  if (suite.skill_name !== options.skill || !Array.isArray(suite.evals) || suite.evals.length === 0) throw new Error("Scenario file must name the selected skill and contain a non-empty evals array.");
  const ids = new Set();
  for (const evaluation of suite.evals) {
    if (!Number.isInteger(evaluation.id) || ids.has(evaluation.id) || !evaluation.name || !evaluation.prompt || !evaluation.fixture || !Array.isArray(evaluation.expectations)) throw new Error(`Invalid or duplicate evaluation entry: ${JSON.stringify(evaluation)}`);
    ids.add(evaluation.id);
    for (const expectation of evaluation.expectations) {
      if (!expectationTypes.has(expectation.type) || typeof expectation.text !== "string" || (expectation.configuration && ![...configurations, "both"].includes(expectation.configuration))) throw new Error(`Invalid expectation: ${JSON.stringify(expectation)}`);
      if (["workspace_changed_under", "new_file_contains", "file_exists", "file_not_exists", "file_contains", "directory_contains"].includes(expectation.type)) safePath(repo, expectation.path);
      if (["assistant_contains", "assistant_not_contains", "transcript_contains", "file_contains", "directory_contains", "new_file_contains"].includes(expectation.type) && typeof expectation.value !== "string") throw new Error(`Expectation ${expectation.type} requires a string value.`);
      if (expectation.type === "exit_code" && !Number.isInteger(expectation.value)) throw new Error("exit_code expectations require an integer value.");
    }
    safePath(repo, evaluation.fixture);
  }
  const executable = options.claude ?? "claude";
  const version = spawnSync(executable, ["--version"], { encoding: "utf8" });
  if (version.status !== 0) throw new Error(`Cannot run ${executable} --version: ${version.stderr || version.error?.message || version.status}`);
  const timestamp = new Date().toISOString();
  const stamp = timestamp.replaceAll(":", "-").replaceAll(".", "-");
  const outputRoot = resolve(options.output ?? join(repo, "eval-results", `${options.skill}-${stamp}`));
  if (existsSync(outputRoot) && readdirSync(outputRoot).length) throw new Error(`Output directory is not empty: ${outputRoot}`);
  mkdirSync(outputRoot, { recursive: true });
  const results = [];

  for (const evaluation of suite.evals) {
    const fixture = safePath(repo, evaluation.fixture);
    if (!existsSync(fixture) || !statSync(fixture).isDirectory()) throw new Error(`Fixture directory not found: ${fixture}`);
    const evalRoot = join(outputRoot, `eval-${evaluation.id}`);
    const caseResult = { id: evaluation.id, name: evaluation.name, prompt: evaluation.prompt, expected_output: evaluation.expected_output ?? "", configurations: {} };
    for (const configuration of configurations) {
      const tempRoot = mkdtempSync(join(tmpdir(), `tspec-eval-${options.skill}-`));
      try {
        const workspace = join(tempRoot, "project");
        cpSync(fixture, workspace, { recursive: true });
        if (configuration === "with_skill") {
          const installedSkill = join(workspace, ".claude", "skills", options.skill);
          mkdirSync(installedSkill, { recursive: true });
          cpSync(skillFile, join(installedSkill, "SKILL.md"));
        }
        const before = snapshot(workspace);
        const runDir = join(evalRoot, configuration);
        mkdirSync(runDir, { recursive: true });
        const run = await runClaude(executable, evaluation.prompt, workspace, options.model, configuration === "without_skill");
        const after = snapshot(workspace);
        const measuredBefore = Object.fromEntries(Object.entries(before).filter(([path]) => path !== injectedSkillPath(options.skill) && path !== ".claude/settings.json" && path !== ".claude/settings.local.json"));
        const measuredAfter = Object.fromEntries(Object.entries(after).filter(([path]) => path !== injectedSkillPath(options.skill) && path !== ".claude/settings.json" && path !== ".claude/settings.local.json"));
        const changes = summarizeChanges(measuredBefore, measuredAfter);
        writeFileSync(join(runDir, "transcript.jsonl"), run.stdout);
        writeFileSync(join(runDir, "stderr.txt"), run.stderr);
        writeJson(join(runDir, "workspace-changes.json"), changes);
        const successful = !runFailed(run);
        const result = { ...run, assistantText: assistantText(run.stdout), workspaceChanges: changes };
        const checks = evaluation.expectations.filter((item) => !item.configuration || item.configuration === configuration || item.configuration === "both").map((item) => ({ text: item.text, ...checkExpectation(item, result, workspace) }));
        if (!successful) checks.push({ text: "Claude Code run completed successfully.", passed: false, evidence: `exitCode=${run.exitCode}; timedOut=${run.timedOut}; ${run.stderr || result.assistantText}` });
        const passed = checks.filter((item) => item.passed).length;
        const runSummary = { configuration, exitCode: run.exitCode, signal: run.signal, timedOut: run.timedOut, durationMs: run.durationMs, model: modelId(run.stdout, options.model ?? "CLI default"), claudeVersion: version.stdout.trim(), expectations: checks, summary: { passed, failed: checks.length - passed, total: checks.length, passRate: checks.length ? passed / checks.length : null } };
        writeJson(join(runDir, "result.json"), { ...runSummary, assistantText: result.assistantText });
        caseResult.configurations[configuration] = runSummary;
      } finally {
        rmSync(tempRoot, { recursive: true, force: true });
      }
    }
    results.push(caseResult);
  }

  const summary = Object.fromEntries(configurations.map((configuration) => {
    const checks = results.flatMap((item) => item.configurations[configuration].expectations);
    const passed = checks.filter((item) => item.passed).length;
    return [configuration, { passed, failed: checks.length - passed, total: checks.length, passRate: checks.length ? passed / checks.length : null, durationMs: results.reduce((sum, item) => sum + item.configurations[configuration].durationMs, 0) }];
  }));
  const benchmark = { metadata: { skillName: options.skill, scenarioFile: relative(repo, scenarioFile), model: options.model ?? results[0]?.configurations.with_skill?.model ?? "CLI default", claudeVersion: version.stdout.trim(), timestamp }, summary, evaluations: results };
  writeJson(join(outputRoot, "benchmark.json"), benchmark);
  const markdown = [
    `# Skill evaluation: ${options.skill}`, "", `Model: ${benchmark.metadata.model} (${benchmark.metadata.claudeVersion})`, `Started: ${timestamp}`, "",
    "| Configuration | Passed | Failed | Pass rate | Runtime (s) |", "|---|---:|---:|---:|---:|",
    ...configurations.map((configuration) => { const item = summary[configuration]; return `| ${configuration} | ${item.passed} | ${item.failed} | ${item.passRate === null ? "n/a" : `${(item.passRate * 100).toFixed(0)}%`} | ${(item.durationMs / 1000).toFixed(1)} |`; }),
    "", ...results.flatMap((item) => [`## ${item.name}`, "", item.expected_output, "", `Prompt: ${item.prompt}`, "", ...configurations.flatMap((configuration) => { const run = item.configurations[configuration]; return [`### ${configuration}`, "", ...run.expectations.map((check) => `- ${check.passed ? "PASS" : "FAIL"}: ${check.text} — ${check.evidence}`), `- Exit code: ${run.exitCode}; runtime: ${(run.durationMs / 1000).toFixed(1)}s`, ""]; })]),
    "Qualitative review: compare the saved transcripts; automated checks do not assess reasoning quality.\n",
  ].join("\n");
  writeFileSync(join(outputRoot, "benchmark.md"), markdown);
  console.log(`Results: ${outputRoot}`);
  console.log(markdown);
  if (Object.values(summary).some((item) => item.failed > 0)) process.exitCode = 1;
}

main().catch((error) => { console.error(`Evaluation failed: ${error.message}`); process.exitCode = 1; });
