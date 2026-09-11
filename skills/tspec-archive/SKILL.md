---
name: tspec-archive
description: >
  Close a verified change: run validation, delete the temporary tspec directory, and advance the change from verified to closed.
argument-hint: "<change-id>"
license: MIT
compatibility: antora-tracer
allowed-tools: Bash(antora-tracer:*)
---

Archive (close) a verified change.

## Behavior

1. Run `antora-tracer validate -i docs --config traceability.yml`.
2. Fix any validation errors before continuing.
3. Delete `tspec/<change-id>/` — the temporary tasks are consumed.
4. Advance the change status `verified` → `closed`.

## Rules

- Never archive an unverified change.
- The durable residue of the change (its items and relations) stays in the graph; only `tspec/` is removed.
