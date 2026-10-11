# AGENTS.md

This project uses the **Tracer Spec Workflow** (spec-driven development on
Antora Tracer). Durable artifacts are traceable Antora/AsciiDoc items published
as pages under `docs/modules/specs/pages/`, validated with `antora-tracer`.

## Durable Artifacts Directory

Durable artifacts (changes, requirements, decisions) are written to
`docs/modules/specs/pages/`.

## Skills

`tracer-spec init` installs the workflow skills into your agent harness
directories (`.omp/skills/`, `.claude/skills/`, `.agents/skills/`).
Re-run `tracer-spec init --tools <ids>` to add or refresh them. The skills:

| Skill | Purpose |
|-------|---------|
| `tspec-explore` | Explore a feature idea and shape its change sketch |
| `tspec-refine-feature` | Refine an existing feature ticket into product-level graph items |
| `tspec-new-change` | Record a context-first implementation change against approved requirements |
| `tspec-refine-change` | Refine a change into detailed software requirements and tasks |
| `tspec-track` | Read an existing ticket or update its user-approved refinement section |
| `tspec-apply-change` | Implement the change's refined tasks and advance state |
| `tspec-archive` | Validate and close a verified change |
| `tspec-validate` | Validate the traceability graph |
| `tspec-write-item` | Write one item of any declared role |

## Workflow

```
tspec-explore → tspec-refine-feature → tspec-new-change → tspec-refine-change → tspec-apply-change → tspec-archive
```

One existing feature ticket may be associated with many independent changes
through shared optional `externalId=<id>` metadata on graph items. `tspec-new-change`
does not author detailed software requirements or tasks; run
`tspec-refine-change` before creating a change's task checklist.

- The graph is the source of truth for specifications. The external feature
  ticket remains authoritative for backlog position, status, and estimate.
  Durable artifacts are pages in `docs/modules/specs/pages/`; temporary tasks
  go in `tspec/<change-id>/`.
- `tspec-track --read <feature-ticket-id>` reads an existing ticket.
  `--update-refinement` requires approval of the exact section preview and
  changes only the unique `TSPEC refinement` section, preserving all other
  ticket content. The workflow does not create/import tickets or update status,
  backlog position, or estimates.
- Take role names, relation types, and ID prefixes from `traceability.yml`
  (or its `extends:` preset) — never invent them.
