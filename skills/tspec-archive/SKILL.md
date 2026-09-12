---
name: tspec-archive
description: >
  Close a verified change: run validation, verify conformance with a cold reviewer, delete the temporary tspec directory, and advance the change from verified to closed.
argument-hint: "<change-id>"
license: MIT
compatibility: antora-tracer
allowed-tools: Bash(antora-tracer:*)
---

Archive (close) a verified change.

## Behavior

1. Run `antora-tracer validate -i docs --config traceability.yml`.
2. Fix any validation errors before continuing.
3. Spawn a cold reviewer (fresh subagent with no prior context) to verify the change against its addressed requirements and recorded decisions. Read-only. It emits a per-requirement SATISFIED/NOT verdict.
4. If any requirement is NOT satisfied, stop and report — do not delete `tspec/` or advance state.
5. Delete `tspec/<change-id>/` — the temporary tasks are consumed.
6. Advance the change status `verified` → `closed`.

## Rules

- Never archive an unverified change.
- The conformance verification is read-only and independent of the proposing and implementing agent; never close on a NOT-satisfied verdict.
- The durable residue of the change (its items and relations) stays in the graph; only `tspec/` is removed.
