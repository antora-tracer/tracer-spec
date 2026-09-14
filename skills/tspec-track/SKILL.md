---
name: tspec-track
description: >
  Bridge a change to its issue-tracker issue: link or create the issue when a change is proposed, import a tracker-first issue as a seeded change, and push change status to the tracker at lifecycle boundaries. One-way only — never reconcile tracker state back into the graph. Use `--link`, `--create`, `--import`, or `--status`.
argument-hint: "<--link|--create|--import|--status> <change-id-or-issue-id>"
license: MIT
compatibility: antora-tracer
allowed-tools: Bash(antora-tracer:*, gh:*, curl:*)
---

Move a change's tracker issue at lifecycle boundaries, one-way.

## Config

Read `tspec.yml` beside `traceability.yml`.
`tracker.provider` is `none` (default), `github`, or `jira`.
When `provider: none`, every subcommand is a no-op: report that no tracker is configured and stop.
`github` uses the `gh` CLI; `jira` uses REST against the configured `url` and `project`.

## Subcommands

### `--link <change-id>`

Record an existing tracker issue on a change without creating one.
Prompt for the issue identifier, then write it as the `trackerId=` attribute on the change item's block header.

### `--create <change-id>`

Create a new issue in the configured tracker for the change, then write the returned identifier as the `trackerId=` attribute on the change item's block header.

### `--import <issue-id>`

Import a tracker-first issue as a new change.
Read the issue, write a change item seeded from its title and body, set `trackerId=` to the source issue, then delegate requirement and decision writing to `tspec-propose`'s machinery.

### `--status <change-id>`

Push the change's current lifecycle status to its linked tracker issue.
Map through the optional `tracker.status` table in `tspec.yml`; unlisted states pass through unchanged.

## Rules

- One-way only: never read tracker state back into the change's `status`.
- `trackerId` is a block-header attribute, not a relation — the issue stays outside the traceability graph.
- Provider specifics (`gh` CLI, Jira REST, status transition names) live only here; the lifecycle skills stay provider-agnostic.
- `--import` reuses `tspec-propose` for item writing; do not reimplement it.
