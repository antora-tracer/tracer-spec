= Tracer Spec Workflow — Template Guide

Two templates are available, depending on your starting point:

== tracer-spec (Complete Example)

GitHub: https://github.com/antora-tracer/tracer-spec

**Use this if:**
- You want to see a working, self-tracing example
- You want to understand the complete workflow
- You want to copy structure from an existing project

**What it includes:**
- Durable docs (changes, requirements, decisions)
- One change (CHG-004) fully traced through the graph
- Complete Antora documentation site with workflow guidance
- Six Agent Skills

**First steps:**
```bash
git clone https://github.com/antora-tracer/tracer-spec.git my-project
cd my-project
npm install
pi tspec-propose "Your feature"
```

**Best for:** Learning, reference, copying patterns.

---

== tracer-spec-minimal (Empty Slate)

GitHub: https://github.com/antora-tracer/tracer-spec-minimal

**Use this if:**
- You're starting a brand new project from scratch
- You don't want to remove the example data first

**What it includes:**
- Empty docs with templates and examples
- Tracer Spec configuration (extends minimal + change + decision)
- Antora structure with minimal pages
- Six Agent Skills

**No example data:** you start fresh with `pi tspec-propose`.

**First steps:**
```bash
git clone https://github.com/antora-tracer/tracer-spec-minimal.git my-project
cd my-project
npm install
pi tspec-propose "Your first feature"
```

**Best for:** New projects, starting from scratch, minimal noise.

---

== Workflow is the Same

Both templates use the **exact same workflow**:

```bash
pi tspec-explore "your feature"   # shape a change sketch
pi tspec-propose CHG-001          # change + requirements + decisions + tasks
pi tspec-apply CHG-001            # implement the tasks
pi tspec-archive CHG-001          # validate and close
pi tspec-validate                 # check the graph
npm run build                     # publish the site
```

The only difference is whether you **start with examples** (tracer-spec) or a **blank slate** (tracer-spec-minimal).
