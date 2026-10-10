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

1. Confirm the role and, for feature-related items, the existing shared `featureTicketId`. Declared core roles: `change`, `requirement`, `decision`, `test`; growth roles including `use_case` must first be declared in `traceability.yml`.
2. Generate the next ID with `antora-tracer next-id --prefix <PREFIX> -i docs` (prefix from role guidance; core prefixes include CHG, REQ, DEC, TST, while `use_case` uses UC).
3. Write the item block to its role collection with appropriate `status`, and include `featureTicketId=<id>` in the header when it belongs to an existing external feature ticket.
4. Wire configured relations to existing IDs with `<relation>:<ID>[]` macros.

## Roles, collections, prefixes, initial status

| Role | Collection | Prefix | Initial status |
| change | changes.adoc | CHG | proposed |
| requirement | requirements.adoc | REQ | draft |
| decision | decisions.adoc | DEC | proposed |
| use_case | use-cases.adoc | UC | none |
| test | (any page) | TST | none |

## Relation macros

- use_case → requirement: `leads_to:REQ-NNN[]`
- change → requirement: `addresses:REQ-NNN[]`
- change → decision: `records:DEC-NNN[]`
- requirement → requirement: `refines:REQ-PARENT[]`, `supersedes:REQ-OLD[]`
- test → requirement: `verifies:REQ-NNN[]`

Use only relations enabled by the project's `traceability.yml`; the reverse name is derived and may be authored when configured.

## Item format

```asciidoc
[#<ID>, item, role=<role>, status=<state>, featureTicketId=<existing-ticket-id>, title="..."]
--
<body>

<relation>:<ID>[]
tracer:links[]
--
```

## Guidelines

- One sentence per line.
