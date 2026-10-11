= Tracer Spec Workflow — Complete Example

Spec-driven development workflow built on Antora Tracer.

This repository eats its own dog food: its changes, requirements, and decisions are traceable items published by Antora.

**For a new project?** Run `tracer-spec init` — see "Install & Initialize" below.

**To see a working example?** You're in the right place. This repository demonstrates the full workflow with self-tracing documentation.

== Install & Initialize

This repository is the `@antora-tracer/tracer-spec` package: a CLI that scaffolds
a Tracer Spec Workflow project and installs the workflow skills.

[source,bash]
----
npm install -g @antora-tracer/tracer-spec
cd my-project
tracer-spec init "My Project"
npm install
----

`init` writes `traceability.yml`, `docs/`, an Antora playbook and site, `AGENTS.md`,
and installs the nine workflow skills into your agent harness directories
(default: Oh My Pi `.omp/skills/`, Claude `.claude/skills/`, shared `.agents/skills/`).
Pass `--tools claude,codex,agents` to pick harnesses, `--tools all` for every
supported one, or `--tools none` to skip.

== Purpose

The Tracer Spec Workflow replaces OpenSpec's parallel artifact hierarchy with a single traceability graph.

The grammar is three tiers:

* *Tier 1 (core):* changes and requirements; use cases are enabled for feature refinement.
* *Tier 2 (understanding):* decisions and tests, plus optional growth roles enabled per project.
* *Tier 3 (temporary):* task checklists under `tspec/<change-id>/`, created after change refinement and deleted when the change closes.

== Quick Start

=== Prerequisites

- Node.js 20+
- `antora-tracer` CLI installed and available on `PATH`
- Antora (installed via npm)

=== Install this template

[source,bash]
----
git clone https://github.com/antora-tracer/tracer-spec.git my-project
cd my-project
npm install
----

=== Validate the example graph

[source,bash]
----
antora-tracer validate -i docs --config traceability.yml
----

Expected output:

[source,text]
----
Validating requirements traceability...
No validation errors found
Summary: 11 items, 10 relationships
----

=== Customize for your project

1. Edit the project name and description in `README.md` and `docs/antora.yml`.
2. Update `use-cases.adoc`, `requirements.adoc`, and `changes.adoc` with your feature and independent implementation slices.
3. Adapt `traceability.yml` for additional project roles and relations.
4. Run validation regularly: `npm run validate`

=== Use the workflow

[source,text]
----
explore → refine feature ticket → propose change(s) → refine each change → accept → apply → archive
----

Explore the feature, then refine an existing external feature ticket into product-level behavior, use cases, and requirements before proposing implementation changes. A ticket can link to many independent changes. Refine each proposed change into detailed software requirements and tasks before accepting and applying it; `tspec-new-change` does not author those detailed requirements or tasks.

The nine skills:

| Skill | Purpose |
|-------|---------|
| `tspec-explore` | Explore a feature idea and shape its change sketch |
| `tspec-refine-feature` | Refine an existing feature ticket into product-level graph items |
| `tspec-new-change` | Record a context-first implementation change against approved requirements |
| `tspec-refine-change` | Refine a change into detailed software requirements and tasks |
| `tspec-apply-change` | Implement the change's tasks and advance its state |
| `tspec-archive` | Validate and close a verified change |
| `tspec-validate` | Validate the traceability graph |
| `tspec-write-item` | Write one item of any declared role |
| `tspec-track` | Read a ticket or update its user-approved refinement section |

Related graph items may share optional `externalId=<id>` metadata for the same external item; local changes may omit it when linked to applicable approved requirements. `tspec-track --read <feature-ticket-id>` reads the ticket. `--update-refinement` writes only its unique `TSPEC refinement` section after the user approves the exact preview. The ticket remains authoritative for backlog position, status, and estimate; the workflow does not create/import tickets or update those fields.

=== Evaluate a workflow skill

Install dependencies and the Claude Code CLI, then run a skill's scenario suite:

[source,bash]
----
npm run eval:skills -- --skill tspec-explore
----

Results are written under `eval-results/` with paired transcripts and a JSON and Markdown summary.
See the xref:how-to/evaluate-workflow-skills.adoc[skill evaluation guide] for writing scenarios and reading results.

=== Build the Antora site

[source,bash]
----
npm run build
----

This publishes your project documentation with traceability matrices and coverage reports.

== Install for AI agents

`tracer-spec init` installs the workflow skills project-locally into the
harness directories of your choice:

[source,bash]
----
tracer-spec init --tools oh-my-pi,claude,agents   # pick harnesses
tracer-spec init --tools all                      # every supported harness
tracer-spec init --tools none                     # scaffold only, no skills
tracer-spec init                                  # interactive picker
----

Supported harnesses and where their skills land:

[width=100%, cols="30a,70a"]
|===
| Harness | Skill directory
| Oh My Pi (`oh-my-pi`) | `.omp/skills/`
| Claude Code (`claude`) | `.claude/skills/`
| Codex (`codex`) | `.agents/skills/`
| Pi (`pi`) | `.pi/skills/`
| Shared `.agents` (`agents`) | `.agents/skills/`
|===

Every harness reads the same `SKILL.md` files; only the directory differs.
Re-run `tracer-spec init --tools <ids>` to refresh them after upgrading.

== Repository structure

[source,text]
----
tracer-spec/
├── README.md
├── LICENSE
├── .gitignore
├── package.json
├── traceability.yml
├── antora-playbook.yml
├── bin/                          # tracer-spec CLI (init)
├── src/                          # scaffold logic
├── templates/                    # project scaffold
├── docs/                         # Antora content source (self-tracing site)
│   └── modules/specs/
│       ├── nav.adoc
│       └── pages/
│           ├── index.adoc
│           ├── getting-started.adoc
│           ├── how-to/
│           ├── reference/
│           ├── explanation/
│           ├── changes.adoc
│           ├── requirements.adoc
│           └── decisions.adoc
├── tspec/                        # temporary, change-scoped task checklists
└── skills/                       # Agent Skills for the workflow
    ├── tspec-explore/
    ├── tspec-refine-feature/
    ├── tspec-new-change/
    ├── tspec-refine-change/
    ├── tspec-apply-change/
    ├── tspec-archive/
    ├── tspec-validate/
    ├── tspec-track/
    └── tspec-write-item/

== Workflow

[source,text]
----
explore → refine feature ticket → propose change(s) → refine each change → accept → apply → archive
----

Product-level intent is refined from an existing feature ticket before implementation changes are proposed. One ticket may link to multiple changes, each with its own detailed requirements and execution tasks. A human acceptance gate plus validation enforces review before implementation.

== Build

[source,bash]
----
npm run validate
npm run build
----
