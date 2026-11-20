---
name: tspec-new-change
description: >
  Use when a user wants a new implementation change recorded from the current conversation or confirms a change sketch, whether or not it has an external ticket; not when the request is only a rough feature idea needing exploration.
argument-hint: "<change idea>"
license: MIT
compatibility: antora-tracer
allowed-tools: Bash(antora-tracer:*)
---

Record one independently deliverable implementation change.

## Process

1. Read tspec-write-item skill instructions and follow it.
2. Read the conversation, relevant antora-tracer graph context. Gather rationale, observable outcome, out-of-scope boundaries, applicable approved product/component requirements, and an `externalId` only when already known. Do not repeat information already given or read a tracker to fill gaps.
3. Keep the change to one independently deliverable slice. If purpose, outcome, exclusions, or applicable approved requirement links are unclear, ask. Do not split an umbrella request automatically. If no applicable approved product/component requirement exists, stop and ask for it; do not create an unanchored change.
4. Prepare one proposed change item with `addresses:REQ-NNN[]` links to only applicable approved requirements. Include `externalId=<existing-id>` only if the change is associated with an existing external item. 
5. Show the complete proposed change item and any decision items, IDs, requirement links, and destinations. Ask before writing. Record domain or business choices as `decision` items. For Costly-to-reverse architecture choices use ADRs; unresolved material choices are resolved during change design refinement, not chosen or placeholder-recorded here.
6. Propose to hand the change off to a cold agent for review.
7. After approval, write only the previewed item(s), then propose to run `antora-tracer validate -i docs --config traceability.yml`. Fix validation errors before reporting the identifier and path.

## Fallback change format

```asciidoc
[#CHG-NNN, item, role=change, status=proposed, title="..."]
--
Rationale:: Why this independently deliverable change is needed.
Outcome:: What observable result it produces.
Out-of-scope:: What it excludes.

addresses:REQ-NNN[]
tracer:links[]
--
```

Add `externalId=<existing-id>` to the header only when applicable.

## Rules

- `externalId` is optional shared scalar metadata, not a graph relation. Its presence never authorizes tracker access.
- Do not create, import, read, or update external tickets here. `tspec-track` remains the explicit workflow for supported ticket operations.
- Do not create detailed software requirements or `tspec/<change-id>/tasks.md`; use `tspec-refine-change` after this proposed change is saved.
- Do not create requirements or decisions merely to complete a template.

## Next

Refine this one change with `tspec-refine-change <change-id>`. The existing human acceptance and apply/archive lifecycle still applies.
