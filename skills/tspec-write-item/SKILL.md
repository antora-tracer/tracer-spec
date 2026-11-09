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
3. Write the item as a partial under `docs/modules/specs/partials/<role>/` with the status and fields from that role's guidance, then add its `include::partial$<role>/<file>.adoc[]` line to the role's listing page. Include `externalId=<id>` only when it belongs to an existing external item.
4. Add only configured relation macros to existing IDs. Use a configured reverse relation when the canonical edge points from another role.

## Roles, prefixes, initial status

| Role | Collection directory | Listing page | Prefix | Initial status |
| change | partials/changes/ | pages/changes.adoc | CHG | proposed |
| requirement | partials/requirements/ | pages/requirements.adoc | REQ | draft |
| decision | partials/decisions/ | pages/decisions.adoc | DEC | proposed |
| use_case | partials/use-cases/ | pages/use-cases.adoc | UC | none |
| architecture | partials/architecture/ | pages/architecture.adoc | ARC | accepted |
| design | partials/designs/ | pages/designs.adoc | DSN | proposed |
| adr | partials/adrs/ | pages/adrs.adoc | ADR | proposed |
| test | partials/tests/ | pages/tests.adoc | TST | none |


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
