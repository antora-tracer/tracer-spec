---
name: tspec-apply
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

1. Read `tspec/<change-id>/tasks.md`.
2. Implement each pending task, ticking `- [ ]` to `- [x]` as you go.
3. For each requirement the change addresses, add verification: write a `test` item carrying `verifies:REQ-NNN[]` when a test exists, or note the verification.
4. Advance the change status: `accepted` → `implemented` once tasks are done, then → `verified` once verification evidence is in place.

## Rules

- Do not modify requirements in place; if a requirement's meaning changes, supersede it.
- Tasks in `tspec/` are temporary; nothing there is a durable item.

## Next

`tspec-archive <change-id>` once verified.
