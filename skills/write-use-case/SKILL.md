---
name: write-use-case
description: >
  Write a use case in the Tracer Spec Workflow.
  Creates a Karl Wiegers tabular use case item and links it to a change.
  Assumes `antora-tracer` CLI is installed.
argument-hint: "<change-id>"
license: MIT
---

# Write Use Case

Write a use case describing how a stakeholder or user benefits from a change.

## Trigger

After a change is proposed:
- "Add a use case to CHG-NNN"
- "Describe the user interaction for CHG-NNN"
- "Who uses this and why?"

## Preconditions

- A change item exists in `docs/changes.adoc`.
- The change is in `proposed` or `refined` status.

## Behavior

1. Ask for the actor (user role or persona name).
2. Ask for the goal (what the actor wants to achieve).
3. Ask for the trigger (what event starts the use case).
4. Ask for the basic flow (numbered steps).
5. Ask for alternate flows (error or optional paths).
6. Ask for postconditions (system state after success).
7. Generate the next use case ID using `antora-tracer next-id --prefix UC`.
8. Create a use case item block with status `draft`.
9. Link the use case to the change using `leads_to:CHG-NNN[]`.
10. Write the item into `docs/use-cases.adoc`.
11. Update the change item to link to the use case with `links_to:UC-NNN[]` (if the config supports it).

## Implementation

```bash
antora-tracer next-id --prefix UC -i docs
```

Creates a new item in `docs/use-cases.adoc`:

```asciidoc
[#UC-NNN, item, role=use_case, status=draft, title="<actor> <goal>"]
--
.Use Case
[width=100%, cols="25h,75a"]
|===
| Primary Actor | <actor>
| Goal | <goal>
| Preconditions | <conditions>
| Trigger | <trigger>
| Basic Flow |
. <step 1>
. <step 2>
| Alternate Flows |
. <condition>: <alternate steps>
| Postconditions | <conditions>
| Priority | High / Medium / Low
|===

leads_to:CHG-NNN[]
tracer:links[]
--
```

## Limitations

- Does not ask for preconditions explicitly (could be enhanced).
- Does not validate Karl Wiegers format completeness.
- Does not mark the actor against a persona document (assumes implicit understanding).

## Next

After use cases are written, move to requirements:
- `write-requirement` — add specific system obligations
- `record-adr` — capture architectural decisions
