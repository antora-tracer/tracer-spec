---
name: tspec-refine-feature
description: >
  Use when an existing feature ticket needs scope, use cases, product/component requirements, readiness, or a TSPEC refinement summary.
argument-hint: "<feature-ticket-id>"
license: MIT
compatibility: antora-tracer
allowed-tools: Bash(antora-tracer:*, gh:*, curl:*, node:*)
---

Refine one existing feature ticket into durable use cases and product/component requirements; keep the graph canonical and the tracker limited to an approved summary section.

## Process

1. Read the local graph and `traceability.yml`, then `tspec.yml`. Get ticket title/body with `tspec-track --read <feature-ticket-id>`. If `tracker.provider: none`, use only ticket text supplied by the user and prepare a manual section instead. Never infer ticket contents or contact an unconfigured provider.
2. Work interactively with the user to define candidate use cases, actors/goals/triggers/observable flows, and testable product and component requirements. Resolve what can be read from the repo; label assumptions and keep unanswered questions visible. Use the existing `use_case` and `requirement` roles. Requirement levels are exactly `product`, `component`, or `software` attributes on role `requirement`; feature refinement creates only product/component levels. BDD examples stay as prose inside requirements, not separate scenario artifacts.
3. Plan all IDs, titles, item paths, `externalId=<id>` headers for externally linked items, and graph links before writing: each use case `leads_to` its derived requirement; a more detailed requirement `refines` its broader requirement. Follow role guidance and collection pages. Show the complete proposed graph with content, relations, paths, readiness, assumptions, and unanswered questions. Ask explicit approval to save these graph items; do not write until approved.
4. Write only the approved items, updating collection includes. Unresolved questions are recorded on the relevant draft items or as explicit refinement notes; partial approved work remains `status=draft`. Run `antora-tracer validate -i docs --config traceability.yml`; resolve validation errors before preparing any ticket section. The graph is canonical and stays saved if a later tracker update fails.
5. Ask whether the user considers the feature complete and estimatable. Only after the user explicitly confirms both and reviews the requirements, advance every eligible requirement through the configured `draft -> reviewed -> approved` transitions. Do not infer estimatability, set estimates, or prioritize work. If gaps remain, report `needs refinement` and the specific open questions; keep affected requirements draft. Report readiness as `estimatable` only after that user confirmation.
6. Prepare a concise exact ticket section headed `## TSPEC refinement` for Markdown, or an equivalent ADF level-2 heading. Include summary, readiness (`estimatable` or `needs refinement`) and gaps, plus each graph item's ID, title, and repository-relative path. Show the complete section and ask for separate explicit approval to update the ticket.
7. With provider configured, after approval invoke `tspec-track --update-refinement <feature-ticket-id>`. It must re-read and abort/re-preview if the body changed since preview. If the body is unchanged and safe, only the unique section is replaced; on failure, report that the graph remains canonical and provide the exact section for retry. With provider `none`, do not invoke a provider: return the approved section for the user to paste manually.

## Readiness and safety

- An incomplete but user-approved graph is useful: retain approved partial items as drafts and questions, rather than refusing to save the partial refinement.
- Never update the ticket before graph validation or without the separate approval for its exact section. Graph-item approval is not ticket-update approval.
- Ticket description summarizes graph references; it does not replace the graph or carry a second full copy of the requirements.
- Never create a feature ticket, set estimates, or change backlog/status state.
