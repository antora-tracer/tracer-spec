# Refinement Evaluation Fixture

This is an isolated offline project. `tspec.yml` sets `tracker.provider: none`; use only ticket text supplied directly in the prompt. Never call a tracker or network service.

Canonical items live under `docs/modules/specs/pages/`. Read `traceability.yml` for roles, relation names, state workflow, and ID prefixes. Use `antora-tracer next-id --prefix <PREFIX> -i docs` and validate with `antora-tracer validate -i docs --config traceability.yml` when available.
