# CHG-018 Tasks

- [x] Add `asciidoctor-kroki` pinned to the `0.18.2` line to `devDependencies` in `package.json` and the lock file.
- [x] Register the extension in `antora-playbook.yml` under `asciidoc.extensions` with the attribute `kroki-fetch-diagram: true`.
- [x] Add the §3 Context and Scope C4 level-1 diagram: contributor, coding agent, git host, optional issue tracker, build-time rendering service.
- [x] Add the §5 Building Block View C4 level-2 container diagram: traceability graph, stage skills, `tspec` CLI, published site, with ARC-001/002/003 as components.
- [x] Add the §6 Runtime View sequence diagram for the stage flow from explore through archive, including graph validation and the conformance gate.
- [x] Add the §7 Deployment View diagram: repository, harness directories, documentation build, published site.
- [x] Add the §8 Crosscutting Concepts diagram: durable-versus-temporary artifact split and identifier allocation.
- [x] Add a diagram inside `partials/architecture/ARC-002-staged-change-lifecycle.adoc` and add `updated_by:CHG-018[]` to it.
- [x] Document the default notation (C4) and the traditional-UML alternative in `docs/modules/specs/pages/guidance/architecture.adoc`.
- [x] Document `kroki-server-url` and `kroki-fetch-diagram` in `docs/modules/specs/pages/reference/config.adoc`, including the local-service option for air-gapped builds.
- [x] Mirror the playbook extension and attribute, the `devDependencies` entry, the guidance, and one authoring slot per view into the scaffold template (`templates/antora-playbook.yml`, `templates/package.json`, `templates/docs/modules/specs/pages/guidance/architecture.adoc`, `templates/docs/modules/specs/pages/architecture.adoc`).
- [x] Verify a built page embeds each diagram with no runtime reference to the rendering service, and that an unreachable service degrades to source with a warning instead of failing the build.
- [x] Verify a freshly scaffolded project builds with the extension configured and a slot in each view.
- [x] Run `npx antora antora-playbook.yml` and `antora-tracer validate -i docs --config traceability.yml`.
