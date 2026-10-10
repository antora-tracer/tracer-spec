import assert from 'node:assert/strict'
import test from 'node:test'
import { replaceAdfSection, replaceMarkdownSection } from '../scripts/update-ticket-refinement.js'

const heading = (level, text) => ({
  type: 'heading',
  attrs: { level },
  content: [{ type: 'text', text }],
})
const paragraph = (text) => ({ type: 'paragraph', content: [{ type: 'text', text }] })

test('Markdown insertion preserves the existing description and is retry-safe', () => {
  const body = '# Feature\n\nExisting description.\n'
  const section = '## TSPEC refinement\n\nSummary.\n'
  const expected = `${body}\n${section}`
  assert.equal(replaceMarkdownSection(body, section), expected)
  assert.equal(replaceMarkdownSection(expected, section), expected)
})

test('Markdown replacement stops at the next level-one or level-two heading', () => {
  const body = '# Feature\nBefore.\n## TSPEC refinement\nOld.\n### Detail\nKept in section.\n## Other\nAfter.\n'
  const section = '## TSPEC refinement\nNew.\n'
  assert.equal(
    replaceMarkdownSection(body, section),
    '# Feature\nBefore.\n## TSPEC refinement\nNew.\n## Other\nAfter.\n'
  )
})

test('Markdown ignores fenced code and rejects duplicate or nested target headings', () => {
  const fenced = 'Example:\n```md\n## TSPEC refinement\nnot a section\n```\n'
  const section = '## TSPEC refinement\nSummary.\n'
  assert.equal(replaceMarkdownSection(fenced, section), `${fenced}\n${section}`)
  assert.throws(() => replaceMarkdownSection('## TSPEC refinement\nA\n## TSPEC refinement\nB', section), /duplicate/i)
  assert.throws(() => replaceMarkdownSection('### TSPEC refinement\nNested', section), /nested/i)
  assert.throws(() => replaceMarkdownSection('# TSPEC refinement\nWrong level', section), /level|nested/i)
})

test('Markdown rejects an unclosed code fence rather than editing ambiguous content', () => {
  assert.throws(() => replaceMarkdownSection('## TSPEC refinement\n```\n', '## TSPEC refinement\nNew'), /fence|malformed/i)
  assert.throws(() => replaceMarkdownSection('## TSPEC refinement\nA\n## Another\nB', '## TSPEC refinement\nNew\n## Broken boundary'), /malformed|boundary/i)
})


test('Markdown ignores TSPEC headings inside HTML comments and preserves comment contents', () => {
  const body = '# Feature\n\n<!--\n## TSPEC refinement\nExample only.\n-->\n'
  const section = '## TSPEC refinement\nSummary.\n'
  assert.equal(replaceMarkdownSection(body, section), `${body}\n${section}`)
})

test('Markdown keeps scanning comments when one closes and another opens on the same line', () => {
  const body = '<!-- first --> <!-- second\n## TSPEC refinement\nStill commented.\n-->\nAfter comments.\n'
  const section = '## TSPEC refinement\nSummary.\n'
  assert.equal(replaceMarkdownSection(body, section), `${body}\n${section}`)
})

test('Markdown replacement preserves blank separation before the next section', () => {
  const body = '# Feature\n\n## TSPEC refinement\nOld.\n\n## Other\nKeep this section.\n'
  const section = '## TSPEC refinement\nNew.\n'
  assert.equal(replaceMarkdownSection(body, section), '# Feature\n\n## TSPEC refinement\nNew.\n\n## Other\nKeep this section.\n')
})


test('Markdown replacement keeps adjacent headings on separate lines', () => {
  const body = '## TSPEC refinement\nOld\n## Other\nFollowing section.\n'
  const section = '## TSPEC refinement\nNew\n'
  assert.equal(replaceMarkdownSection(body, section), '## TSPEC refinement\nNew\n## Other\nFollowing section.\n')
})

test('Markdown does not treat HTML comment markers inside inline code as comments', () => {
  const body = '# Feature\n\nUse the literal `<!--` as a code example.\n\n## TSPEC refinement\nOld.\n'
  const section = '## TSPEC refinement\nNew.\n'
  assert.equal(replaceMarkdownSection(body, section), '# Feature\n\nUse the literal `<!--` as a code example.\n\n## TSPEC refinement\nNew.\n')
})

test('Markdown ignores escaped backticks when finding inline code spans', () => {
  const body = '# Feature\n\nUse an escaped backtick \\` before <!-- comment with `code` -->.\n\n## TSPEC refinement\nOld.\n'
  const section = '## TSPEC refinement\nNew.\n'
  assert.equal(replaceMarkdownSection(body, section), '# Feature\n\nUse an escaped backtick \\` before <!-- comment with `code` -->.\n\n## TSPEC refinement\nNew.\n')
})

test('ADF replacement ends before the next top-level level-one or level-two heading', () => {
  const feature = heading(1, 'Feature')
  const other = heading(2, 'Other')
  const after = paragraph('After')

  const body = {
    type: 'doc', version: 1,
    content: [feature, paragraph('Before'), heading(2, 'TSPEC refinement'), paragraph('Old'), heading(3, 'Detail'), paragraph('Kept'), other, after],
  }
  const replacement = [heading(2, 'TSPEC refinement'), paragraph('New')]
  const result = replaceAdfSection(body, replacement)
  assert.deepEqual(result.content, [feature, paragraph('Before'), ...replacement, other, after])
  assert.equal(body.content[3].content[0].text, 'Old')
})

test('ADF rejects duplicate and nested target headings', () => {
  const target = heading(2, 'TSPEC refinement')
  assert.throws(() => replaceAdfSection({ type: 'doc', version: 1, content: [target, paragraph('a'), heading(2, 'TSPEC refinement')] }, [target]), /duplicate/i)
  const nested = { type: 'panel', content: [target] }
  assert.throws(() => replaceAdfSection({ type: 'doc', version: 1, content: [nested] }, [target]), /nested/i)
})

test('ADF rejects unsupported documents and malformed headings', () => {
  const section = [heading(2, 'TSPEC refinement')]
  assert.throws(() => replaceAdfSection('plain text', section), /ADF|unsupported/i)
  assert.throws(() => replaceAdfSection({ type: 'doc', version: 1, content: [{ type: 'heading', attrs: {}, content: [] }] }, section), /malformed|heading/i)
})
