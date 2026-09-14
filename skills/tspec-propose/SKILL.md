---
name: tspec-propose
description: >
  Propose a change in the Tracer Spec Workflow: write the change item, its requirements, and its decisions, plus a temporary task checklist. Use this whenever the user wants to record or propose a change in the traceability graph — "propose a change", "add a change item", "record this decision" — or after tspec-explore confirms a sketch. Assumes the antora-tracer CLI is installed.
argument-hint: "<change-id or title>"
license: MIT
compatibility: antora-tracer
allowed-tools: Bash(antora-tracer:*)
---

Propose a change: create the durable change item, the requirements it addresses, the decisions it records, and the temporary task checklist — all in one pass so relation macros never dangle.

## Behavior

1. Confirm the change rationale, intended outcome, and out-of-scope boundaries.
2. Resolve role guidance: for `change`, `requirement`, and `decision`, run `antora-tracer role-guidance <role> --config traceability.yml --content` to get the role's item template, and read its prefix from `roleGuidance.<role>.idPrefix` in `traceability.yml`. Fall back to the item formats below when a role has no guidance.
3. Generate every ID up front: `antora-tracer next-id --prefix <PREFIX> -i docs` for the change and for each requirement and decision it introduces.
4. Write each item as its own file under `docs/modules/specs/pages/` — `changes/CHG-NNN-<slug>.adoc`, `requirements/REQ-NNN-<slug>.adoc`, `decisions/DEC-NNN-<slug>.adoc` (slug = kebab-case of the title) — filling the role's resolved template, then append the matching `include::<dir>/<file>.adoc[]` line to `changes.adoc`, `requirements.adoc`, `decisions.adoc`. Wire `addresses:REQ-NNN[]` and `records:DEC-NNN[]` into the change in the same pass.
5. Write the task checklist to `tspec/<change-id>/tasks.md` as Markdown checkboxes (`- [ ]`).
6. If `tspec.yml` declares a tracker other than `none`, delegate linking or creating the tracker issue to `tspec-track` (`--link` when the issue already exists, `--create` otherwise) and record the returned identifier as `trackerId=` on the change item's block header.
7. Run `antora-tracer validate -i docs --config traceability.yml`; fix any dangling relation or error before reporting.
8. Report the change ID and where each item landed.

## Item format

Field names come from each role's guidance, not from this file; the templates below are the fallback when a role has no guidance.

Change (fallback):

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

Requirement (fallback):

```asciidoc
[#REQ-NNN, item, role=requirement, status=draft, title="..."]
--
The system SHALL <capability>.

tracer:links[]
--
```

## Rules

- Requirements state WHAT, never how; use SHALL; scenarios stay as prose in the body.
- Decisions follow the decision guidance template: Context, Options (per-option pros and cons), Decision, Rationale, and Consequences.
- A change must address at least one requirement to later reach `accepted`.
- Generate all IDs before writing anything, and write every item plus its `include::` line in one pass so relation macros never dangle.

## Next

A human advances the change `proposed → refined → accepted` (acceptance is a manual gate; validation enforces it). Then `tspec-apply <change-id>`.
