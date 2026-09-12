---
name: tspec-propose
description: >
  Propose a change in the Tracer Spec Workflow: write the change item, its requirements, and its decisions atomically, plus a temporary task checklist. Assumes the antora-tracer CLI is installed.
argument-hint: "<change-id or title>"
license: MIT
compatibility: antora-tracer
allowed-tools: Bash(antora-tracer:*)
---

Propose a change: create the durable change item, the requirements it addresses, the decisions it records, and the temporary task checklist — all in one pass so relation macros never dangle.

## Behavior

1. Confirm the change rationale, intended outcome, and out-of-scope boundaries.
2. Generate the next change ID with `antora-tracer next-id --prefix CHG -i docs`.
3. Write the change item into `docs/modules/specs/pages/changes.adoc`, status `proposed`, with `Rationale::`, `Outcome::`, and `Out-of-scope::` labeled-list fields.
4. For each requirement the change introduces, generate a `REQ` ID and write a `draft` requirement item into `requirements.adoc`, then add `addresses:REQ-NNN[]` to the change.
5. For each decision the change records, generate a `DEC` ID and write a `proposed` decision item into `decisions.adoc`, then add `records:DEC-NNN[]` to the change.
6. Write the task checklist to `tspec/<change-id>/tasks.md`.
7. Report the change ID and where each item landed.

## Item format

```asciidoc
[#CHG-NNN, item, role=change, status=proposed, title="..."]
--
Rationale:: Why this change is needed.
Outcome:: What the change produces.
Out-of-scope:: What the change excludes.

addresses:REQ-NNN[]
records:DEC-NNN[]
tracer:links[]
--
```

## Rules

- Requirements state WHAT, never how; use SHALL; scenarios stay as prose in the body.
- Decisions follow the decision guidance template: Context, Options (per-option pros and cons), Decision, Rationale, and Consequences.
- A change must address at least one requirement to later reach `accepted`.
- Write all items together before validating; the change, requirements, and decisions land atomically.

## Next

After the user reviews and accepts: `tspec-apply <change-id>`.
