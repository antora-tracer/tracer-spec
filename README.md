= Tracer Spec Workflow

Spec-driven development workflow built on Antora Tracer.

This repository eats its own dog food: its requirements, design concepts, ADRs, changes, and workflow documentation are traceable items published by Antora.

== Purpose

Tracer Spec Workflow replaces OpenSpec's parallel artifact hierarchy with a single project knowledge base.

Durable artifacts are written as traceable Antora content:

* use cases
* requirements
* architecture decision records (ADRs)
* stable design concepts
* changes

Tasks are temporary execution guidance.
When planning and implementation are separated in time, a change plan may be externalized as an ordinary AsciiDoc file.

== Quick Start

=== Prerequisites

- Node.js 20+
- `antora-tracer` CLI installed and available on `PATH`
- Antora (installed via npm)

=== Install this template

[source,bash]
----
git clone https://github.com/rattermeyer/tracer-spec.git my-project
cd my-project
npm install
----

=== Validate the example graph

[source,bash]
----
node /path/to/antora-tracer/lib/src/cli.js validate -i docs --config traceability.yml
----

Expected output:

[source,text]
----
Validating requirements traceability...
No validation errors found
Summary: 10 items, 11 relationships
----

=== Customize for your project

1. Edit the project name and description in `README.md` and `antora.yml`.
2. Update `docs/*.adoc` with your own use cases, requirements, changes, and ADRs.
3. Adapt `traceability.yml` if you need additional roles or relationships.
4. Run validation regularly: `npm run validate`

=== Use the skills

Install the skills into your Pi agent or LiteLLM proxy:

[source,bash]
----
# Copy skills to your agent's skill directory
cp -r skills/* ~/.pi/agent/skills/

# Or register them with LiteLLM Skills Gateway
# (see each skill's SKILL.md for endpoint details)
----

Then trigger them in your workflow:

[source,bash]
----
pi explore-change "Add user authentication"
pi write-use-case CHG-001
pi write-requirement CHG-001
pi record-adr CHG-001
pi review-design CHG-001
pi plan-change CHG-001
pi validate-traceability
----

=== Build the Antora site

[source,bash]
----
npm run build
# Output: ./build/site/index.html
----

This publishes your project documentation with traceability matrices and coverage reports.

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
├── docs/                         # project-level source documents
│   ├── requirements.adoc
│   ├── design.adoc
│   ├── adrs.adoc
│   ├── changes.adoc
│   └── use-cases.adoc
├── plans/                        # temporary, change-scoped execution plans
├── skills/                       # Agent Skills for the workflow
│   ├── explore-change/
│   ├── write-use-case/
│   ├── write-requirement/
│   ├── record-adr/
│   ├── review-design/
│   ├── plan-change/
│   └── validate-traceability/
└── examples/tracer/              # self-tracing Antora site
----

== Workflow

[source,text]
----
Exploration → Change → Use case → Requirement → ADR → Design concept → Plan → Implementation → Verification
----

The graph is the source of truth.
Git and pull requests provide review, authorization, and history.
The initial workflow validates status values and structural relationships without enforcing transitions.

== Build

[source,bash]
----
antora-tracer validate -i docs
npx antora antora-playbook.yml
----
