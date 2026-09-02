= Tracer Spec Workflow — Task List

== Repository setup

* [x] Create the `tracer-spec` repository at `/home/richard/devel/git/tracer-spec`.
* [x] Initialize Git with `main` as the default branch.
* [x] Create the initial directory structure.
* [x] Add an initial README describing the project and workflow.
* [ ] Add `LICENSE`.
* [ ] Add `.gitignore`.
* [ ] Add `package.json` and the minimum Antora build dependencies.

== Traceability model

* [ ] Define the project roles in `traceability.yml`:
** `use_case`
** `requirement`
** `change`
** `adr`
** `design_concept`
** `test`
* [ ] Define the durable relationships between the roles.
* [ ] Define workflow states and declarative transitions.
* [ ] Define structural validation rules for important states.
* [ ] Define useful traceability matrices.
* [ ] Validate the configuration with the installed `antora-tracer` CLI.

== Project dogfood documents

* [ ] Create the project-level use-case document.
* [ ] Create the project-level requirements document.
* [ ] Create the project-level design-concepts document.
* [ ] Create the project-level ADR document.
* [ ] Create the project-level changes document.
* [ ] Add initial items describing Tracer Spec Workflow itself.
* [ ] Link the documents into one complete traceability chain.
* [ ] Add a temporary plan example showing delayed execution and plan changes.

== Antora example site

* [ ] Add an Antora playbook.
* [ ] Add an Antora component descriptor and navigation.
* [ ] Publish the project-level documents as the self-tracing example site.
* [ ] Add workflow explanation and authoring guidance pages.
* [ ] Build the site and fix any item or relationship errors.

== Agent Skills

* [ ] Define the shared skill conventions and workflow vocabulary.
* [ ] Implement `explore-change`.
* [ ] Implement `write-use-case`.
* [ ] Implement `write-requirement`.
* [ ] Implement `record-adr`.
* [ ] Implement `review-design`.
* [ ] Implement `plan-change`.
* [ ] Implement `validate-traceability`.
* [ ] Make every skill assume the `antora-tracer` CLI is installed.
* [ ] Test each skill against the repository's own documents.

== Documentation and release

* [ ] Document the complete Tracer Spec Workflow.
* [ ] Document the distinction between durable artifacts and temporary plans.
* [ ] Document the policy that Git/PR review provides authorization and history.
* [ ] Document that status transitions are declarative but not initially enforced.
* [ ] Add contribution guidance.
* [ ] Run validation, tests, linting, and the Antora build.
* [ ] Review the repository for duplicated or unnecessary artifacts.
* [ ] Commit the initial working version.
