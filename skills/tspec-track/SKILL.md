---
name: tspec-track
description: >
  Use when reading an existing feature ticket or updating its dedicated TSPEC refinement section after the user approves the exact preview.
argument-hint: "<--read|--update-refinement> <feature-ticket-id>"
license: MIT
compatibility: antora-tracer
allowed-tools: Bash(gh:*, curl:*, node:*)
---

Read an existing feature ticket or update exactly its `TSPEC refinement` section after explicit user approval.

## Config

Read `tspec.yml` beside `traceability.yml`. `tracker.provider` is `none` (default), `github`, or `jira`. GitHub uses authenticated `gh`. Jira uses `tracker.jira.url` and the user's project; authenticate with an existing `~/.netrc` entry for the Jira host, using `curl --netrc` (never put a token in command arguments, project config, output, or a temporary file). With provider `none`, accept ticket text supplied by the user and return a manual draft; do not access a provider.

## `--read <feature-ticket-id>`

- GitHub: `gh issue view <id> --repo <owner/repo> --json title,body`; show title and body without editing.
- Jira Cloud: `curl --fail --silent --show-error --netrc --header 'Accept: application/json' '<url>/rest/api/3/issue/<key>?fields=summary,description'`; require a valid `~/.netrc` `machine <host> login <email> password <api-token>` entry, and retain Jira's returned description as ADF. Never use `-k`, print the auth file, or capture the token into command text.
- If config, authentication, or response is unavailable, report the limitation and request ticket text; do not fall back to another provider or fabricate contents.


## `--update-refinement <feature-ticket-id>`

1. This operation is called only after the user approves the exact section preview. Re-read title/body after approval and compare the current body to the previewed body. If changed, abort before writing and request fresh preview approval.
2. Build a complete section: Markdown begins with `## TSPEC refinement`; ADF starts with one top-level level-2 heading with that text.
3. From the repository root, invoke `node scripts/update-ticket-refinement.js markdown` or `adf` with JSON on stdin: `{ "body": <description>, "section": <Markdown section> }` or `{ "body": <ADF document>, "sectionNodes": <ADF section nodes> }`. Capture its JSON `{ "body": <updated description> }`; nonzero exit means no write.
4. GitHub: send the complete updated Markdown body through a private temp file to `gh issue edit <id> --repo <owner/repo> --body-file <file>`, then remove the temp file. Jira Cloud: use `curl --fail --silent --show-error --netrc --request PUT --header 'Accept: application/json' --header 'Content-Type: application/json' --data-binary @- '<url>/rest/api/3/issue/<key>'` with body `{"fields":{"description":<updated ADF>}}`. Jira requires the user's existing `~/.netrc` entry described above; never use `-k` or put credentials in args/files.
5. Report success only after the provider confirms the write. On failure, leave the graph unchanged/canonical and provide the exact section for retry. If ADF cannot be preserved, no Jira PUT.

The only operations are `--read` and `--update-refinement`; tickets already exist. Never create/import/link a ticket, change status/backlog, or set estimates. Update only the unique section and preserve surrounding content. Provider details stay here; feature/change skills remain provider-agnostic.
