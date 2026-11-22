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
3. Locate destination of the item:
  * if antora-tracer query by-role <role> --json -i docs returns items, use the directory of their sourceFile; 
  * otherwise use the destination named in antora-tracer role-guidance <role> --config traceability.yml --content; 
  * otherwise default to docs/modules/specs/partials/<role>/ and its listing page docs/modules/specs/pages/<role>.adoc. Add include::partial$<role>/<file>.adoc[] to the listing page (blank line before it).
4. Write the item under the resolved location with the status and fields from that role's guidance, and place its include in the listing section the role uses:
  * `requirement` — one partial per level and functional area named `<level>-<area>.adoc`; the listing nests areas under container headings (`==` container, `===` area), so place a new area include under the container from the xref:architecture.adoc[Building Block View] that the item belongs to. Do not split one area across files.
  * `use_case`, `change` — one partial per item, appended under `== Items`.
  * `test`, `adr` — one partial per item, appended directly under the page title with no section heading.
  * `decision` — one partial per item, under `== Accepted` or `== Proposed` matching the item's status.
  * `design` — one partial per item, under a `== CHG-NNN — <change>` section titled with the change it records.
  * `architecture` — one partial per item; the architecture page includes it from the relevant arc42 section.
5. Route a superseded item to `docs/modules/specs/partials/<role>/superseded.adoc` instead of leaving it among the live items, and include that file from the listing page with `[opts=optional]`. Never keep a `status=superseded` item in a normal collection partial.
6. Add only configured relation macros to existing IDs. Use a configured reverse relation when the canonical edge points from another role.

## Roles, prefixes, initial status


| Role | Collection directory | Listing page | Prefix | Initial status |
|------|----------------------|--------------|--------|----------------|
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
- A `requirement` item states one SHALL: one obligation, one observable behaviour. Split obligations that sit at the same level into separate items; when they sit at different levels, state the broader one in a parent requirement and `refines` it. A prohibition is its own item. See the role guidance's Atomicity section.
