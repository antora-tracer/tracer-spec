---
name: review-design
description: >
  Review or create design concepts for a change in the Tracer Spec Workflow.
  Links existing design concepts or creates new ones, then accepts related ADRs.
  Assumes `antora-tracer` CLI is installed.
argument-hint: "<change-id>"
license: MIT
---

# Review Design

Review whether existing design concepts cover a change's requirements and ADRs.
Create new design concepts if needed.

## Trigger

After ADRs are recorded:
- "Review design for CHG-NNN"
- "Does this fit our existing architecture?"
- "What design concept covers this?"

## Preconditions

- A change has at least one accepted requirement.
- ADRs have been recorded for the change.

## Behavior

1. Ask: "Do existing design concepts address all requirements for this change?"
2. For each requirement:
   a. List existing design concepts that address it.
   b. If none exist: ask whether to create a new concept.
3. For each ADR:
   a. Ask whether an existing design concept covers the decision.
   b. If not: create a new design concept or reference an existing one.
4. For new design concepts:
   a. Ask for the concept title.
   b. Ask for the rationale (why this design was chosen).
   c. Generate the next design concept ID using `antora-tracer next-id --prefix DES`.
   d. Create a design concept item block with status `draft`.
   e. Link to requirements with `addresses:REQ-NNN[]`.
   f. Link to ADRs with `derived_from:ADR-NNN[]`.
   g. Write into `docs/design.adoc`.
5. Mark the ADRs as `accepted`.

## Implementation

```bash
antora-tracer next-id --prefix DES -i docs
```

Creates a new item in `docs/design.adoc`:

```asciidoc
[#DES-NNN, item, role=design_concept, status=draft, title="<concept title>"]
--
<description of the stable concept>

Rationale: <why this design was chosen>

addresses:REQ-NNN[]
derived_from:ADR-NNN[]

tracer:links[]
--
```

Then update the ADR:

```asciidoc
[#ADR-NNN, item, role=adr, status=accepted, title="<decision>"]
--
...
leads_to:DES-NNN[]
...
--
```

## Distinction: Change-specific vs. Stable

- **ADR** — specific to the change; captures context and alternatives.
- **Design Concept** — stable; reusable across future changes; documents the architectural knowledge.

An ADR may inform a design concept, but the design concept outlives the change.

## Limitations

- Does not automatically validate coverage (relies on manual review).
- Does not prevent a design concept from being linked to multiple changes (which is intended).
- Does not enforce that all requirements have design coverage.

## Next

After design concepts are accepted:
- `plan-change` — prepare the implementation plan
- `validate-traceability` — verify the complete graph before implementation
