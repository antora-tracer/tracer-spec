# `tspec-new-change` and optional external IDs

## Context

The workflow already has `tspec-propose`, which creates one durable change item linked to an existing feature ticket and approved product/component requirements. The user wants a context-first entry point named `tspec-new-change`, so the creation skill should be renamed rather than duplicated.

Canonical change items remain under `docs/modules/specs/pages/changes/`. `tspec/<change-id>/tasks.md` remains temporary execution work created later by `tspec-refine-change`.

The shared `featureTicketId` item metadata currently associates graph items with an external feature ticket. `tspec-refine-change` currently refuses a change without that metadata. The user chose to replace this field with optional `externalId` and allow refinement without an external ticket when approved requirement anchors are available.

## Goals

- Replace `tspec-propose` with `tspec-new-change` as the sole change-creation skill.
- Use conversation and graph context before asking the user for change details.
- Allow change creation and refinement without an external ID when applicable approved product/component requirements exist.
- Keep change creation distinct from detailed software requirement refinement and task creation.
- Preserve traceability: every proposed change must address existing approved requirements.

## Design

### Context-first change intake

Trigger the skill when the user wants one implementation change recorded, either directly or after confirming a `tspec-explore` sketch. Read the conversation and relevant graph context first. Extract rationale, observable outcome, out-of-scope boundaries, applicable approved requirements, and an `externalId` when one is present in context. Ask only for missing or ambiguous information; do not invent the change's purpose or its requirement links. Do not read a tracker to fill gaps; `tspec-track` remains a separate, explicit workflow. Refuse to turn an umbrella request into several changes automatically.

Before writing, show the proposed change item, identifier, requirement links, optional external ID, and destination. Save only after the user approves the preview.

### Change item creation

Resolve the configured change-role guidance and ID prefix, then obtain the next identifier with `antora-tracer next-id --prefix <PREFIX> -i docs`. Do not hard-code or reserve an ID in advance.

Write one `status=proposed` change item to `docs/modules/specs/pages/changes/`, link applicable approved product/component requirements with `addresses:REQ-NNN[]`, and add its include to `changes.adoc`. Validate with `antora-tracer validate -i docs --config traceability.yml` before reporting the identifier and path.

Do not create software-level requirements or `tspec/<id>/tasks.md` here. Record a decision only when the change entails a material specification choice. After creation, hand off to `tspec-refine-change`.

### Optional `externalId` metadata

Replace `featureTicketId` with the optional scalar item metadata `externalId` on relevant canonical graph items. It identifies an existing external item shared by related graph items; it is metadata, not a graph relation. The value is not required for local work, and its presence alone does not trigger tracker access. Do not create or update external tickets as part of change creation or refinement.

Keep `tspec-track` limited to its configured GitHub/Jira ticket operations. The `externalId` rename does not add providers or change those operations. Preserve legacy `trackerId` values; do not infer or automatically convert them.

### Refining without an external ticket

`tspec-refine-change` must not stop solely because `externalId` is absent. Find the change's requirement anchors through its existing `addresses` links and confirm that the applicable product/component requirements are approved. Use those anchors to define the detailed software-level requirements and retain the existing estimatability gate before creating the temporary task checklist.

If no applicable approved requirement can be identified, stop and ask for clarification or for the requirement to be established first. Do not create an unanchored change, invent requirement links, or create requirements merely to bypass this gate. The external ID is not a substitute for requirement traceability.

### Cutover

Rename the source skill directory and command to `tspec-new-change` / `new-change`; remove the old skill and command names rather than maintaining aliases. Update the `tspec-explore` handoff, active workflow documentation, skill inventory, examples, and evaluation fixtures. Route change collection guidance to `tspec-new-change`; route standalone requirement/decision authoring to `tspec-write-item`.

Update draft requirements `REQ-015`, `REQ-016`, `REQ-022`, `REQ-030`, `REQ-033`, and `REQ-034`, and proposed decisions `DEC-009`, `DEC-011`, and `DEC-017`, to encode the optional `externalId` and ticketless-but-requirement-anchored refinement contract. Update proposed change `CHG-012` only to replace its renamed-skill reference.

Refresh the project-local `.omp`, `.claude`, and `.agents` skill/command copies after checking for local edits; remove only the old TSPEC skill and command entries. The scaffold discovers skill and command files dynamically, so no installer code change is expected.

Do not rewrite verified historical change records or auto-convert legacy `trackerId` values. The current graph contains no `featureTicketId` item-header values; the evaluation fixture does and must use `externalId` after cutover.

## Non-goals

- Creating, importing, or updating external tickets; changing ticket status, estimate, or backlog position.
- Creating detailed software requirements or execution tasks during change creation.
- Supporting refinement without applicable approved product/component requirement anchors.
- Converting legacy `trackerId` metadata automatically.
- Changing Antora Tracer's item grammar or adding a new dependency.

## Verification

- Evaluate context-complete creation with an `externalId` and approved requirements.
- Evaluate ticketless creation/refinement with approved requirements and no `externalId`.
- Evaluate missing or ambiguous change context and missing approved requirement anchors; the skill must ask and leave graph files unchanged.
- Validate the resulting graph and smoke-check installation of the renamed skill and command.
- Build the documentation site after updating its current workflow references.

## Assumptions

- `externalId` is an opaque identifier for an external item; the configured provider and existing `tspec-track` operation determine whether it can be read or updated.
- Approved requirement anchors remain mandatory for both change creation and refinement, whether or not an external item exists.
