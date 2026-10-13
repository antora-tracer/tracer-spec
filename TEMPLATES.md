= Tracer Spec Workflow — Template Guide

Two templates are available, depending on your starting point:

== tracer-spec (Complete Example)

GitHub: https://github.com/antora-tracer/tracer-spec

**Use this if:**
- You want to see a working, self-tracing example
- You want to understand the complete workflow
- You want to copy structure from an existing project

**What it includes:**
- Durable graph items for changes, requirements, decisions, ADRs, architecture elements, and per-change designs
- Arc42-aligned architecture baseline and workflow documentation
- One change fully traced through the graph
- Nine Agent Skills

**First steps:**
```bash
git clone https://github.com/antora-tracer/tracer-spec.git my-project
cd my-project
npm install
pi tspec-explore "Your feature"
pi tspec-refine-feature <feature-ticket-id>
pi tspec-new-change "Your first change"
```

**Best for:** Learning, reference, copying patterns.

---

== tracer-spec-minimal (Empty Slate)

GitHub: https://github.com/antora-tracer/tracer-spec-minimal

**Use this if:**
- You're starting a brand new project from scratch
- You don't want to remove the example data first

**What it includes:**
- Empty docs with role guidance, collection templates, and examples
- Tracer Spec configuration (extends minimal + change, decision, use_case, architecture, design, and adr)
- Arc42-aligned architecture baseline structure and durable design/ADR collections
- Nine Agent Skills

**No example data:** start fresh by exploring your feature, refining its existing ticket with `tspec-refine-feature`, then recording a change with `tspec-new-change`.

**First steps:**
```bash
git clone https://github.com/antora-tracer/tracer-spec-minimal.git my-project
cd my-project
npm install
pi tspec-explore "Your first feature"
pi tspec-refine-feature <feature-ticket-id>
pi tspec-new-change "Your first change"
```

**Best for:** New projects, starting from scratch, minimal noise.

---

== Workflow is the Same

Both templates use the same workflow:

[source,bash]
----
pi tspec-explore "your feature"                 # shape the feature intent
pi tspec-refine-feature <feature-ticket-id>      # refine existing ticket to product-level graph items
pi tspec-new-change "Add reusable saved filters"   # topic; the skill generates the CHG ID
pi tspec-refine-change CHG-001                   # software requirements, durable design, and tasks
pi tspec-apply-change CHG-001                    # implement the refined tasks
pi tspec-archive CHG-001                         # validate and close
pi tspec-validate                                # check the graph
npm run build                                    # publish the site
----

Both workflows keep the graph canonical: requirements, architecture items, per-change designs, decisions, and ADRs remain durable; only task checklists are temporary. Refinement creates the design before tasks, and archive reconciles the arc42 baseline to the implemented architecture.

The only difference is whether you **start with examples** (tracer-spec) or a **blank slate** (tracer-spec-minimal).
