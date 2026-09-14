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
and installs the seven workflow skills into your agent harness directories
(default: Oh My Pi `.omp/skills/`, Claude `.claude/skills/`, shared `.agents/skills/`).
Pass `--tools claude,codex,agents` to pick harnesses, `--tools all` for every
supported one, or `--tools none` to skip.

== Purpose

The Tracer Spec Workflow replaces OpenSpec's parallel artifact hierarchy with a single traceability graph.

The grammar is three tiers:

* *Tier 1 (core):* changes and requirements — the spec unit.
* *Tier 2 (understanding):* decisions and tests, plus growth roles (`use_case`, `design_concept`, `goal`, `scenario`, `arc42`) added when a project needs them.
* *Tier 3 (temporary):* task checklists under `tspec/<change-id>/`, deleted when the change closes.

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
2. Update the pages under `docs/modules/specs/pages/` with your own changes, requirements, and decisions.
3. Adapt `traceability.yml` if you need additional growth roles or relationships.
4. Run validation regularly: `npm run validate`

=== Use the workflow

[source,text]
----
explore → propose → apply → archive
----

The seven skills:

| Skill | Purpose |
|-------|---------|
| `tspec-explore` | Enter explore mode; shape a change sketch without writing |
| `tspec-propose` | Write a change, its requirements, and its decisions atomically |
| `tspec-apply` | Implement the change's tasks and advance its state |
| `tspec-archive` | Validate and close a verified change |
| `tspec-validate` | Validate the traceability graph |
| `tspec-write-item` | Write one item of any declared role |
| `tspec-track` | Bridge a change to its issue-tracker issue (link, create, import, status) |

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
    ├── tspec-propose/
    ├── tspec-apply/
    ├── tspec-archive/
    ├── tspec-validate/
    ├── tspec-track/
    └── tspec-write-item/
----

== Workflow

[source,text]
----
explore → propose → apply → archive
----

The graph is the source of truth.
Git and pull requests provide review, authorization, and history.
A human acceptance gate plus validation enforces review before implementation.

== Build

[source,bash]
----
npm run validate
npm run build
----
