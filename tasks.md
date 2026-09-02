= Tracer Spec Workflow — Task List

== Repository setup

* [x] Create the `tracer-spec` repository at `/home/richard/devel/git/tracer-spec`.
* [x] Initialize Git with `main` as the default branch.
* [x] Create the initial directory structure.
* [x] Add an initial README describing the project and workflow.
* [x] Add `LICENSE`.
* [x] Add `.gitignore`.
* [x] Add `package.json` and the minimum Antora build dependencies.

== Traceability model

* [x] Define the project roles in `traceability.yml`:
** [x] `use_case`
** [x] `requirement`
** [x] `change`
** [x] `adr`
** [x] `design_concept`
* [x] Define the durable relationships between the roles.
* [x] Define workflow states and declarative transitions.
* [x] Define structural validation rules for important states.
* [x] Define useful traceability matrices.
* [ ] Validate the configuration with the installed `antora-tracer` CLI.

== Project dogfood documents

* [x] Create the project-level use-case document.
* [x] Create the project-level requirements document.
* [x] Create the project-level design-concepts document.
* [x] Create the project-level ADR document.
* [x] Create the project-level changes document.
* [x] Add initial items describing Tracer Spec Workflow itself.
* [x] Link the documents into one complete traceability chain.
* [x] Add a temporary plan example showing delayed execution and plan changes.

== Antora example site

* [x] Add an Antora playbook.
* [x] Add an Antora component descriptor and navigation.
* [x] Publish the project-level documents as the self-tracing example site.
* [x] Add workflow explanation and authoring guidance pages.
* [ ] Build the site and fix any item or relationship errors.

== Agent Skills

* [x] Define the shared skill conventions and workflow vocabulary.
* [x] Implement `explore-change`.
* [x] Implement `write-use-case`.
* [x] Implement `write-requirement`.
* [x] Implement `record-adr`.
* [x] Implement `review-design`.
* [x] Implement `plan-change`.
* [x] Implement `validate-traceability`.
* [x] Make every skill assume the `antora-tracer` CLI is installed.
* [ ] Test each skill against the repository's own documents.

== Documentation and release

* [x] Document the complete Tracer Spec Workflow.
* [x] Document the distinction between durable artifacts and temporary plans.
* [x] Document the policy that Git/PR review provides authorization and history.
* [x] Document that status transitions are declarative but not initially enforced.
* [ ] Add contribution guidance.
* [ ] Run validation, tests, linting, and the Antora build.
* [ ] Review the repository for duplicated or unnecessary artifacts.
* [x] Commit the initial working version.
