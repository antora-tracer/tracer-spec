---
name: write-requirement
description: >
  Write a requirement in the Tracer Spec Workflow.
  Creates an EARS-pattern requirement item and links it to a change.
  Assumes `antora-tracer` CLI is installed.
argument-hint: "<change-id>"
license: MIT
---

# Write Requirement

Write a requirement specifying what the system must do — never how.

## Trigger

After use cases are accepted:
- "Add a requirement for CHG-NNN"
- "What must the system do?"
- "Derive a requirement from UC-NNN"

## Preconditions

- At least one use case has been written.
- The change is in `refined` or `accepted` status.

## Behavior

1. Ask for the requirement title (short, observable behaviour).
2. Ask which EARS pattern applies:
   - Ubiquitous: always true
   - Event-driven: triggered by an event
   - State-driven: true while in a state
   - Unwanted behaviour: error or exception
3. Ask for the SHALL statement.
4. Ask for boundary conditions or scope.
5. Generate the next requirement ID using `antora-tracer next-id --prefix REQ`.
6. Create a requirement item block with status `draft`.
7. Link the requirement to the change using `addresses:CHG-NNN[]`.
8. Link the requirement to the use case it derives from using `is_derived_from:UC-NNN[]`.
9. Write the item into `docs/requirements.adoc`.

## Implementation

```bash
antora-tracer next-id --prefix REQ -i docs
```

Creates a new item in `docs/requirements.adoc`:

```asciidoc
[#REQ-NNN, item, role=requirement, status=draft, title="<observable behaviour>"]
--
<EARS-pattern SHALL statement>

<boundary conditions or scope>

tracer:links[]
--
```

## Validation

Before writing, the skill should warn if:
- The requirement prescribes a solution ("use Redis", "call an API", "implement a parser").
- The requirement contains vague terms ("user-friendly", "fast", "appropriate").
- The requirement has multiple unrelated SHALLs (split them).

## Limitations

- Does not enforce EARS pattern validation.
- Does not check for solution prescription automatically.
- Does not validate testability.

## Next

After requirements are approved:
- `record-adr` — capture decisions
- `review-design` — align with existing design concepts
- `plan-change` — generate an execution plan
