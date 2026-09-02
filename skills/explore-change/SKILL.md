---
name: explore-change
description: >
  Initiate a change proposal in the Tracer Spec Workflow.
  Gathers the change name, motivation, and scope to create a new `change` item
  ready for use case and requirement refinement.
  Assumes `antora-tracer` CLI is installed.
argument-hint: "<change-name>"
license: MIT
---

# Explore Change

Initiate a new change proposal in the Tracer Spec Workflow.

## Trigger

User requests exploration of a feature, fix, or improvement:
- "Explore a change for..."
- "I want to propose..."
- "Let's add..."
- "Let's fix..."

## Behavior

1. Ask for the change name (short title).
2. Ask for the motivation (why this change matters).
3. Ask for the scope (what it affects: user experience, architecture, tooling, etc.).
4. Generate the next change ID using `antora-tracer next-id --prefix CHG`.
5. Create a change item block with status `proposed`.
6. Write the item into `docs/changes.adoc`.
7. Output the change ID and a summary.

## Implementation

```bash
antora-tracer next-id --prefix CHG -i docs
```

creates a new item in `docs/changes.adoc`:

```asciidoc
[#CHG-NNN, item, role=change, status=proposed, title="<change-name>"]
--
<motivation>

Scope: <scope>

tracer:links[]
--
```

## Limitations

- Does not prompt for related use cases or requirements yet (they are added in later skills).
- Does not validate that the change.adoc file exists (assumes project is initialized).

## Next

After exploration, the change moves to the `refined` phase:
- `write-use-case` — add a use case describing stakeholder interaction
- `write-requirement` — add a requirement specifying system behaviour
