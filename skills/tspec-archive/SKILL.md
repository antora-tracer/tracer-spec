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

1. Run `antora-tracer validate -i docs --config traceability.yml` and fix any validation errors before continuing.
2. Read the change's durable DSN design and its linked ARC and ADR items.
3. If the design records architecture impact, update the arc42 baseline and affected ARC items to describe the implemented system. Create new ARC items for materially new elements; mark replaced items `superseded` rather than repurposing their identities. Preserve the design and decision links.
4. Show the exact baseline and graph-item changes to the user and ask for approval before writing. Save only approved updates, then rerun `antora-tracer validate -i docs --config traceability.yml`.
5. Spawn a cold reviewer (fresh subagent with no prior context) to verify the change against its addressed requirements, DSN design, recorded ADRs, and affected ARC items. The review emits a per-requirement SATISFIED/NOT verdict and checks the baseline against the implemented system.
6. If any requirement is NOT satisfied, or the architecture baseline is stale, stop and report — do not delete `tspec/` or advance state.
7. Delete `tspec/<change-id>/` — the temporary tasks are consumed. Durable DSN, ARC, and ADR items remain in the graph.
8. Advance the change status `verified` → `closed`.

## Rules

- Never archive an unverified change.
- Architecture baseline updates require user approval and must preserve historical ARC identity and links.
- The conformance verification is read-only and independent of the proposing and implementing agent; never close on a NOT-satisfied verdict or stale architecture baseline.
- The durable residue of the change (its items and relations) stays in the graph; only `tspec/` is removed.
