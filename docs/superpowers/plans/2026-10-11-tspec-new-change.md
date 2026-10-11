# `tspec-new-change` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `tspec-propose` with a context-first `tspec-new-change` skill and permit ticketless, requirement-anchored change refinement using optional `externalId` metadata.

**Architecture:** Keep the graph and installer model. Skills author behavior; Antora pages and traceability items document the contract; the existing scaffold discovers skill and command filenames dynamically. A change still requires applicable approved product/component requirements, whether or not it has an external ID.

**Tech Stack:** Markdown Agent Skills, AsciiDoc graph pages, Node.js skill-evaluation runner, `antora-tracer` CLI, Antora build.

**Spec:** `docs/superpowers/specs/2026-10-11-tspec-new-change-design.md`

## Global Constraints

- `externalId` is optional scalar item metadata, not a graph relation.
- Approved product/component requirement anchors remain mandatory for both change creation and refinement.
- If no applicable approved requirement can be identified, stop and ask; do not invent links or create requirements to bypass the gate.
- Change creation writes a proposed item under `docs/modules/specs/pages/changes/`; task lists remain later work under `tspec/<change-id>/`.
- Use the configured role prefix and `antora-tracer next-id`; do not hard-code or reserve an ID.
- Do not create or update external tickets; preserve legacy `trackerId` values without automatic conversion.
- Preserve existing workspace changes; update project-local harness copies only after checking for local customizations.

## Workspace safety

The starting worktree already has modified and untracked user files. Inspect before editing project-local copies; do not use broad staging or commit unrelated paths.

## Review Focus

- Complete context creates one change without asking the user to repeat supplied details.
- An absent `externalId` does not block creation or refinement when approved requirements are linked.
- Missing/ambiguous approved requirement anchors cause a clarification and no graph writes.
- A present `externalId` is preserved where relevant but does not trigger tracker access.
- Fresh project installation exposes the new skill/command and not the old TSPEC entry points.

---

### Task 1: Implement context-first creation and ticketless refinement

**Files:**
- Move: `skills/tspec-propose/` → `skills/tspec-new-change/`
- Move: `commands/propose.md` → `commands/new-change.md`
- Modify: `skills/tspec-explore/SKILL.md`
- Modify: `skills/tspec-refine-change/SKILL.md`
- Modify: `skills/tspec-refine-feature/SKILL.md`
- Modify: `skills/tspec-write-item/SKILL.md`
- Modify: `skills/tspec-new-change/evals/evals.json`
- Modify: `skills/tspec-refine-change/evals/evals.json`
- Modify: `skills/tspec-refine-feature/evals/evals.json`
- Modify: `evals/fixtures/refinement-project/docs/modules/specs/pages/changes/CHG-001-saved-filter.adoc`
- Create: `evals/fixtures/refinement-project/docs/modules/specs/pages/changes/CHG-002-local.adoc`
- Modify: `evals/fixtures/refinement-project/docs/modules/specs/pages/changes.adoc`
- Modify: `evals/fixtures/refinement-project/docs/modules/specs/pages/requirements/REQ-001-product.adoc`
- Modify: `evals/fixtures/refinement-project/docs/modules/specs/pages/requirements/REQ-002-component.adoc`
- Create: `evals/fixtures/refinement-project/docs/modules/specs/pages/requirements/REQ-003-local.adoc`
- Modify: `evals/fixtures/refinement-project/docs/modules/specs/pages/requirements.adoc`
- Create: `test/tspec-new-change-installation.test.js`

**Interfaces:**
- Produces the only change-creation skill, `tspec-new-change`, and the `new-change` command.
- Uses optional `externalId`; obtains the CHG ID from role guidance and `antora-tracer next-id --prefix <PREFIX> -i docs`.
- `tspec-refine-change` uses approved requirements linked from the change and no longer requires an external ID; it still refuses missing requirement anchors.

