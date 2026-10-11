import assert from 'node:assert/strict'
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const cli = fileURLToPath(new URL('../bin/tracer-spec.js', import.meta.url))

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
