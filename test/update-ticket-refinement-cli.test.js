import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const script = fileURLToPath(new URL('../scripts/update-ticket-refinement.js', import.meta.url))

function run (mode, input) {
  return spawnSync(process.execPath, [script, mode], { input: JSON.stringify(input), encoding: 'utf8' })
}

test('CLI writes the updated Markdown body as JSON', () => {
  const result = run('markdown', { body: '# Feature\n', section: '## TSPEC refinement\nSummary.\n' })
  assert.equal(result.status, 0)
  assert.equal(JSON.parse(result.stdout).body, '# Feature\n\n## TSPEC refinement\nSummary.\n')
  assert.equal(result.stderr, '')
})

test('CLI accepts ADF input and outputs the full updated document', () => {
  const heading = { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'TSPEC refinement' }] }
  const result = run('adf', { body: { type: 'doc', version: 1, content: [] }, sectionNodes: [heading] })
  assert.equal(result.status, 0)
  assert.deepEqual(JSON.parse(result.stdout).body.content, [heading])
})

test('CLI rejects invalid mode and malformed input with a nonzero exit', () => {
  assert.notEqual(run('unknown', {}).status, 0)
  assert.notEqual(run('markdown', { body: '## TSPEC refinement', section: 'missing marker' }).status, 0)
})
