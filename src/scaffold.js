import {
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** Normalize a project name into an Antora component / npm-safe slug. */
export function slugify(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Turn a slug/raw name into a human-readable title. */
export function humanize(name) {
  return name
    .trim()
    .replace(/[-_]+/g, " ")
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

/**
 * Scaffold a Tracer Spec Workflow project into the target directory and install
 * the workflow skills. Templates and skills ship alongside this module at the
 * package root (`templates/`, `skills/`).
 */
export function scaffold(opts = {}) {
  const target = resolve(opts.directory ?? process.cwd());
  const rawName = (opts.name ?? basename(target)).trim();
  const name = slugify(rawName);
  const title = humanize(rawName);
  // npm never ships a literal `.gitignore`, so the template is stored as
  // `gitignore` and renamed here.
  const write = (rel, content) => {
    const relMapped = rel === "gitignore" ? ".gitignore" : rel;
    const relOut = relMapped.split("__PROJECT__").join(name);
    const dest = join(target, relOut);
    if (existsSync(dest) && !opts.force) {
      skipped.push(relOut);
      return;
    }
    if (!opts.dryRun) {
      mkdirSync(dirname(dest), { recursive: true });
      writeFileSync(dest, content, "utf8");
    }
    created.push(relOut);
  };

  const templatesDir = join(__dirname, "..", "templates");
  const skillsDir = join(__dirname, "..", "skills");

  const created = [];
  const skipped = [];

  const render = (content) =>
    content.replace(/\{\{name\}\}/g, name).replace(/\{\{title\}\}/g, title);


  const walk = (dir, base) => {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const src = join(dir, entry.name);
      const rel = base ? join(base, entry.name) : entry.name;
      if (entry.isDirectory()) {
        walk(src, rel);
      } else {
        write(rel, render(readFileSync(src, "utf8")));
      }
    }
  };

  walk(templatesDir, "");

  if (!opts.skipSkills && existsSync(skillsDir)) {
    for (const entry of readdirSync(skillsDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const skillFile = join(skillsDir, entry.name, "SKILL.md");
      if (!existsSync(skillFile)) continue;
      write(join("skills", entry.name, "SKILL.md"), readFileSync(skillFile, "utf8"));
    }
  }

  return { name, title, created, skipped };
}

/**
 * Agent harnesses and their skill directories at project and user scopes.
 */
export const TOOLS = {
  "oh-my-pi": {
    label: "Oh My Pi",
    dir: ".omp/skills",
    userDir: ".omp/agent/skills",
    commands: { dir: ".omp/commands", name: (id) => `tspec-${id}.md` },
  },
  claude: {
    label: "Claude Code",
    dir: ".claude/skills",
    userDir: ".claude/skills",
    commands: { dir: ".claude/commands/tspec", name: (id) => `${id}.md` },
  },
  codex: { label: "Codex", dir: ".agents/skills", userDir: ".agents/skills" },
  pi: { label: "Pi", dir: ".pi/skills", userDir: ".agents/skills" },
  agents: { label: "Shared .agents", dir: ".agents/skills", userDir: ".agents/skills" },
};

export const DEFAULT_TOOLS = ["oh-my-pi", "claude", "agents"];

const TOOL_ALIASES = { omp: "oh-my-pi" };

/** Parse a `--tools` value into canonical tool ids. */
export function parseTools(input) {
  const raw = String(input ?? "").trim();
  if (!raw) return [];
  if (raw === "all") return Object.keys(TOOLS);
  if (raw === "none") return [];
  const ids = [];
  for (const part of raw.split(",")) {
    const token = part.trim();
    const id = TOOL_ALIASES[token] ?? token;
    if (!TOOLS[id]) {
      throw new Error(
        `Unknown tool '${token}'. Valid: ${Object.keys(TOOLS).join(", ")}, all, none`,
      );
    }
    if (!ids.includes(id)) ids.push(id);
  }
  return ids;
}

/**
 * Install skills into the selected harnesses' project or user directories.
 */
export function installSkills(opts = {}) {
  const target = resolve(opts.directory ?? (opts.scope === "user" ? homedir() : process.cwd()));
  const skillsDir = join(__dirname, "..", "skills");
  const created = [];
  const skipped = [];
  const dirs = [...new Set((opts.tools ?? []).map((id) => TOOLS[id][opts.scope === "user" ? "userDir" : "dir"]))];
  // Deduplicate tool IDs that resolve to the same skill destination.
  for (const dir of dirs) {
    for (const entry of readdirSync(skillsDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const skillFile = join(skillsDir, entry.name, "SKILL.md");
      if (!existsSync(skillFile)) continue;
      const rel = join(dir, entry.name, "SKILL.md");
      const dest = join(target, rel);
      const present = opts.link
        ? lstatSync(dest, { throwIfNoEntry: false }) !== undefined
        : existsSync(dest);
      if (present && !opts.force) {
        skipped.push(rel);
        continue;
      }
      if (!opts.dryRun) {
        mkdirSync(dirname(dest), { recursive: true });
        if (opts.link) {
          if (present) unlinkSync(dest);
          symlinkSync(skillFile, dest, "file");
        } else {
          writeFileSync(dest, readFileSync(skillFile, "utf8"), "utf8");
        }
      }
      created.push(rel);
    }
  }
  return { created, skipped };
}

/**
 * Install the `tspec:` slash commands for harnesses that support them.
 * Command files ship in `commands/`; each harness renames them per its own
 * convention (Claude: `tspec/<id>.md` → `/tspec:<id>`, Oh My Pi:
 * `tspec-<id>.md` → `/tspec-<id>`).
 */
export function installCommands(opts = {}) {
  const target = resolve(opts.directory ?? process.cwd());
  const commandsDir = join(__dirname, "..", "commands");
  const created = [];
  const skipped = [];
  if (!existsSync(commandsDir)) return { created, skipped };
  for (const id of opts.tools ?? []) {
    const tool = TOOLS[id];
    if (!tool.commands) continue;
    for (const entry of readdirSync(commandsDir, { withFileTypes: true })) {
      if (!entry.isFile()) continue;
      const base = entry.name.replace(/\.md$/, "");
      const rel = join(tool.commands.dir, tool.commands.name(base));
      const dest = join(target, rel);
      if (existsSync(dest) && !opts.force) {
        skipped.push(rel);
        continue;
      }
      if (!opts.dryRun) {
        mkdirSync(dirname(dest), { recursive: true });
        writeFileSync(dest, readFileSync(join(commandsDir, entry.name), "utf8"), "utf8");
      }
      created.push(rel);
    }
  }
  return { created, skipped };
}
