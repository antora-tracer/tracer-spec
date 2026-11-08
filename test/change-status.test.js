import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const cli = fileURLToPath(new URL('../bin/tspec.js', import.meta.url))
const config = `extends: minimal
roles:
  - change
relations:
  change:
    change:
      refines:
        reverse: refined_by
`

function project (t, items) {
  const directory = mkdtempSync(join(tmpdir(), 'tracer-status-'))
  t.after(() => rmSync(directory, { recursive: true, force: true }))
  mkdirSync(join(directory, 'docs'), { recursive: true })
  writeFileSync(join(directory, 'traceability.yml'), config)
  writeFileSync(join(directory, 'docs/changes.adoc'), items)
  return directory
}

function change (id, status, body = '') {
  return `[#${id}, item, role=change, status=${status}, title="${id}"]\n--\n${body}\n--\n`
}

function run (directory, id) {
  return spawnSync(process.execPath, [cli, 'status', id], { cwd: directory, encoding: 'utf8' })
}

test('reports lifecycle status and leaf readiness flags', (t) => {
  const directory = project(t, [
    change('CHG-REFINED', 'refined'),
    change('CHG-ACCEPTED', 'accepted'),
    change('CHG-PROPOSED', 'proposed'),
    change('CHG-IMPLEMENTED', 'implemented'),
    change('CHG-VERIFIED', 'verified'),
    change('CHG-CLOSED', 'closed')
  ].join('\n'))

  for (const [id, expected] of [
    ['CHG-REFINED', 'CHG-REFINED status=refined actionable=true finished=false'],
    ['CHG-ACCEPTED', 'CHG-ACCEPTED status=accepted actionable=true finished=false'],
    ['CHG-PROPOSED', 'CHG-PROPOSED status=proposed actionable=false finished=false'],
    ['CHG-IMPLEMENTED', 'CHG-IMPLEMENTED status=implemented actionable=false finished=false'],
    ['CHG-VERIFIED', 'CHG-VERIFIED status=verified actionable=false finished=false'],
    ['CHG-CLOSED', 'CHG-CLOSED status=closed actionable=false finished=true']
  ]) {
    const result = run(directory, id)
    assert.equal(result.status, 0, result.stderr)
    assert.equal(result.stdout.trim(), expected)
  }
})

test('reports a parent actionable only when every descendant is actionable', (t) => {
  const directory = project(t, [
    change('CHG-PARENT', 'proposed'),
    change('CHG-READY', 'refined', 'refines:CHG-PARENT[]'),
    change('CHG-ACCEPTED', 'accepted', 'refines:CHG-PARENT[]'),
    change('CHG-BLOCKED-PARENT', 'proposed'),
    change('CHG-BLOCKED', 'proposed', 'refines:CHG-BLOCKED-PARENT[]'),
    change('CHG-NESTED-PARENT', 'proposed'),
    change('CHG-MIDDLE', 'accepted', 'refines:CHG-NESTED-PARENT[]'),
    change('CHG-LEAF', 'refined', 'refines:CHG-MIDDLE[]'),
    change('CHG-REJECTED-PARENT', 'rejected'),
    change('CHG-REJECTED-CHILD', 'refined', 'refines:CHG-REJECTED-PARENT[]')
  ].join('\n'))

  assert.equal(run(directory, 'CHG-PARENT').stdout.trim(), 'CHG-PARENT status=proposed actionable=true finished=false')
  assert.equal(run(directory, 'CHG-BLOCKED-PARENT').stdout.trim(), 'CHG-BLOCKED-PARENT status=proposed actionable=false finished=false')
  assert.equal(run(directory, 'CHG-NESTED-PARENT').stdout.trim(), 'CHG-NESTED-PARENT status=proposed actionable=true finished=false')
  assert.equal(run(directory, 'CHG-REJECTED-PARENT').stdout.trim(), 'CHG-REJECTED-PARENT status=rejected actionable=false finished=false')
})

test('rejects parent status when a descendant ID is duplicated', (t) => {
  const directory = project(t, `${change('CHG-PARENT', 'proposed')}\n${change('CHG-CHILD', 'refined', 'refines:CHG-PARENT[]')}`)
  writeFileSync(join(directory, 'docs/duplicate.adoc'), change('CHG-CHILD', 'proposed', 'refines:CHG-PARENT[]'))
  const result = run(directory, 'CHG-PARENT')

  assert.notEqual(result.status, 0)
  assert.equal(result.stdout, '')
  assert.match(result.stderr, /duplicate.*CHG-CHILD/i)
})

test('rejects same-file duplicate descendants skipped by parsing', (t) => {
  const directory = project(t, [
    change('CHG-PARENT', 'proposed'),
    change('CHG-CHILD', 'refined'),
    change('CHG-CHILD', 'accepted', 'refines:CHG-PARENT[]')
  ].join('\n'))
  const result = run(directory, 'CHG-PARENT')

  assert.notEqual(result.status, 0)
  assert.equal(result.stdout, '')
  assert.match(result.stderr, /duplicate.*CHG-CHILD/i)
})

test('rejects duplicate change IDs instead of reporting the first item', (t) => {
  const directory = project(t, change('CHG-DUP', 'refined'))
  writeFileSync(join(directory, 'docs/duplicate.adoc'), change('CHG-DUP', 'accepted'))
  const result = run(directory, 'CHG-DUP')

  assert.notEqual(result.status, 0)
  assert.equal(result.stdout, '')
  assert.match(result.stderr, /duplicate.*CHG-DUP/i)
})
test('rejects duplicate IDs defined twice in one document', (t) => {
  const directory = project(t, `${change('CHG-DUP', 'refined')}\n${change('CHG-DUP', 'accepted')}`)
  const result = run(directory, 'CHG-DUP')

  assert.notEqual(result.status, 0)
  assert.equal(result.stdout, '')
  assert.match(result.stderr, /duplicate.*CHG-DUP/i)
})


