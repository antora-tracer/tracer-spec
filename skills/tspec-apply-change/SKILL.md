---
name: tspec-apply-change
description: >
  Implement an accepted change: work through the task checklist, add test evidence, and advance the change state from accepted to implemented to verified.
argument-hint: "<change-id>"
license: MIT
compatibility: antora-tracer
allowed-tools: Bash(antora-tracer:*)
---

Implement an accepted change.

## Preconditions

- The change is `accepted` (a human accepted it).
- `tspec/<change-id>/tasks.md` exists.

## Behavior

1. Read the task checklist, the change's durable DSN design item, linked architecture items and ADRs, and the addressed requirements.
2. Implement each pending task, ticking `- [ ]` to `- [x]` as work completes.
3. For each requirement the change addresses, add verification: write a `test` item carrying `verifies:REQ-NNN[]` when a test exists, or note the verification.
4. If implementation materially changes the accepted approach, revise the DSN item with user review and record the ARC items that must be reconciled at archive.
5. Advance the change status: `accepted` → `implemented` once tasks are done, then → `verified` once verification evidence is in place.

## Rules

- Keep the design item and related ARC/ADR items as durable graph records; only the task checklist is temporary.
- Do not modify requirements in place; if a requirement's meaning changes, supersede it.
- Do not mark the arc42 baseline as current until the implemented architecture has been reconciled during archive.

## Next

`tspec-archive <change-id>` once verified.
