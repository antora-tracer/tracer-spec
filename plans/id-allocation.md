# ID Allocation under Concurrency

Design discussion captured for follow-up in `antora-tracer/core`.
Not a durable traceability item — a handoff note.

## Problem

REQ/DEC/CHG IDs are allocated as `<prefix>-<max+1>` over the working tree.
On a repo with 30+ concurrent authors, two branches both allocate the same
next number off the same `HEAD`, so IDs collide constantly, not occasionally.

## Grounded facts (verified in `@antora-tracer/core`)

- `TraceabilityGraph.getNextId()` is hardcoded: scan existing `<prefix>-NNN`,
  return `max+1` with matching padding. No hook, no config.
- Duplicate IDs are caught at validate time, not prevented: `DocumentParser`
  errors on `duplicate_id`; `TraceabilityGraph.addItem` warns
  "Items must be unique within a component version"; `validate()` promotes the
  `duplicate_node` warning to an error. Safety exists; collision-freedom does not.
- `trackerId` is not read by the core at all — it is a tracer-spec-level
  block-header attribute written by `tspec-track` (DEC-009: tracker link is an
  attribute, not a relation). Nothing renders it.
- The site builds `branches: HEAD` only (no feature-branch publishing).

## Options considered

| # | Scheme | Verdict |
|---|--------|---------|
| L1 | status quo: `max+1`, validate-at-merge | zero code; fine to ~5 people; collision-heavy at 30+ |
| L2 | change ID = tracker issue number | breaks: Jira keys are per-project (`ABC-123` vs `XYZ-123`), mixed GitHub+Jira collides |
| L3 | REQ/DEC scoped under change (`REQ-<CHG>-n`) | inherits L2's non-uniqueness; ugly per-project prefixes |
| L4 | ULID/UUID key + separate human label | no infra, offline; grammar + readability cost |
| L5 | central ID server | works; heaviest; re-adds runtime dependency the workflow was built to remove |

## Decision

- **Drop L2/L3.** They fuse tracker identity with graph identity. The
  multi-Jira-project case is why that's fragile. Tracker identity stays a
  decoupled attribute (`trackerId=ABC-123`), graph identity stays internal
  (`REQ-024`, `CHG-042`) — consistent with DEC-009.
- **L5 as opt-in, default off.** Make ID allocation a pluggable strategy in
  the core, not a separate product:

```yaml
# traceability.yml — owned by antora-tracer/core
idAllocation:
  strategy: local              # local (default) | remote
  remote:
    url: https://ids.example.com/allocate
    token: ${IDS_TOKEN}
```

  - `local` = today's `max+1` (default, zero infra).
  - `remote` = `next-id` calls `POST /allocate {prefix}`; the server is a
    trivial monotonic counter per prefix (DB sequence / Redis `INCR`),
    stateless, no knowledge of git. It is the consensus point, nothing more.

## Caveat: consecutive ≠ dense

Polarion numbering is gap-free because Polarion *owns the items* — number and
item are minted together and never disappear. Here git owns the items; an
external allocator mints `REQ-042` but an abandoned branch leaves a permanent
hole:

```
Polarion:  REQ-001 … REQ-500          no holes (items live in the server)
here:      REQ-001 … REQ-041, REQ-043 …   holes where proposals died
```

- Consecutive = monotonic = achievable with an opt-in remote allocator.
- Dense/gap-free = the server must own the item lifecycle, not just IDs —
  a different architecture that abandons "git is the source of truth".
  Out of scope; accept monotonic-with-holes.

## Where the work lands

- **`antora-tracer/core`**: add the `idAllocation` strategy hook to
  `getNextId`/`next-id`; keep `local` default; add `remote` strategy.
- **`tracer-spec` (this repo)**: document the model (site explanation/reference
  + `tspec.yml`/`traceability.yml` notes); record a DEC capturing the strategy.

## Open questions

1. Decision vs change: record the strategy as a DEC now, or open the core work?
2. Is monotonic-with-holes acceptable, or is gap-free a hard requirement?
   If gap-free, the conversation is no longer about an ID allocator but about
   whether the server owns the items — a much bigger fork.
