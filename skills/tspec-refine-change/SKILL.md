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

1. Read the selected change, its `featureTicketId`, and relevant graph context. Confirm the change is linked to an existing feature ticket and identify applicable approved `level=product` and `level=component` requirements. If its feature link is absent or ambiguous, stop and resolve it with the user; do not guess or access tracker state.
2. Work with the user to define this change's rationale, observable outcome, bounded scope, and out-of-scope items. Select only the approved product/component requirements this slice actually addresses; link them with `addresses:REQ-NNN[]`.
3. Plan testable `role=requirement, level=software` items and relations to the applicable requirement they detail using `refines:REQ-NNN[]`. State observable behavior, boundaries, and BDD examples as prose within each requirement. Tests remain separate `test` items only when requested; do not create separate scenario-role items. Preserve `featureTicketId` on the change and its related requirements.
4. Show the proposed change/requirement edits, relations, IDs, and paths. Ask before saving new or materially revised graph items. Save only this change's approved refinements and collection includes, then run `antora-tracer validate -i docs --config traceability.yml`.
5. Ask whether the user considers this slice estimatable. Mark the change `refined` only when the user confirms its scope and testable requirements are sufficiently complete to estimate; otherwise leave its prior status, report concrete gaps, and create no checklist. Estimatable means the team can size this bounded slice, not that a tracker estimate was entered.
6. Only after marking an estimatable change `refined`, create `tspec/<change-id>/tasks.md` as a temporary actionable checkbox list (`- [ ]`) derived from the refined requirements. No epic or story item is required.

## Rules

- Handle one change per invocation. Never refine siblings or use ticket status as the change's readiness signal.
- Create/refine software-level requirements only here; feature-level product/component requirements belong to `tspec-refine-feature`.
- Do not create external tickets, update ticket descriptions/status/estimates, or require epics/stories.
- Keep BDD examples in requirement prose; verification test items remain distinct from requirements.
