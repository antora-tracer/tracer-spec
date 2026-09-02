= Tracer Spec Workflow — Template Guide

Two templates are available, depending on your starting point:

== tracer-spec (Complete Example)

GitHub: https://github.com/rattermeyer/tracer-spec

**Use this if:**
- You want to see a working, self-tracing example
- You want to understand the complete workflow
- You want to copy structure from an existing project

**What it includes:**
- ✅ 5 durable documents (changes, use-cases, requirements, adrs, design)
- ✅ 1 change item (CHG-001) fully traced through the graph
- ✅ 1 example execution plan
- ✅ Complete Antora documentation site with workflow guidance
- ✅ 7 Agent Skills with full documentation

**First steps:**
```bash
git clone https://github.com/rattermeyer/tracer-spec.git my-project
cd my-project
npm install
pi explore-change "Your feature"
```

**Best for:** Learning, reference, copying patterns.

---

== tracer-spec-minimal (Empty Slate)

GitHub: https://github.com/rattermeyer/tracer-spec-minimal

**Use this if:**
- You're starting a brand new project from scratch
- You don't want to remove the example data first
- You want the minimal boilerplate

**What it includes:**
- ✅ Empty docs with templates and examples
- ✅ Tracer Spec configuration (extends spec-driven-development)
- ✅ Antora structure with minimal pages
- ✅ 7 Agent Skills (same as the complete example)
- ✅ All the scripts and config you need

**No example data:**
- No CHG-001
- No UC-001
- No REQ-001
- You start fresh with `pi explore-change`

**First steps:**
```bash
git clone https://github.com/rattermeyer/tracer-spec-minimal.git my-project
cd my-project
npm install
pi explore-change "Your first feature"
```

**Best for:** New projects, starting from scratch, minimal noise.

---

== Comparison

[width=100%, cols="25h,35a,35a"]
|===
| Feature | Complete Example | Minimal Template
| Starting state | 1 complete change fully traced | Empty slate, ready for your items
| Use cases | 1 example (UC-001) | None; template only
| Requirements | 4 examples (REQ-001..004) | None; template only
| Design concepts | 2 examples (DES-001, 002) | None; template only
| ADRs | 2 examples (ADR-001, 002) | None; template only
| Documentation | Full workflow guide + authoring guide | Minimal placeholders
| Antora pages | Complete, with coverage matrices | Minimal stubs pointing to full example
| Time to first change | Read docs first, then customize | Start immediately with `pi explore-change`
| Best for | Learning, reference, copying patterns | New projects, clean slate
|===

---

== Workflow is the Same

Both templates use the **exact same workflow**:

```bash
pi explore-change "your feature"      # Creates CHG-NNN
pi write-use-case CHG-NNN              # Creates UC-NNN
pi write-requirement CHG-NNN           # Creates REQ-NNN
pi record-adr CHG-NNN                  # Creates ADR-NNN
pi review-design CHG-NNN               # Creates/links DES-NNN
pi plan-change CHG-NNN                 # Creates plans/CHG-NNN.plan.adoc
pi validate-traceability               # Validates the graph
npm run build                          # Publishes the site
```

The only difference is whether you **start with examples** (tracer-spec) or a **blank slate** (tracer-spec-minimal).

---

== Migration Between Templates

Starting with the minimal template and want to see the full example?

```bash
# Read the complete example
cd /path/to/tracer-spec
cat docs/changes.adoc
cat docs/requirements.adoc
cat examples/tracer/modules/ROOT/pages/workflow/overview.adoc
```

Starting with the complete example and want to start fresh?

```bash
# Remove the example items
rm docs/changes.adoc docs/use-cases.adoc docs/requirements.adoc docs/adrs.adoc docs/design.adoc
# Or just delete their content and keep the shell

# Then start with
pi explore-change "Your first feature"
```

---

## Which Should I Choose?

**tracer-spec-minimal** if:
- ✅ You're starting a new project
- ✅ You want a clean slate
- ✅ You know the workflow already

**tracer-spec** if:
- ✅ You want to learn the workflow by example
- ✅ You want to copy structure and patterns
- ✅ You want to see a complete, working project
