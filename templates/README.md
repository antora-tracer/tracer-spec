= {{title}}

A Tracer Spec Workflow project (spec-driven development on Antora Tracer).

== Quick Start

[source,bash]
----
npm install
antora-tracer validate -i docs --config traceability.yml
----

== Workflow

The workflow skills live in `skills/`. Install them into your AI assistant's
skill directory (see `AGENTS.md`), then drive the workflow:

[source,bash]
----
tspec-explore "your feature"    # shape a change sketch
tspec-propose CHG-001           # change + requirements + decisions + tasks
tspec-apply CHG-001             # implement the tasks
tspec-archive CHG-001           # validate and close
tspec-validate                  # check the graph
----

== Build the docs site

[source,bash]
----
npm run build
----
