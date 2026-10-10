import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

const SECTION_TITLE = 'TSPEC refinement'

function markdownLines (body) {
  const lines = []
  for (let start = 0; start < body.length;) {
    let end = start
    while (end < body.length && body[end] !== '\n' && body[end] !== '\r') end++
    if (end < body.length && body[end] === '\r' && body[end + 1] === '\n') end += 2
    else if (end < body.length) end++
    lines.push({ start, end, text: body.slice(start, end).replace(/(?:\r\n|\r|\n)$/, '') })
    start = end
  }
  return lines
}

function markdownHeading (line) {
  const match = line.match(/^ {0,3}(#{1,6})(?:[ \t]+(.*)|[ \t]*)$/)
  if (!match) return null
  const text = (match[2] ?? '').replace(/[ \t]+#+[ \t]*$/, '').replace(/[ \t]+$/, '')
  return { level: match[1].length, text }
}

function markdownTargets (body) {
  const lines = markdownLines(body)
  const targets = []
  const headings = []
  let fence = null
  let comment = false
  for (let index = 0; index < lines.length; index++) {
    const text = lines[index].text
    if (fence) {
      const close = text.match(/^ {0,3}(`+|~+)[ \t]*$/)
      if (close && close[1][0] === fence.char && close[1].length >= fence.length) fence = null
      continue
    }
    const commentAtLineStart = comment
    if (!comment) {
      const open = text.match(/^ {0,3}(`{3,}|~{3,})(.*)$/)
      if (open && !(open[1][0] === '`' && open[2].includes('`'))) {
        fence = { char: open[1][0], length: open[1].length }
        continue
      }
    }

    let sawComment = false
    for (let cursor = 0; cursor < text.length;) {
      if (comment) {
        const close = text.indexOf('-->', cursor)
        if (close === -1) break
        comment = false
        sawComment = true
        cursor = close + 3
        continue
      }

      const open = text.indexOf('<!--', cursor)
      const close = text.indexOf('-->', cursor)
      let tick = text.indexOf('`', cursor)
      while (tick !== -1) {
        let slashCount = 0
        for (let before = tick - 1; before >= cursor && text[before] === '\\'; before--) slashCount++
        if (slashCount % 2 === 0) break
        tick = text.indexOf('`', tick + 1)
      }
      if (tick !== -1 && (open === -1 || tick < open) && (close === -1 || tick < close)) {
        let tickEnd = tick + 1
        while (text[tickEnd] === '`') tickEnd++
        const length = tickEnd - tick
        let search = tickEnd
        while (search < text.length) {
          const next = text.indexOf('`', search)
          if (next === -1) break
          let nextEnd = next + 1
          while (text[nextEnd] === '`') nextEnd++
          if (nextEnd - next === length) {
            cursor = nextEnd
            break
          }
          search = nextEnd
        }
        if (cursor < tickEnd) cursor = tickEnd
        continue
      }
      if (close !== -1 && (open === -1 || close < open)) {
        throw new Error('Malformed Markdown: unmatched HTML comment close')
      }
      if (open === -1) break
      comment = true
      sawComment = true
      cursor = open + 4
    }

    if (commentAtLineStart || sawComment || comment) continue
    const heading = markdownHeading(text)
    headings[index] = heading
    if (heading?.text === SECTION_TITLE) {
      if (heading.level !== 2) throw new Error('Nested or unsupported TSPEC refinement heading level')
      targets.push(index)
    }
  }
  if (fence) throw new Error('Malformed Markdown: unclosed code fence')
  if (comment) throw new Error('Malformed Markdown: unclosed HTML comment')
  return { lines, headings, targets }
}
function validateMarkdownSection (section) {
  if (typeof section !== 'string') throw new TypeError('Markdown section must be a string')
  const { headings, targets } = markdownTargets(section)
  if (targets.length !== 1 || targets[0] !== 0) {
    throw new Error('Markdown section must start with exactly one ## TSPEC refinement heading')
  }
  if (headings.slice(1).some((heading) => heading?.level <= 2)) {
    throw new Error('Malformed Markdown section: contains another level-one or level-two boundary')
  }
}

export function replaceMarkdownSection (body, section) {
  if (typeof body !== 'string') throw new TypeError('Markdown body must be a string')
  validateMarkdownSection(section)
  const { lines, headings, targets } = markdownTargets(body)
  if (targets.length > 1) throw new Error('Duplicate TSPEC refinement headings')
  if (targets.length === 0) {
    if (!body) return section
    return `${body}${body.endsWith('\n') || body.endsWith('\r') ? '\n' : '\n\n'}${section}`
  }

  const start = lines[targets[0]].start
  let end = body.length
  for (let index = targets[0] + 1; index < lines.length; index++) {
    if (headings[index]?.level <= 2) {
      end = lines[index].start
      break
    }
  }
  if (end < body.length) {
    let suffix = end
    while (suffix > start && (body[suffix - 1] === '\n' || body[suffix - 1] === '\r')) suffix--
    const separator = body.slice(suffix, end)
    const prefix = body.slice(0, start)
    const replacement = section.replace(/(?:\r\n|\r|\n)*$/, '')
    return `${prefix}${replacement}${separator}${body.slice(end)}`
  }
  return `${body.slice(0, start)}${section}`
}

function adfText (node, seen) {
  return (node.content ?? []).map((child) => {
    if (!child || typeof child !== 'object' || Array.isArray(child) || typeof child.type !== 'string' || seen.has(child)) {
      throw new Error('Unsupported or malformed ADF inline content')
    }
    seen.add(child)
    if (child.type === 'text') {
      if (typeof child.text !== 'string') throw new Error('Malformed ADF text node')
      return child.text
    }
    if (Object.hasOwn(child, 'content') && !Array.isArray(child.content)) throw new Error('Malformed ADF node content')
    return adfText(child, seen)
  }).join('')
}
function inspectAdfNode (node, seen, topLevel = false) {
  if (!node || typeof node !== 'object' || Array.isArray(node) || typeof node.type !== 'string') {
    throw new Error('Unsupported or malformed ADF node')
  }
  if (seen.has(node)) throw new Error('Unsupported cyclic ADF document')
  seen.add(node)
  if (Object.hasOwn(node, 'content') && !Array.isArray(node.content)) throw new Error('Malformed ADF node content')
  if (node.type === 'heading') {
    const level = node.attrs?.level
    if (!Number.isInteger(level) || level < 1 || level > 6 || !Array.isArray(node.content)) {
      throw new Error('Malformed ADF heading')
    }
    const text = adfText(node, seen)
    if (text === SECTION_TITLE && (!topLevel || level !== 2)) {
      throw new Error('Nested TSPEC refinement headings are not supported')
    }
    return { level, text }
  }
  for (const child of node.content ?? []) inspectAdfNode(child, seen)
  return null
}

function inspectAdf (body) {
  if (!body || typeof body !== 'object' || Array.isArray(body) || body.type !== 'doc' || body.version !== 1 || !Array.isArray(body.content)) {
    throw new Error('Unsupported ADF document')
  }
  const seen = new WeakSet([body])
  const headings = body.content.map((node) => inspectAdfNode(node, seen, true))
  return { headings, targets: headings.flatMap((heading, index) => heading?.level === 2 && heading.text === SECTION_TITLE ? [index] : []) }
}

function validateAdfSection (sectionNodes) {
  if (!Array.isArray(sectionNodes)) throw new TypeError('ADF section must be an array of nodes')
  const seen = new WeakSet()
  const headings = sectionNodes.map((node) => inspectAdfNode(node, seen, true))
  const targets = headings.flatMap((heading, index) => heading?.level === 2 && heading.text === SECTION_TITLE ? [index] : [])
  if (targets.length !== 1 || targets[0] !== 0) {
    throw new Error('ADF section must start with exactly one level-2 TSPEC refinement heading')
  }
  if (headings.slice(1).some((heading) => heading?.level <= 2)) {
    throw new Error('Malformed ADF section: contains another level-one or level-two boundary')
  }
}

export function replaceAdfSection (body, sectionNodes) {
  validateAdfSection(sectionNodes)
  const { headings, targets } = inspectAdf(body)
  if (targets.length > 1) throw new Error('Duplicate TSPEC refinement headings')
  const start = targets[0] ?? body.content.length
  let end = body.content.length
  if (targets.length) {
    for (let index = start + 1; index < headings.length; index++) {
      if (headings[index]?.level <= 2) {
        end = index
        break
      }
    }
  }
  return { ...body, content: [...body.content.slice(0, start), ...sectionNodes, ...body.content.slice(end)] }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const [mode] = process.argv.slice(2)
    const input = JSON.parse(readFileSync(0, 'utf8'))
    const body = mode === 'markdown'
      ? replaceMarkdownSection(input.body, input.section)
      : mode === 'adf'
        ? replaceAdfSection(input.body, input.sectionNodes)
        : (() => { throw new Error('Mode must be markdown or adf') })()
    process.stdout.write(`${JSON.stringify({ body })}\n`)
  } catch (error) {
    process.stderr.write(`${error.message}\n`)
    process.exitCode = 1
  }
}
