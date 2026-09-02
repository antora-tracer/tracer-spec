---
name: record-adr
description: >
  Record an architecture decision for a change in the Tracer Spec Workflow.
  Creates an ADR item linking context, decision, alternatives, and consequences.
  Assumes `antora-tracer` CLI is installed.
argument-hint: "<change-id>"
license: MIT
---

# Record ADR

Record a change-specific architectural decision.

## Trigger

When a change requires design choices:
- "Record a decision for CHG-NNN"
- "Why did we choose X over Y?"
- "What trade-off does this represent?"

## Preconditions

- A change exists with at least one requirement.
- The decision is not obvious from existing design concepts.

## Behavior

1. Ask for the decision title (short, naming the decision).
2. Ask for the context (why is this decision needed? what problem?).
3. Ask for the decision (what was chosen?).
4. Ask for alternatives (what was rejected and why?).
5. Ask for consequences (what follows from this decision?).
6. Generate the next ADR ID using `antora-tracer next-id --prefix ADR`.
7. Create an ADR item block with status `proposed`.
8. Link the ADR to the change using `records:CHG-NNN[]`.
9. Write the item into `docs/adrs.adoc`.

## Implementation

```bash
antora-tracer next-id --prefix ADR -i docs
```

Creates a new item in `docs/adrs.adoc`:

```asciidoc
[#ADR-NNN, item, role=adr, status=proposed, title="<decision title>"]
--
Context:: <why is this decision needed?>
Decision:: <what was decided?>
Alternatives:: <what was rejected?>
Consequences:: <what follows?>

records:CHG-NNN[]
leads_to:DES-NNN[]

tracer:links[]
--
```

## Note on Design Concepts

The ADR links to a design concept with `leads_to:DES-NNN[]`.
This link is initially a forward reference (the design concept may not yet exist).
After the design concept is reviewed and accepted, the ADR is accepted.

This separation ensures:
- ADRs are specific to the change.
- Design concepts are reusable across changes.
- Decisions and stable knowledge are distinct.

## Limitations

- Does not validate the quality of the decision (completeness, impact analysis).
- Does not require the design concept to exist before accepting the ADR.
- Assumes the author understands why alternatives were rejected.

## Next

After ADRs are recorded:
- `review-design` — accept or create the design concept
- `plan-change` — prepare the implementation plan
