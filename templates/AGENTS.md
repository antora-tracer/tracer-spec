# AGENTS.md

This project uses the **Tracer Spec Workflow** (spec-driven development on
Antora Tracer). Durable artifacts are traceable Antora/AsciiDoc items written
as partials under `docs/modules/specs/partials/`, included by their role page
under `docs/modules/specs/pages/`, and validated with `antora-tracer`.

## Durable Artifacts Directory

Durable artifacts (requirements, changes, architecture items, change designs, decisions, and ADRs) are written to
`docs/modules/specs/partials/<role>/` and included by `docs/modules/specs/pages/<role>.adoc`; temporary execution tasks go in `tspec/<change-id>/`.

## Skills

`tspec init` installs the workflow skills into your agent harness
directories (`.omp/skills/`, `.claude/skills/`, `.agents/skills/`).
Re-run `tspec install --tools <ids>` to add or refresh harness files without
re-scaffolding the project; `tspec init --tools <ids>` does the same but also
writes scaffold files. The skills:

| Skill | Purpose |
|-------|---------|
| `tspec-explore` | Explore a feature idea and shape its change sketch |
| `tspec-refine-feature` | Refine an existing feature ticket into product-level graph items |
| `tspec-new-change` | Record a context-first implementation change against approved requirements |
| `tspec-refine-change` | Refine a change into software requirements, durable design, and tasks |
| `tspec-track` | Read an existing ticket or update its user-approved refinement section |
| `tspec-apply-change` | Implement the change's refined tasks and advance state |
| `tspec-archive` | Validate and close a verified change |
| `tspec-validate` | Validate the traceability graph |
| `tspec-write-item` | Write one item of any declared role |

## Workflow

```
tspec-explore → tspec-refine-feature → tspec-new-change → tspec-refine-change → tspec-apply-change → tspec-archive
```

One existing feature ticket may be associated with many independent changes through shared optional `externalId=<id>` metadata. `tspec-new-change` requires applicable approved requirements but does not author detailed software requirements or design items.
Run `tspec-refine-change` to create software requirements and a durable design item before its temporary checklist.
- The graph is the source of truth for specifications. It includes architecture items, change designs, ADRs, requirements, and decisions; the external feature ticket remains authoritative for ticket status, backlog position, and estimate.
  Durable items are partials under `docs/modules/specs/partials/<role>/`; temporary tasks go in `tspec/<change-id>/`.
- `tspec-track --read <feature-ticket-id>` reads an existing ticket.
  `--update-refinement` requires approval of the exact section preview and
  changes only the unique `TSPEC refinement` section, preserving all other
  ticket content. The workflow does not create/import tickets or update status,
  backlog position, or estimates.
- Take role names, relation types, and ID prefixes from `traceability.yml`
  (or its `extends:` preset) — never invent them.
