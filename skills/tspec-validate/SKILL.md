---
name: tspec-validate
description: >
  Validate the traceability graph with the antora-tracer CLI and report errors and warnings. Does not change state.
license: MIT
compatibility: antora-tracer
allowed-tools: Bash(antora-tracer:*)
---

Validate the traceability graph.

## Behavior

1. Run `antora-tracer validate -i docs --config traceability.yml`.
2. Report the summary: items, relationships, and any errors or warnings.
3. If there are errors, list each with its file and line, and suggest the fix.

## Notes

- Validation checks roles, relations, statuses, and the `accepted`-requires-`requirement` gate.
- It never changes item state.
