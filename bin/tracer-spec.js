#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { stdin as input } from "node:process";
import { checkbox } from "@inquirer/prompts";
import { program } from "commander";
import {
  scaffold,
  installSkills,
  installCommands,
  TOOLS,
  DEFAULT_TOOLS,
  parseTools,
} from "../src/scaffold.js";

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
  return checkbox({
    message: "Select agent harnesses to install skills for",
    choices,
  });
}

function describeTools(ids) {
  return ids.map((id) => `${TOOLS[id].label} (${TOOLS[id].dir})`).join(", ");
}

program
  .name("tracer-spec")
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
  .option("--dry-run", "Preview actions without writing files")
  .option(
    "--tools <ids>",
    `Agent harnesses to install skills for (comma-separated, 'all', 'none'). Valid: ${TOOL_IDS}`,
  )
  .action(async (name, options) => {
    const tools =
      options.skipSkills === true ? [] : await resolveTools(options);

    const result = scaffold({
      name,
      directory: process.cwd(),
      force: options.force === true,
      skipSkills: options.skipSkills === true,
      dryRun: options.dryRun === true,
    });

    const installed =
      tools.length > 0
        ? installSkills({
            directory: process.cwd(),
            tools,
            force: options.force === true,
            dryRun: options.dryRun === true,
          })
        : { created: [], skipped: [] };

    const installedCommands =
      tools.length > 0
        ? installCommands({
            directory: process.cwd(),
            tools,
            force: options.force === true,
            dryRun: options.dryRun === true,
          })
        : { created: [], skipped: [] };

    if (options.dryRun === true) {
      console.log("[DRY RUN] Would initialize project:");
      console.log(`  Component name: ${result.name}`);
      console.log(`  Title: ${result.title}`);
      if (tools.length > 0) {
        console.log(`  Skills for: ${describeTools(tools)}`);
      }
      console.log("  Files that would be created:");
      for (const f of [
        ...result.created,
        ...installed.created,
        ...installedCommands.created,
      ]) {
        console.log(`    - ${f}`);
      }
      return;
    }

    console.log(`Initialized Tracer Spec Workflow project '${result.name}'.`);
    console.log(`Created ${result.created.length} file(s).`);
    if (tools.length > 0) {
      console.log(`Installed skills for: ${describeTools(tools)}`);
    }
    if (installedCommands.created.length > 0) {
      console.log(
        `Installed ${installedCommands.created.length} slash command(s) (tspec:...).`,
      );
    }
    if (result.skipped.length > 0) {
      console.log(
        `Skipped ${result.skipped.length} existing file(s) (use --force to overwrite).`,
      );
    }
    if (installed.skipped.length > 0) {
      console.log(
        `Skipped ${installed.skipped.length} existing skill file(s) (use --force to overwrite).`,
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

try {
  await program.parseAsync(process.argv);
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exit(1);
}
