---
name: tspec-propose
description: >
  Use when the user confirms an implementation change sketch or wants to add one independently deliverable change linked to an existing feature ticket.
argument-hint: "<change-id or title>"
license: MIT
compatibility: antora-tracer
allowed-tools: Bash(antora-tracer:*)
---

Record one implementation change linked to an existing feature ticket and its established product/component requirements.

## Behavior

1. Confirm rationale, observable outcome, out-of-scope boundaries, the existing `featureTicketId`, and which approved product/component requirements this change addresses. A change is one independently deliverable slice; do not create an umbrella or a batch of changes.
2. Resolve the `change` role guidance with `antora-tracer role-guidance change --config traceability.yml --content` and read `roleGuidance.change.idPrefix` from `traceability.yml`. Fall back to the item format below only when there is no change guidance.
3. Generate one change ID with `antora-tracer next-id --prefix <PREFIX> -i docs`.
4. Write one change item under `docs/modules/specs/pages/changes/` using the role template. Include `featureTicketId=<existing-id>` in its block header and add `addresses:REQ-NNN[]` for applicable established product/component requirements. Add its `include::changes/<file>.adoc[]` line to `changes.adoc`.
5. Run `antora-tracer validate -i docs --config traceability.yml`; fix any dangling relation or validation error before reporting the change ID and path.

## Fallback change format

```asciidoc
[#CHG-NNN, item, role=change, status=proposed, featureTicketId=FEAT-NNN, title="..."]
--
Rationale:: Why this independently deliverable change is needed.
Outcome:: What observable result it produces.
Out-of-scope:: What it excludes.

addresses:REQ-NNN[]
tracer:links[]
--
```

## Rules

- Link only to existing feature tickets and established product/component requirements. `featureTicketId` is shared scalar metadata, not a graph relation.
- Do not create, import, link, or change status/estimate on external tickets; delegate ticket reading or approved refinement-section updates to `tspec-track` through `tspec-refine-feature`.
- Do not create detailed software requirements, task checklists, epics, or stories here. Refine software behavior and create tasks later with `tspec-refine-change`.
- Write decisions only when necessary for this change; never create requirements or decisions just to fill out a template.

## Next

Refine this one slice with `tspec-refine-change <change-id>`. After its refined gate, the existing human acceptance gate and `tspec-apply-change` lifecycle still apply.
