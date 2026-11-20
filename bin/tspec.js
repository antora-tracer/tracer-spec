#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { stdin as input } from "node:process";
import { Option, program } from "commander";
import {
  scaffold,
  installSkills,
  installCommands,
  installAgents,
  TOOLS,
  DEFAULT_TOOLS,
  parseTools,
} from "../src/scaffold.js";

import { readChangeStatus } from "../src/change-status.js";

const pkg = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
);

const TOOL_IDS = Object.keys(TOOLS).join(", ");

/** Resolve the tool list from `--tools`, a picker, or the default. */
async function resolveTools(options) {
  if (options.tools !== undefined) return parseTools(options.tools);
  if (!input.isTTY) return DEFAULT_TOOLS;
  const choices = Object.entries(TOOLS).map(([value, { label, dir }]) => ({
    name: `${label} (${dir})`,
    value,
    checked: DEFAULT_TOOLS.includes(value),
  }));
  const { checkbox } = await import("@inquirer/prompts");
  return checkbox({
    message: "Select agent harnesses to install skills for",
    choices,
  });
}

async function resolveScope(options) {
  if (options.scope !== undefined) return options.scope;
  if (!input.isTTY) return "project";
  const { select } = await import("@inquirer/prompts");
  return select({
    message: "Where should workflow skills be installed?",
    choices: [
      { name: "Project (this repository)", value: "project" },
      { name: "User (available in all projects)", value: "user" },
    ],
    default: "project",
  });
}

function describeTools(ids, scope = "project") {
  return ids
    .map((id) => {
      const dir = scope === "user" ? `~/${TOOLS[id].userDir}` : TOOLS[id].dir;
      return `${TOOLS[id].label} (${dir})`;
    })
    .join(", ");
}

/** Install skills, commands, and agent definitions for the selected harnesses. */
function installHarness(tools, scope, options) {
  const shared = {
    scope,
    tools,
    force: options.force === true,
    link: options.link === true,
    dryRun: options.dryRun === true,
  };
  return {
    skills: installSkills(shared),
    commands: installCommands({ ...shared, directory: process.cwd() }),
    agents: installAgents(shared),
  };
}

/** Print what a harness installation created or skipped. */
function reportHarnessInstall({ skills, commands, agents }, tools, scope) {
  if (tools.length > 0 && skills.created.length > 0) {
    console.log(`Installed skills for: ${describeTools(tools, scope)}`);
  }
  if (agents.created.length > 0) {
    console.log(`Installed ${agents.created.length} agent definition(s).`);
  }
  if (commands.created.length > 0) {
    console.log(
      `Installed ${commands.created.length} slash command(s) (tspec:...).`,
    );
  }
  const skipped = skills.skipped.length + commands.skipped.length + agents.skipped.length;
  if (skipped > 0) {
    console.log(`Skipped ${skipped} existing harness file(s) (use --force to overwrite).`);
  }
}

program
  .name("tspec")
  .description(
    "Tracer Spec Workflow - scaffold a project and install the workflow skills",
  )
  .version(pkg.version);

program
  .command("init")
  .description(
    "Initialize a Tracer Spec Workflow project: scaffold structure and install skills",
  )
  .argument("[name]", "Project name (defaults to current directory name)")
  .option("--force", "Overwrite existing files")
  .option("--skip-skills", "Do not install the workflow skills")
  .option("--link", "Link installed skills to the package source")
  .addOption(
    new Option("--scope <scope>", "Choose project or user skill installation").choices(["project", "user"]),
  )
  .option("--dry-run", "Preview actions without writing files")
  .option(
    "--tools <ids>",
    `Agent harnesses to install skills for (comma-separated, 'all', 'none'). Valid: ${TOOL_IDS}`,
  )
  .action(async (name, options) => {
    const tools =
      options.skipSkills === true ? [] : await resolveTools(options);
    const scope = tools.length > 0 ? await resolveScope(options) : "project";

    const result = scaffold({
      name,
      directory: process.cwd(),
      force: options.force === true,
      skipSkills: options.skipSkills === true,
      dryRun: options.dryRun === true,
    });

    const installed =
      tools.length > 0
        ? installHarness(tools, scope, options)
        : { skills: { created: [], skipped: [] }, commands: { created: [], skipped: [] }, agents: { created: [], skipped: [] } };

    if (options.dryRun === true) {
      console.log("[DRY RUN] Would initialize project:");
      console.log(`  Component name: ${result.name}`);
      console.log(`  Title: ${result.title}`);
      if (tools.length > 0) {
        console.log(`  Skills for: ${describeTools(tools, scope)}`);
      }
      console.log("  Files that would be created:");
      for (const f of [
        ...result.created,
        ...installed.skills.created,
        ...installed.commands.created,
        ...installed.agents.created,
      ]) {
        console.log(`    - ${f}`);
      }
      return;
    }

    console.log(`Initialized Tracer Spec Workflow project '${result.name}'.`);
    console.log(`Created ${result.created.length} file(s).`);
    if (tools.length > 0) reportHarnessInstall(installed, tools, scope);
    if (result.skipped.length > 0) {
      console.log(
        `Skipped ${result.skipped.length} existing file(s) (use --force to overwrite).`,
      );
    }
    console.log("");
    console.log("Next steps:");
    console.log("  1. Install dependencies:  npm install");
    console.log('  2. Propose a change:      tspec-propose "your feature"');
    console.log(
      "  3. Validate:             antora-tracer validate -i docs --config traceability.yml",
    );
    console.log("  4. Build docs:           npm run build");
  });

program
  .command("install")
  .description(
    "Install the workflow skills, slash commands, and agent definitions into harnesses without scaffolding",
  )
  .option("--force", "Overwrite existing harness files")
  .option("--link", "Link installed harness files to the package source")
  .addOption(
    new Option("--scope <scope>", "Choose project or user installation").choices(["project", "user"]),
  )
  .option("--dry-run", "Preview actions without writing files")
  .option(
    "--tools <ids>",
    `Agent harnesses to install for (comma-separated, 'all', 'none'). Valid: ${TOOL_IDS}`,
  )
  .action(async (options) => {
    const tools = await resolveTools(options);
    if (tools.length === 0) {
      throw new Error(
        "No harness selected. Pass --tools <ids> (or 'all'); 'none' installs nothing.",
      );
    }
    const scope = await resolveScope(options);
    const installed = installHarness(tools, scope, options);

    if (options.dryRun === true) {
      console.log("[DRY RUN] Would install harness files:");
      console.log(`  Skills for: ${describeTools(tools, scope)}`);
      console.log("  Files that would be created:");
      for (const f of [
        ...installed.skills.created,
        ...installed.commands.created,
        ...installed.agents.created,
      ]) {
        console.log(`    - ${f}`);
      }
      return;
    }

    reportHarnessInstall(installed, tools, scope);
  });

program
  .command("status <changeId>")
  .description("Report a change's lifecycle status and readiness")
  .option("-c, --config <path>", "Traceability config path (default: traceability.yml)")
  .option("--docs <path>", "AsciiDoc source directory (default: docs)")
  .action((changeId, options) => {
    const result = readChangeStatus(process.cwd(), changeId, options);
    console.log(
      `${result.id} status=${result.status} actionable=${result.actionable} finished=${result.finished}`,
    );
  });

try {
  await program.parseAsync(process.argv);
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exit(1);
}
