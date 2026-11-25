import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  ConfigLoader,
  RequirementsTraceabilityExtension,
} from "@antora-tracer/core";

const SKIP_DIRS = new Set(["node_modules", "build", "public", ".git", ".pnpm-store"]);

function collectAdocFiles(root) {
  const files = [];
  const walk = (directory, relative = "") => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) {
          walk(join(directory, entry.name), join(relative, entry.name));
        }
      } else if (entry.isFile() && entry.name.endsWith(".adoc")) {
        files.push({
          path: join(relative, entry.name),
          content: readFileSync(join(directory, entry.name), "utf8"),
        });
      }
    }
  };
  walk(root);
  return files;
}

function duplicateItemIds(parsed) {
  const seen = new Set();
  const duplicates = new Set();
  for (const item of parsed.result.items) {
    if (seen.has(item.id)) duplicates.add(item.id);
    else seen.add(item.id);
  }
  // The parser skips a same-file redefinition instead of returning it as a
  // second item, so it surfaces only as a `duplicate_id` error. That error
  // carries no structured id field, so read the id from the message's leading
  // clause, which is its stable part. Do not match the trailing sentence: it
  // already changed once (core 0.34.0 replaced "An item with this ID already
  // exists." with the two source locations), which silently stopped a
  // duplicated id from being rejected.
  for (const error of parsed.result.errors) {
    if (error.type !== "duplicate_id") continue;
    const match = /^Duplicate item ID: ([^\s.]+)\./.exec(error.message);
    if (match) duplicates.add(match[1]);
  }
  return duplicates;
}

function isActionable(item, graph) {
  const children = graph
    .getReverseRelationships(item.id, "refines")
    .map((relation) => graph.getItem(relation.fromId))
    .filter((child) => child?.role === "change");
  const childResults = children.map((child) => isActionable(child, graph));

  if (item.status === "closed" || item.status === "rejected") return false;
  if (children.length === 0) {
    return item.status === "refined" || item.status === "accepted";
  }
  return childResults.every(Boolean);
}
function assertAcyclicChangeRefinements(graph) {
  const visiting = new Set();
  const visited = new Set();
  const visit = (item) => {
    if (visiting.has(item.id)) {
      throw new Error(`Cycle in change refinement links at ${item.id}`);
    }
    if (visited.has(item.id)) return;
    visiting.add(item.id);
    for (const relation of graph.getReverseRelationships(item.id, "refines")) {
      const child = graph.getItem(relation.fromId);
      if (child?.role === "change") visit(child);
    }
    visiting.delete(item.id);
    visited.add(item.id);
  };
  for (const item of graph.getItemsByRole("change")) visit(item);
}

export function readChangeStatus(projectDirectory, changeId, options = {}) {
  const configLoader = new ConfigLoader();
  configLoader.load(resolve(projectDirectory, options.config ?? "traceability.yml"));
  const extension = new RequirementsTraceabilityExtension(configLoader);
  const parsed = extension.processFiles(collectAdocFiles(resolve(projectDirectory, options.docs ?? "docs")));
  const duplicateIds = duplicateItemIds(parsed);
  if (duplicateIds.size > 0) {
    throw new Error(`Duplicate item ID in project graph: ${duplicateIds.values().next().value}`);
  }
  assertAcyclicChangeRefinements(extension.graph);
  const item = extension.graph.getItem(changeId);
  if (item?.role !== "change") throw new Error(`Change not found: ${changeId}`);

  return {
    id: item.id,
    status: item.status ?? "unknown",
    actionable: isActionable(item, extension.graph),
    finished: item.status === "closed",
  };
}

/**
 * Check that a change with a temporary task checklist records a durable design.
 *
 * Tasks live under `tspec/<change-id>/tasks.md`, which the graph never sees, so
 * the ordering rule "design before tasks" can only be checked by looking at the
 * filesystem and the graph together. The check is read-only and reports rather
 * than fixes: creating the missing design is the author's call.
 */
export function checkChangeReadiness(projectDirectory, changeId, options = {}) {
  const tasksFile = resolve(projectDirectory, "tspec", changeId, "tasks.md");
  if (!existsSync(tasksFile)) {
    return { id: changeId, checked: false, reason: `No task checklist at tspec/${changeId}/tasks.md` };
  }

  const configLoader = new ConfigLoader();
  configLoader.load(resolve(projectDirectory, options.config ?? "traceability.yml"));
  const extension = new RequirementsTraceabilityExtension(configLoader);
  const parsed = extension.processFiles(collectAdocFiles(resolve(projectDirectory, options.docs ?? "docs")));
  const duplicateIds = duplicateItemIds(parsed);
  if (duplicateIds.size > 0) {
    throw new Error(`Duplicate item ID in project graph: ${duplicateIds.values().next().value}`);
  }

  const graph = extension.graph;
  const item = graph.getItem(changeId);
  if (item?.role !== "change") throw new Error(`Change not found: ${changeId}`);

  // A design records its change through `records:DSN-NNN[]` on the change or the
  // derived `recorded_by` on the design, so read the change's own relations and
  // filter by the target's role rather than trusting one direction.
  const designs = graph
    .getRelationships(changeId, "records")
    .map((relation) => graph.getItem(relation.targetId))
    .filter((target) => target?.role === "design")
    .map((design) => design.id);

  return {
    id: changeId,
    checked: true,
    tasksFile: `tspec/${changeId}/tasks.md`,
    designs,
    satisfied: designs.length > 0,
  };
}
