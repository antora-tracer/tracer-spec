import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const cli = fileURLToPath(new URL('../bin/tspec.js', import.meta.url))

test('CLI help identifies tspec and retains its existing commands', () => {
  const result = spawnSync(process.execPath, [cli, '--help'], { encoding: 'utf8' })

  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /^Usage: tspec \[options\] \[command\]/)
  assert.match(result.stdout, /\n  init\b/)
  assert.match(result.stdout, /\n  status\b/)
})
