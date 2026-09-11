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
| `tspec-explore` | Enter explore mode; shape a change sketch without writing |
| `tspec-propose` | Write a change, its requirements, and its decisions atomically |
| `tspec-apply` | Implement the change's tasks and advance its state |
| `tspec-archive` | Validate and close a verified change |
| `tspec-validate` | Validate the traceability graph |
| `tspec-write-item` | Write one item of any declared role |

## Workflow

```
tspec-explore → tspec-propose → tspec-apply → tspec-archive
```

## Rules

- The graph is the source of truth. Durable artifacts are pages in
  `docs/modules/specs/pages/`; temporary tasks go in `tspec/<change-id>/`.
- Always run `antora-tracer validate -i docs --config traceability.yml` after
  changing the docs.
- Take role names, relation types, and ID prefixes from `traceability.yml`
  (or its `extends:` preset) — never invent them.
