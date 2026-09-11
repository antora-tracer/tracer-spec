# AGENTS.md

## Durable Artifacts Directory

Durable artifacts (changes, use cases, requirements, design concepts, ADRs)
are written to `docs/modules/specs/pages/`.

## Project

## Development

## Commit Convention

This project follow https://www.conventionalcommits.org/[Conventional Commits].
All commit message must use this format:

```
<type>(<scope>): <description>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`, `perf`

Common scopes: `parser`, `cli`, `preset`, `matrix`, `neo4j`, `antora`, `config`, `graph`

Examples: `feat(parser): support escaped inline macros`, `fix(cli): show file location in validation errors`

## Documentation Framework

Example site doc follow https://diataxis.fr[Diátaxis] — framework that split doc into four mode, each serve different reader need. Every page in example site belong to exactly one mode:

| Mode | Purpose | Reader asks | Example pages |
|---|---|---|---|
| **Tutorial** | Learn-oriented, step-by-step | "Can you teach me to…?" | `getting-started.adoc` |
| **How-to Guides** | Task-oriented, solve a problem | "How do I…?" | `how-to/custom-domain-model.adoc` |
| **Reference** | Info-oriented, exhaustive | "What does X do?" | `reference/cli.adoc`, `reference/api.adoc` |
| **Explanation** | Understand-oriented, background | "Why does it work that way?" | `architecture.adoc`, `adr/`, `quality/` |

Fifth section, **Self-Traceability**, group page that show extension tracing its own dev artifact (requirement, use case, test plan, dashboard). Not user-facing doc — extension applied on itself.

**Key rule when add or edit doc:**

- One sentence per line. See https://asciidoctor.org/docs/asciidoc-recommended-practices/#one-sentence-per-line[AsciiDoc Recommended Practices] — make pull request diff line-level, review easier.
- One page = one mode. No mix tutorial step, how-to instruction, reference listing, and explanation in same page.
- Tutorial no link out to Reference or Explanation — it a guided path.
- How-to, Reference, Explanation page cross-reference each other freely.
- How-to page title use the "How to <verb> <object>" format.
- Reference page exhaustive — every option, flag, attribute get documented.

## Architecture

