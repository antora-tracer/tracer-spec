import { readdirSync, readFileSync } from "node:fs";
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
  const prefix = "Duplicate item ID: ";
  const suffix = ". An item with this ID already exists.";
  for (const error of parsed.result.errors) {
    if (error.type === "duplicate_id" && error.message.startsWith(prefix) && error.message.endsWith(suffix)) {
      duplicates.add(error.message.slice(prefix.length, -suffix.length));
    }
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
