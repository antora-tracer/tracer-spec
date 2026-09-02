---
name: plan-change
description: >
  Generate or revise an execution plan for a change in the Tracer Spec Workflow.
  Creates a temporary working document with a task checklist and context.
  Assumes `antora-tracer` CLI is installed.
argument-hint: "<change-id>"
license: MIT
---

# Plan Change

Generate or revise an execution plan for a change.

The plan is a temporary working document, not a durable traceability artifact.
It summarizes what needs to be implemented based on the change's requirements, design concepts, and ADRs.

## Trigger

After design concepts are accepted:
- "Plan CHG-NNN"
- "Generate an implementation checklist for CHG-NNN"
- "What needs to be built?"

## Preconditions

- The change is in `accepted` status.
- At least one requirement is approved.
- Design concepts are accepted.

## Behavior

1. Ask: "Generate a new plan, or revise an existing one?"
2. If new:
   a. Gather the change metadata (ID, title, rationale).
   b. List addressed requirements.
   c. List relevant design concepts.
   d. List recorded ADRs.
   e. Ask for a list of implementation tasks.
   f. Ask for verification expectations (tests, reviews).
   g. Write to `plans/CHG-NNN.plan.adoc`.
3. If revise:
   a. Load the existing plan from `plans/CHG-NNN.plan.adoc`.
   b. Ask which tasks to add, remove, or reorder.
   c. Ask whether priorities have changed.
   d. Update the plan file.

## Template

```asciidoc
= Execution Plan: CHG-NNN

change:CHG-NNN[]

This is a temporary working plan, not a durable traceability artifact.

== Summary

Addressed requirements::
* REQ-NNN: <requirement title>

Related design concepts::
* DES-NNN: <design concept title>

Recorded decisions::
* ADR-NNN: <decision title>

== Tasks

. [ ] <task 1>
. [ ] <task 2>
. [ ] <task 3>

== Verification

* Unit tests for <component>
* Integration tests for <flow>
* Manual review of <area>
* Update documentation at <location>

== Notes

Any open questions or assumptions.
```

## Important notes

- The plan is written in `plans/`, not `docs/`. It is not published with the project.
- The plan may be revised, deleted, or archived after implementation without affecting traceability.
- Task status (checked/unchecked) is informal and local to the plan — not tracked in the graph.
- The plan references the change and its requirements using `change:CHG-NNN[]` for context, but does not create new traceability items.

## Limitations

- Does not generate AI-driven task suggestions (that's a future enhancement).
- Does not track plan changes in Git (the plan may be edited freely without commits).
- Does not enforce that the plan matches the change's scope.

## Next

After the plan is ready:
- Implementation begins in the code repository.
- The change status moves to `implemented` when code is committed.
- The change status moves to `verified` when tests pass and reviewers approve.
- The change status moves to `closed` when merged.
