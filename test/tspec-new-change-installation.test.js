import assert from 'node:assert/strict'
import { existsSync, lstatSync, mkdtempSync, realpathSync, rmSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const cli = fileURLToPath(new URL('../bin/tracer-spec.js', import.meta.url))
const sourceSkill = fileURLToPath(new URL('../skills/tspec-new-change/SKILL.md', import.meta.url))

test('init installs the renamed change skill and command', (t) => {
  const directory = mkdtempSync(join(tmpdir(), 'tracer-spec-'))
  t.after(() => rmSync(directory, { recursive: true, force: true }))
  const result = spawnSync(process.execPath, [cli, 'init', '--tools', 'oh-my-pi', '--link'], {
    cwd: directory,
    encoding: 'utf8'
  })
  assert.equal(result.status, 0, result.stderr)

  const installedSkill = join(directory, '.omp/skills/tspec-new-change/SKILL.md')
  const installedCommand = join(directory, '.omp/commands/tspec-new-change.md')
  assert.equal(existsSync(installedSkill), true)
  assert.equal(lstatSync(installedSkill).isSymbolicLink(), true)
  assert.equal(realpathSync(installedSkill), realpathSync(sourceSkill))
  assert.match(readFileSync(installedCommand, 'utf8'), /tspec-new-change/)
  assert.equal(existsSync(join(directory, '.omp/skills/tspec-propose/SKILL.md')), false)
  assert.equal(existsSync(join(directory, '.omp/commands/tspec-propose.md')), false)
})
