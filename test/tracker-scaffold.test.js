import assert from 'node:assert/strict'
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const cli = fileURLToPath(new URL('../bin/tspec.js', import.meta.url))

function projectDir (t) {
  const dir = mkdtempSync(join(tmpdir(), 'tracer-spec-'))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  return dir
}

function init (directory, options) {
  return spawnSync(process.execPath, [cli, 'init', '--tools', 'oh-my-pi', ...options], {
    cwd: directory,
    encoding: 'utf8'
  })
}

test('init installs tracker helper CLIs runnable from the project root', (t) => {
  const directory = projectDir(t)
  const result = init(directory, ['--link'])
  assert.equal(result.status, 0, result.stderr)

  const update = spawnSync(process.execPath, [join(directory, 'scripts/update-ticket-refinement.js'), 'markdown'], {
    cwd: directory,
    input: JSON.stringify({ body: '# Feature\n', section: '## TSPEC refinement\nSummary.\n' }),
    encoding: 'utf8'
  })
  assert.equal(update.status, 0, update.stderr)
  assert.equal(JSON.parse(update.stdout).body, '# Feature\n\n## TSPEC refinement\nSummary.\n')

  const forgejo = spawnSync(process.execPath, [join(directory, 'scripts/forgejo-issue.js'), 'read', 'https://forgejo.example.org', 'acme/specs', '42'], {
    cwd: directory,
    env: { ...process.env, FORGEJO_TOKEN: '' },
    encoding: 'utf8'
  })
  assert.notEqual(forgejo.status, 0)
  assert.match(forgejo.stderr, /FORGEJO_TOKEN/)
})

test('init does not write through tracker helper symlinks', (t) => {
  const directory = projectDir(t)
  const scripts = join(directory, 'scripts')
  const existingTarget = join(directory, 'outside.js')
  const danglingTarget = join(directory, 'missing.js')
  const forgejo = join(scripts, 'forgejo-issue.js')
  const update = join(scripts, 'update-ticket-refinement.js')
  mkdirSync(scripts)
  writeFileSync(existingTarget, 'preserve this target')
  symlinkSync(existingTarget, forgejo)
  symlinkSync(danglingTarget, update)

  let result = init(directory, ['--link'])
  assert.equal(result.status, 0, result.stderr)
  assert.equal(readFileSync(existingTarget, 'utf8'), 'preserve this target')
  assert.equal(existsSync(danglingTarget), false)

  result = init(directory, ['--link', '--force'])
  assert.equal(result.status, 0, result.stderr)
  assert.equal(readFileSync(existingTarget, 'utf8'), 'preserve this target')
  assert.equal(existsSync(danglingTarget), false)
  assert.equal(lstatSync(forgejo).isSymbolicLink(), false)
  assert.equal(lstatSync(update).isSymbolicLink(), false)
})

test('init does not write tracker helpers through a symlinked directory', (t) => {
  const directory = projectDir(t)
  const external = join(directory, 'external')
  mkdirSync(external)
  symlinkSync(external, join(directory, 'scripts'), 'dir')

  const result = init(directory, ['--link'])
  assert.equal(result.status, 0, result.stderr)
  assert.equal(existsSync(join(external, 'forgejo-issue.js')), false)
  assert.equal(existsSync(join(external, 'update-ticket-refinement.js')), false)
})

test('init scaffolds a partials layout consistent with the workflow skills', (t) => {
  const directory = projectDir(t)
  const result = init(directory, ['--link'])
  assert.equal(result.status, 0, result.stderr)

  const specs = join(directory, 'docs/modules/specs')

  // Every writable role has a partials/ directory so the skills' hardcoded
  // destinations exist without the agent having to create them.
  for (const role of ['changes', 'decisions', 'use-cases', 'architecture', 'designs', 'adrs', 'requirements']) {
    assert.ok(
      existsSync(join(specs, 'partials', role)),
      `expected partials/${role}/ to be scaffolded`
    )
  }

  // Role pages are wired to their partials so a written item renders.
  const changes = readFileSync(join(specs, 'pages/changes.adoc'), 'utf8')
  assert.match(changes, /include::partial\$changes\/[A-Za-z0-9-]*\.adoc\[opts=optional\]/)

  // Guidance tells the agent partials are the destination.
  const agents = readFileSync(join(directory, 'AGENTS.md'), 'utf8')
  assert.match(agents, /partials\//)
  assert.doesNotMatch(agents, /items are pages under/)
})

test('scaffolded role pages build without include errors', (t) => {
  const directory = projectDir(t)
  const result = init(directory, ['--link'])
  assert.equal(result.status, 0, result.stderr)

  // Example lines must be illustrative, not live. Measured behaviour:
  //   macro      backticks   listing block
  //   include::  safe        live unless escaped with a backslash
  //   xref:      live        safe
  // So an include is checked on every line, and an xref only outside a
  // listing block; a placeholder is a target or link text holding <...>.
  for (const page of ['changes', 'requirements', 'decisions', 'use-cases', 'architecture', 'designs', 'adrs']) {
    const body = readFileSync(
      join(directory, 'docs/modules/specs/pages', `${page}.adoc`),
      'utf8'
    )
    for (const line of body.split('\n')) {
      if (!line.startsWith('include::partial$')) continue
      const target = line.slice('include::'.length, line.indexOf('['))
      assert.doesNotMatch(
        target,
        /<|>/,
        `${page}.adoc has a live placeholder include: ${line}`
      )
    }
    for (const line of body.replace(/\n-{4,}\n[\s\S]*?\n-{4,}\n/g, '\n').split('\n')) {
      for (const m of line.matchAll(/(^|[^\\])xref:([^\[]*)\[([^\]]*)\]/g)) {
        assert.doesNotMatch(
          m[2] + m[3],
          /<|>/,
          `${page}.adoc has a live placeholder xref: ${m[0]}. Escape it as \\xref:.`
        )
      }
    }
  }
})
