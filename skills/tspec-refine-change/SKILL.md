---
name: tspec-refine-change
description: >
  Use when one independently deliverable implementation change needs bounded scope, detailed software requirements, test examples, or an estimatability decision.
argument-hint: "<change-id>"
license: MIT
compatibility: antora-tracer
allowed-tools: Bash(antora-tracer:*)
---

Refine exactly one implementation change into a bounded, estimatable slice and testable software-level requirements.

## Process

1. Read the selected change, relevant requirements, `traceability.yml`, the arc42 baseline, and linked architecture and decision items. Identify applicable approved product/component requirements through `addresses` links; stop if none apply.
2. Work with the user to define rationale, outcome, bounded scope, and exclusions. Link only applicable approved product/component requirements with `addresses:REQ-NNN[]`.
3. Plan testable software-level requirements, each refining its applicable approved requirement with `refines`. Read the arc42 baseline and linked architecture and ADR items, then create one durable DSN design item before the temporary task list. Record material alternatives and trade-offs, or state that the change has no architecture impact.
If a costly-to-reverse architecture choice remains unresolved, ask the user to select an option; do not finalize the design or create tasks until the user decides. Record the selected choice as an ADR linked to the change, relevant requirements, and affected architecture items. Keep domain/business choices as `decision` items; do not create ADRs for routine choices.
4. Show the proposed requirements, complete design item, and any ADR items with IDs, relations, and paths. Ask before saving. Save only the approved items, add their collection includes, then run `antora-tracer validate -i docs --config traceability.yml`.
5. Ask whether the user considers the slice estimatable. Mark the change `refined` only when the user confirms the scope and testable requirements are complete enough to estimate; otherwise keep its prior status, report gaps, and create no checklist.
6. Only after marking an estimatable change `refined`, create `tspec/<change-id>/tasks.md` from the accepted requirements and durable design. Tasks remain temporary; the design remains in the graph after archive.


## Rules

- Handle one change per invocation. Never refine siblings or use ticket status as the change's readiness signal.
- Create/refine software-level requirements only here; product/component requirements belong to feature refinement.
- Do not create external tickets, update ticket descriptions/status/estimates, or require epics/stories.
- Keep behavior scenarios in requirement prose; use distinct test items only when requested.