- [ ] Add evaluation cases for ticketless refinement with approved requirement links and for missing requirement anchors; assert the latter asks and leaves the fixture unchanged.
- [ ] Run the ticketless refinement case against the current skill to confirm the existing external-ticket gate blocks it.
- [ ] Add an installation assertion for the new skill and command, with no old skill/command in a fresh initialized project; run `node --test test/tspec-new-change-installation.test.js` and confirm the new assertions fail before the rename.
- [ ] Rename the source skill directory and command; update the skill frontmatter, context-first intake, missing-information questions, approval preview, dynamic ID lookup, canonical write path, and validation step.
- [ ] Update `tspec-explore` to hand off confirmed change sketches to `tspec-new-change`.
- [ ] Replace active `featureTicketId` writers with optional `externalId`; update `tspec-refine-change` to select approved anchors through `addresses` and proceed without external ID only when those anchors exist.
- [ ] Add creation/refinement evaluation cases for external-ID-present, external-ID-absent with approved anchors, and no-anchor clarification. Use `CHG-002` without `externalId` and a local approved component requirement `REQ-003`; make `CHG-002` address it and include both in the fixture collections.
- [ ] Run `node scripts/evaluate-skills.js --skill tspec-new-change --scenario skills/tspec-new-change/evals/evals.json --output /tmp/tspec-new-change-eval`, `node scripts/evaluate-skills.js --skill tspec-refine-change --scenario skills/tspec-refine-change/evals/evals.json --output /tmp/tspec-refine-change-eval`, and `node scripts/evaluate-skills.js --skill tspec-refine-feature --scenario skills/tspec-refine-feature/evals/evals.json --output /tmp/tspec-refine-feature-eval`; include explicit preview approval in successful write scenarios, inspect outputs, and confirm ticketless items do not gain an `externalId` implicitly.
- [ ] Run `node --test test/tspec-new-change-installation.test.js` and confirm a fresh project installs the new skill and command, not the old entries.

### Task 2: Migrate workflow documentation and project installs

**Files:**
- Modify: `README.md`, `TEMPLATES.md`, `templates/README.md`, `templates/AGENTS.md`
- Modify: `docs/modules/specs/pages/changes.adoc`, `decisions.adoc`, `requirements.adoc`
- Modify: `docs/modules/specs/pages/getting-started.adoc`, `index.adoc`, `how-to/drive-the-workflow.adoc`
- Modify: `docs/modules/specs/pages/reference/config.adoc`, `reference/skills.adoc`, `explanation/workflow.adoc`, `guidance/change.adoc`
- Modify: `docs/modules/specs/pages/requirements/REQ-015-record-tracker-issue-for-change.adoc`
- Modify: `docs/modules/specs/pages/requirements/REQ-016-create-or-link-tracker-issue.adoc`
- Modify: `docs/modules/specs/pages/requirements/REQ-022-document-workflow-skills.adoc`
- Modify: `docs/modules/specs/pages/requirements/REQ-030-refine-ticket-into-traceable-feature-spec.adoc`
- Modify: `docs/modules/specs/pages/requirements/REQ-033-propose-independent-feature-implementation-changes.adoc`
- Modify: `docs/modules/specs/pages/requirements/REQ-034-refine-change-before-creating-tasks.adoc`
- Modify: `docs/modules/specs/pages/decisions/DEC-009-tracker-link-as-attribute.adoc`
- Modify: `docs/modules/specs/pages/decisions/DEC-017-separate-feature-and-change-refinement.adoc`
- Modify: `docs/modules/specs/pages/decisions/DEC-011-centralize-tracker-in-one-skill.adoc`
- Modify: `docs/modules/specs/pages/changes/CHG-012-requirement-driven-architecture-records.adoc` (rename its current skill reference only)
- Refresh only the relevant project-local skill/command entries under `.omp/`, `.claude/`, and `.agents/`, after checking for local edits.
  - Rename: `.agents/skills/tspec-propose/` → `.agents/skills/tspec-new-change/`
  - Rename: `.omp/skills/tspec-propose/` → `.omp/skills/tspec-new-change/`
  - Rename: `.claude/skills/tspec-propose/` → `.claude/skills/tspec-new-change/`
  - Rename: `.omp/commands/tspec-propose.md` → `.omp/commands/tspec-new-change.md`
  - Rename: `.claude/commands/tspec/propose.md` → `.claude/commands/tspec/new-change.md`

**Interfaces:**
- Consumes Task 1's names and behavior: `tspec-new-change`, optional `externalId`, and requirement-anchored ticketless refinement.
- Produces matching current docs, graph guidance, requirements/decisions, and project-local entry points; no `src/scaffold.js` change is expected.

- [ ] Update current workflow references and collection prompts; send requirement/decision authoring to `tspec-write-item` rather than the change skill.
- [ ] Update the listed draft requirements and proposed decisions to state the optional `externalId` semantics and ticketless-but-requirement-anchored refinement behavior; update only the renamed-skill reference in proposed `CHG-012`.
- [ ] Replace old skill/metadata names in current examples and documentation; retain verified historical change records and legacy `trackerId` values.
- [ ] Compare local harness copies with canonical sources, refresh only TSPEC skill/command entries, and preserve unrelated/custom files.
- [ ] Run `npm run validate` and `npm run build`; confirm both complete successfully and the generated site contains only current workflow guidance.
- [ ] Compare refreshed project-local TSPEC copies with canonical sources; confirm old TSPEC names are gone and unrelated/custom entries remain unchanged.