test('rejects missing and non-change IDs without a status record', (t) => {
  const directory = project(t, `${change('CHG-ONE', 'refined')}\n[#REQ-ONE, item, role=requirement, status=draft]\n--\nRequirement.\n--\n`)

  for (const id of ['CHG-MISSING', 'REQ-ONE']) {
    const result = run(directory, id)
    assert.notEqual(result.status, 0)
    assert.equal(result.stdout, '')
    assert.notEqual(result.stderr, '')
    assert.match(result.stderr, /change|item|found/i)
  }
})

test('rejects a refinement cycle unrelated to the requested change', (t) => {
  const directory = project(t, [
    change('CHG-REQUESTED', 'refined'),
    change('CHG-CYCLE-A', 'proposed', 'refines:CHG-CYCLE-B[]'),
    change('CHG-CYCLE-B', 'proposed', 'refines:CHG-CYCLE-A[]')
  ].join('\n'))
  const result = run(directory, 'CHG-REQUESTED')

  assert.notEqual(result.status, 0)
  assert.equal(result.stdout, '')
  assert.match(result.stderr, /cycle/i)
})

test('rejects cyclic refinement without changing graph or task files', (t) => {
  const directory = project(t, [
    change('CHG-CYCLE-A', 'closed', 'refines:CHG-CYCLE-B[]'),
    change('CHG-CYCLE-B', 'proposed', 'refines:CHG-CYCLE-A[]')
  ].join('\n'))
  const tasksDirectory = join(directory, 'tspec/CHG-CYCLE-A')
  mkdirSync(tasksDirectory, { recursive: true })
  const taskPath = join(tasksDirectory, 'tasks.md')
  writeFileSync(taskPath, '- [ ] Keep this task unchanged\n')
  const source = readFileSync(join(directory, 'docs/changes.adoc'), 'utf8')
  const config = readFileSync(join(directory, 'traceability.yml'), 'utf8')
  const tasks = readFileSync(taskPath, 'utf8')
  const result = run(directory, 'CHG-CYCLE-A')

  assert.notEqual(result.status, 0)
  assert.equal(result.stdout, '')
  assert.match(result.stderr, /cycle/i)
  assert.equal(readFileSync(join(directory, 'docs/changes.adoc'), 'utf8'), source)
  assert.equal(readFileSync(join(directory, 'traceability.yml'), 'utf8'), config)
  assert.equal(readFileSync(taskPath, 'utf8'), tasks)
})
test('resolves config and docs independently from the caller directory', (t) => {
  const directory = project(t, change('CHG-ABSOLUTE', 'refined'))
  const caller = mkdtempSync(join(tmpdir(), 'tracer-caller-'))
  t.after(() => rmSync(caller, { recursive: true, force: true }))
  const relativeProject = relative(caller, directory)
  mkdirSync(join(caller, 'docs'), { recursive: true })
  writeFileSync(join(caller, 'docs/changes.adoc'), change('CHG-CWD-DOCS', 'accepted'))

  const configOnly = spawnSync(process.execPath, [cli, 'status', 'CHG-CWD-DOCS', '-c', join(relativeProject, 'traceability.yml')], {
    cwd: caller,
    encoding: 'utf8'
  })
  assert.equal(configOnly.status, 0, configOnly.stderr)
  assert.equal(configOnly.stdout.trim(), 'CHG-CWD-DOCS status=accepted actionable=true finished=false')

  writeFileSync(join(caller, 'traceability.yml'), config)
  mkdirSync(join(caller, 'alternate-docs'), { recursive: true })
  writeFileSync(join(caller, 'alternate-docs/changes.adoc'), change('CHG-ALT-DOCS', 'closed'))
  const docsOnly = spawnSync(process.execPath, [cli, 'status', 'CHG-ALT-DOCS', '--docs', 'alternate-docs'], {
    cwd: caller,
    encoding: 'utf8'
  })
  assert.equal(docsOnly.status, 0, docsOnly.stderr)
  assert.equal(docsOnly.stdout.trim(), 'CHG-ALT-DOCS status=closed actionable=false finished=true')

  const both = spawnSync(process.execPath, [cli, 'status', 'CHG-ABSOLUTE', '--config', join(relativeProject, 'traceability.yml'), '--docs', join(relativeProject, 'docs')], {
    cwd: caller,
    encoding: 'utf8'
  })
  assert.equal(both.status, 0, both.stderr)
  assert.equal(both.stdout.trim(), 'CHG-ABSOLUTE status=refined actionable=true finished=false')
})

test('rejects unreadable explicit status paths without a status line', (t) => {
  const directory = project(t, change('CHG-ONE', 'refined'))
  const missingConfig = spawnSync(process.execPath, [cli, 'status', 'CHG-ONE', '-c', 'missing.yml'], {
    cwd: directory,
    encoding: 'utf8'
  })
  const missingDocs = spawnSync(process.execPath, [cli, 'status', 'CHG-ONE', '--docs', 'missing-docs'], {
    cwd: directory,
    encoding: 'utf8'
  })

  for (const result of [missingConfig, missingDocs]) {
    assert.notEqual(result.status, 0)
    assert.equal(result.stdout, '')
    assert.notEqual(result.stderr, '')
  }
})
