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

1. Confirm the role is declared in `traceability.yml` and resolve its guidance page and ID prefix with `antora-tracer role-guidance <role> --config traceability.yml --content`. Declared roles include `change`, `requirement`, `decision`, `test`, `use_case`, `architecture`, `design`, and `adr`.
2. Generate the next ID with `antora-tracer next-id --prefix <PREFIX> -i docs`; prefixes come from role guidance and are not reserved.
3. Write the item under its role collection with the status and fields from that role's guidance. Include `externalId=<id>` only when it belongs to an existing external item.
4. Add only configured relation macros to existing IDs. Use a configured reverse relation when the canonical edge points from another role.

## Roles, collections, prefixes, initial status

| Role | Collection | Prefix | Initial status |
| change | changes.adoc | CHG | proposed |
| requirement | requirements.adoc | REQ | draft |
| decision | decisions.adoc | DEC | proposed |
| use_case | use-cases.adoc | UC | none |
| architecture | architecture.adoc | ARC | accepted |
| design | designs.adoc | DSN | proposed |
| adr | adrs.adoc | ADR | proposed |
| test | tests.adoc or a test page | TST | none |


## Relation macros

- use_case → requirement: `leads_to:REQ-NNN[]`
- change → requirement: `addresses:REQ-NNN[]`
- change → decision, design, or adr: `records:<ID>[]`
- change → architecture: `updates:ARC-NNN[]`
- architecture → architecture: `composes:ARC-NNN[]`; architecture → requirement: `realizes:REQ-NNN[]`
- architecture → ADR and change → design reverse links: `decided_by:ADR-NNN[]`, `recorded_by:CHG-NNN[]`
- design → requirement, architecture, or adr: `realizes:REQ-NNN[]`, `affects:ARC-NNN[]`, `references:ADR-NNN[]`
- adr → requirement or architecture: `addresses:REQ-NNN[]`, `decides:ARC-NNN[]`; adr → change reverse link: `recorded_by:CHG-NNN[]`
- decision → decision: `supersedes:DEC-NNN[]`
- requirement → requirement: `refines:REQ-PARENT[]`, `supersedes:REQ-OLD[]`
- test → requirement: `verifies:REQ-NNN[]`

Use only relations enabled by the project's `traceability.yml`; configured reverse names may also be authored.

## Item format

```asciidoc
[#<ID>, item, role=<role>, status=<state>, title="..."]
--
<body>

<relation>:<ID>[]
tracer:links[]
--
```

## Guidelines

- One sentence per line.
