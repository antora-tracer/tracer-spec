# Configurable Dependency Readiness

## Goal

Make prerequisite readiness configurable from the traceability graph while keeping workflow activities in `tracer-spec`.

Before `tspec` creates an implementation plan for a change, it must be able to require a minimum number of distinct requirements reachable from that change. A requirement may be linked directly or through intermediate items such as use cases. Separately, a project may impose per-item dependency counts at configured lifecycle states, such as requiring a use case to link to at least one requirement before it reaches `reviewed`.

Projects configure their own roles and relationships in `traceability.yml`; dependency paths and lifecycle cardinality must respect that project's graph configuration.

## Ownership

- **antora-tracer** owns traceability roles, allowed relations, and a configured dependency graph over those roles and relations. It validates this project-specific YAML at runtime, evaluates configured lifecycle cardinalities, and exposes graph queries for reachable items and counts.
- **tracer-spec / tspec** owns workflow activities and their prerequisites. It decides when to query readiness and what minimum count blocks a particular activity. It does not define graph traversal paths or duplicate relationship semantics.
- **antora-tracer's write-item skill** is the authoring path for creating missing traceable items. `tspec` invokes it when readiness is missing and item creation is appropriate, then rechecks readiness.

Antora Tracer remains workflow-agnostic: it does not know what planning or applying means. Traceability display matrices remain distinct from the dependency graph used for traversal.

## Configuration model

`traceability.yml` gains a project-defined `dependencyMatrix`. Each configured edge identifies a relation and target role; edges form the directed graph used for dependency queries. An edge may also declare a minimum count enforced for items of the source role at a named lifecycle state. `min: 0` means the edge is optional for that lifecycle gate but remains available to graph traversal. No maximum count is required for the initial feature.

Illustrative configuration:

```yaml
roles: [change, use_case, requirement]

relations:
  change:
    requirement:
      addresses: { reverse: addressed_by }
    use_case:
      includes: { reverse: included_by }
  use_case:
    requirement:
      leads_to: { reverse: derived_from }

dependencyMatrix:
  change:
    addresses:
      requirement: { min: 0 }
    includes:
      use_case: { min: 0 }
  use_case:
    leads_to:
      requirement: { min: 1, at: reviewed }
```

This is illustrative; final field spelling and placement must follow existing Tracer configuration conventions. The dependency matrix references only declared roles and allowed relations. Traversal follows its configured directed edges, normalizing equivalent reverse-authored links to the configured direction. Lifecycle minima count direct links for the specific source item and gate; absent gate constraints do not make incomplete drafts invalid.

The dependency matrix is not a rendered coverage matrix. Its purpose is to configure graph reachability and per-item dependency rules.

`tspec.yml` configures activity prerequisites independently:

```yaml
activities:
  plan:
    for: change
    requires:
      requirement: { min: 1 }
```

The activity rule asks for one distinct reachable requirement from the selected change. Reachability follows only dependency-matrix edges. It counts each item ID once, even if multiple paths reach it, and terminates safely in cyclic graphs. It does not impose a project-wide use-case requirement: a use case is optional for planning unless the project's activity config says otherwise.

## Runtime behavior

1. Tracer loads the project's YAML and reports invalid dependency declarations with the configuration path: unknown source/target roles, undeclared relations, invalid minima, or invalid lifecycle states.
2. Tracer's query interface evaluates reachable items of a requested role from a specific item, using configured dependency edges. It supports a machine-readable result with the matching distinct items and count for workflow use.
3. Tracer's graph validation checks configured per-item cardinality minima at their named lifecycle gates. It reports the source item, gate, expected minimum, and observed count. Optional/min-zero edges do not fail validation.
4. Before writing a plan, `tspec` evaluates each configured activity prerequisite for the selected change. If a minimum is unmet, it reports the deficit and does not create the plan checklist. It can use the write-item skill to add suitable missing items and then re-query.
5. If the explored scope appears too broad for a single change, `tspec` may recommend splitting it into smaller changes. It must not split or rewrite the user's change automatically.

Example: with `change --includes--> use_case --leads_to--> requirement`, a change with no direct `addresses` edge can still satisfy the plan prerequisite. If multiple paths reach the same requirement, that requirement counts once. Independently, each use case must have one directly linked requirement before it reaches `reviewed`.

## Compatibility and boundaries

- Existing role and relation configuration remains the source of truth; projects opt into dependency edges and activity prerequisites.
- The existing `matrices` configuration and generated reports retain their current meaning.
- Do not introduce OpenSpec artifact schemas, file hierarchy, or workflow semantics. Reuse only the useful idea of configurable artifact prerequisites.
- Do not require a particular set of roles such as `use_case` or `design`; roles remain project-defined.
- Do not add upper cardinality limits, automated change splitting, automatic role invention, or recursive traversal over relations not explicitly configured as dependency edges.
- YAML is runtime-validated; TypeScript interfaces alone are not treated as validation of project configuration.

## Verification criteria

- Valid dependency configuration loads; invalid role, relation, count, or gate references fail with actionable configuration errors.
- A direct requirement link satisfies a plan minimum.
- A requirement reachable through multiple configured edges satisfies the minimum without a direct change-to-requirement link.
- Duplicate paths to one requirement count as one; two distinct reachable requirements count as two.
- Cycles terminate without duplicate results or non-termination.
- Relations outside the dependency matrix do not contribute to reachable counts.
- Per-item lifecycle minima are enforced at the configured state and do not invalidate earlier drafts.
- An optional use-case edge does not block planning when the required reachable requirement count is otherwise met.
- `tspec` blocks plan creation when the reachable count is below its configured minimum, and proceeds when it is met.
- Missing readiness can be addressed through the existing write-item skill, followed by a fresh query.
- Tracer continues to operate without workflow-specific knowledge; `tspec` owns activity invocation and thresholds.

## Scope note

This design spans the Antora Tracer graph/configuration query capability and the tracer-spec activity configuration/workflow. The implementation plan should keep their config and API contracts explicit and avoid coupling Tracer to `tspec` activity names.
