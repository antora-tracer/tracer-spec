= Tracer Spec

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
tspec-explore "your feature"                  # shape the feature intent
tspec-refine-feature <feature-ticket-id>       # refine existing ticket into product-level graph items
tspec-new-change "Your first change"           # record one requirement-anchored change
tspec-refine-change CHG-001                    # software requirements, durable design, and temporary tasks
tspec-apply-change CHG-001                     # implement the refined tasks
tspec status CHG-001                   # report lifecycle, actionable, finished
tspec-archive CHG-001                          # validate and close
tspec-validate                                 # check the graph
----

Related graph items may share optional `externalId=<id>` metadata when associated with the same external item. `tspec-new-change` requires applicable approved requirement anchors, but not an external ID.
The durable graph includes requirements, changes, arc42-organized architecture items, per-change designs, domain/business decisions, and ADRs. Change refinement creates a design before temporary tasks; archive retains it and reconciles the architecture baseline to the implemented system.
`tspec-track --read <feature-ticket-id>` reads the ticket. Its `--update-refinement` operation writes only the user-approved `TSPEC refinement` section; the ticket remains authoritative for backlog position, status, and estimate.

== Build the docs site

[source,bash]
----
npm run build
----
