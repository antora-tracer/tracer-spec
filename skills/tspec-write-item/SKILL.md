---
name: tspec-write-item
description: >
  Write one traceability item of any declared role (change, requirement, decision, test, or a growth role) and wire its relations.
argument-hint: "<role> [<id>]"
license: MIT
compatibility: antora-tracer
allowed-tools: Bash(antora-tracer:*)
---

Write one item of any declared role.

## Behavior

1. Confirm the role. Declared roles: `change`, `requirement`, `decision`, `test`; growth roles must be declared in `traceability.yml` first.
2. Generate the next ID with `antora-tracer next-id --prefix <PREFIX> -i docs` (prefix from the role: CHG, REQ, DEC, TST).
3. Write the item block into the page for that role, with the appropriate `status`.
4. Wire relations with `<relation>:<ID>[]` macros in the source item.

## Roles, pages, prefixes, initial status

| Role | Page | Prefix | Initial status |
| change | changes.adoc | CHG | proposed |
| requirement | requirements.adoc | REQ | draft |
| decision | decisions.adoc | DEC | proposed |
| test | (any page) | TST | (none) |

## Relation macros

- change → requirement: `addresses:REQ-NNN[]`
- change → decision: `records:DEC-NNN[]`
- requirement → requirement: `supersedes:REQ-OLD[]`
- test → requirement: `verifies:REQ-NNN[]`

The reverse name is derived; either name may be authored.

## Item format

```asciidoc
[#<ID>, item, role=<role>, status=<state>, title="..."]
--
<body>

<relation>:<ID>[]
tracer:links[]
--
```
