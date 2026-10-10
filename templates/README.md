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
tspec-explore "your feature"                  # shape the feature intent
tspec-refine-feature <feature-ticket-id>       # refine existing ticket into product-level graph items
tspec-propose CHG-001                          # propose an implementation change
tspec-refine-change CHG-001                    # detailed software requirements and tasks
tspec-apply-change CHG-001                     # implement the refined tasks
tspec-archive CHG-001                          # validate and close
tspec-validate                                 # check the graph
----

One existing feature ticket can link to many independent changes through shared
`featureTicketId=<id>` metadata. `tspec-propose` does not author detailed
software requirements or tasks; refine each change before creating its tasks.
`tspec-track --read <feature-ticket-id>` reads the ticket. Its
`--update-refinement` operation writes only the user-approved `TSPEC refinement`
section; the ticket remains authoritative for backlog position, status, and
estimate.

== Build the docs site

[source,bash]
----
npm run build
----
