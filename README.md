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

== Prerequisites

The `antora-tracer` CLI must be installed and available on `PATH`.
Node.js and Antora are required to build the example site.

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
