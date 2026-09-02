---
name: validate-traceability
description: >
  Validate the traceability graph in the Tracer Spec Workflow.
  Checks for missing relationships, orphaned items, and inconsistencies.
  Assumes `antora-tracer` CLI is installed.
license: MIT
---

# Validate Traceability

Validate the project's traceability graph before implementation.

## Trigger

Before committing a change:
- "Validate the graph"
- "Are there any missing relationships?"
- "Check for orphaned items"

## Preconditions

- The project has a `traceability.yml` configuration.
- Project documents are in the `docs/` directory.
- The `antora-tracer` CLI is installed.

## Behavior

The skill runs the following validation commands:

1. **Structural validation:**
   ```bash
   antora-tracer validate -i docs --config traceability.yml
   ```
   Reports:
   - Unknown roles
   - Invalid relationships
   - Dangling references (IDs that don't exist)
   - Duplicate item IDs

2. **Coverage analysis:**
   ```bash
   antora-tracer query isolated -i docs --config traceability.yml
   ```
   Reports items with no relationships (may indicate incomplete specification).

3. **Status compliance:**
   The skill checks that:
   - `refined` changes have at least one `use_case`.
   - `accepted` changes have at least one `requirement`.
   - `accepted` ADRs have at least one `design_concept`.

4. **Graph summary:**
   ```bash
   antora-tracer stats -i docs --config traceability.yml
   ```
   Reports:
   - Total items by role.
   - Total relationships by type.
   - Coverage percentages.

## Output

The skill produces a validation report:

```
✅ Structural validation: 0 errors
  - 4 changes
  - 1 use case
  - 4 requirements
  - 2 ADRs
  - 2 design concepts

⚠️  Isolated items (may be incomplete):
  - REQ-001 (draft)

✅ Status compliance:
  - All refined changes have use cases
  - All accepted changes have requirements
  - All accepted ADRs have design concepts

✅ Ready to implement
```

## Remediation

If validation reports errors:

1. **Dangling reference** → Find and fix the target ID or the reference.
2. **Isolated item** → Add missing relationships or mark the item as intentionally standalone.
3. **Invalid role or relation** → Check `traceability.yml` and the item syntax.
4. **Missing use case** → Add a use case before moving the change to `refined`.
5. **Missing requirement** → Add a requirement before moving the change to `accepted`.
6. **Missing design concept** → Add a design concept or link to an existing one before accepting the ADR.

## Limitations

- Does not automatically fix issues (requires manual correction).
- Does not validate EARS pattern compliance for requirements (that's a separate linting step).
- Does not check for solution prescription in requirements.
- Warnings for isolated items may be false positives if items are intentionally standalone.

## Related

- `antora-tracer validate` — CLI command for full validation.
- `antora-tracer query isolated` — CLI command for isolated items.
- `antora-tracer stats` — CLI command for graph statistics.
- Example site at https://antora-tracer.conemso.de for reference.
