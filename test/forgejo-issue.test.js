import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { buildIssueUrl } from '../scripts/forgejo-issue.js'

const script = fileURLToPath(new URL('../scripts/forgejo-issue.js', import.meta.url))
const root = fileURLToPath(new URL('..', import.meta.url))

test('rejects insecure remote Forgejo URLs but permits loopback test hosts', () => {
  const local = buildIssueUrl('http://127.0.0.1:3000/forgejo', 'acme/specs', '42')
  assert.equal(local.pathname, '/forgejo/api/v1/repos/acme/specs/issues/42')
  assert.throws(() => buildIssueUrl('http://forgejo.example.org', 'acme/specs', '42'), /HTTPS/)
})

test('rejects dot-segment repository names', () => {
  assert.throws(() => buildIssueUrl('https://forgejo.example.org', 'acme/..', '42'), /repository/)
})

async function listen (t, handler) {
  const server = createServer((request, response) => {
    Promise.resolve(handler(request, response)).catch(error => {
      response.writeHead(500, { 'content-type': 'application/json' })
      response.end(JSON.stringify({ message: error.message }))
    })
  })
  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })
  t.after(() => new Promise(resolve => server.close(resolve)))
  return `http://127.0.0.1:${server.address().port}/forgejo`
}

function run (args, { input, token } = {}) {
  return new Promise((resolve, reject) => {
    const env = { ...process.env }
    if (token === undefined) delete env.FORGEJO_TOKEN
    else env.FORGEJO_TOKEN = token
    const child = spawn(process.execPath, [script, ...args], {
      cwd: root,
      env,
      stdio: ['pipe', 'pipe', 'pipe']
    })
    let stdout = ''
    let stderr = ''
    child.stdout.setEncoding('utf8').on('data', chunk => { stdout += chunk })
    child.stderr.setEncoding('utf8').on('data', chunk => { stderr += chunk })
    child.once('error', reject)
    child.once('close', (code, signal) => resolve({ code, signal, stdout, stderr }))
    child.stdin.end(input === undefined ? undefined : JSON.stringify(input))
  })
}

function sendJson (response, status, body) {
  response.writeHead(status, { 'content-type': 'application/json' })
  response.end(JSON.stringify(body))
}

test('reads an issue from the configured Forgejo repository', async (t) => {
  let seen
  const baseUrl = await listen(t, async (request, response) => {
    seen = { method: request.method, url: request.url, authorization: request.headers.authorization }
    sendJson(response, 200, { number: 42, title: 'Existing issue', body: 'Existing body' })
  })

  const result = await run(['read', baseUrl, 'acme/specs', '42'], { token: 'secret-token' })

  assert.equal(result.code, 0, result.stderr)
  assert.deepEqual(JSON.parse(result.stdout), { title: 'Existing issue', body: 'Existing body' })
  assert.equal(seen.method, 'GET')
  assert.equal(seen.url, '/forgejo/api/v1/repos/acme/specs/issues/42')
  assert.equal(seen.authorization, 'token secret-token')
  assert.equal(seen.url.includes('secret-token'), false)
})

test('updates only the approved issue body', async (t) => {
  let issueBody = 'Original body'
  let seen
  const baseUrl = await listen(t, async (request, response) => {
    const chunks = []
    for await (const chunk of request) chunks.push(chunk)
    seen = {
      method: request.method,
      url: request.url,
      authorization: request.headers.authorization,
      payload: JSON.parse(Buffer.concat(chunks).toString('utf8'))
    }
    issueBody = seen.payload.body
    sendJson(response, 201, { number: 42, title: 'Existing issue', body: issueBody })
  })

  const result = await run(['update', baseUrl, 'acme/specs', '42'], {
    token: 'secret-token',
    input: { body: 'Original body\n\n## TSPEC refinement\nApproved summary.\n' }
  })

  assert.equal(result.code, 0, result.stderr)
  assert.deepEqual(JSON.parse(result.stdout), { status: 201 })
  assert.equal(seen.method, 'PATCH')
  assert.equal(seen.url, '/forgejo/api/v1/repos/acme/specs/issues/42')
  assert.equal(seen.authorization, 'token secret-token')
  assert.deepEqual(seen.payload, { body: 'Original body\n\n## TSPEC refinement\nApproved summary.\n' })
  assert.equal(issueBody, seen.payload.body)
})

test('fails before network access when the token is missing', async (t) => {
  let requests = 0
  const baseUrl = await listen(t, async (_request, response) => {
    requests++
    sendJson(response, 200, { number: 42, title: 'Existing issue', body: '' })
  })

  const result = await run(['read', baseUrl, 'acme/specs', '42'])

  assert.notEqual(result.code, 0)
  assert.match(result.stderr, /FORGEJO_TOKEN/)
  assert.equal(requests, 0)
})

test('rejects a non-numeric issue index before network access', async (t) => {
  let requests = 0
  const baseUrl = await listen(t, async (_request, response) => {
    requests++
    sendJson(response, 200, { number: 42, title: 'Existing issue', body: '' })
  })

  const result = await run(['read', baseUrl, 'acme/specs', '../42'], { token: 'secret-token' })

  assert.notEqual(result.code, 0)
  assert.match(result.stderr, /issue index/)
  assert.equal(requests, 0)
})

test('does not follow issue API redirects', async (t) => {
  let directRequests = 0
  let redirectedRequests = 0
  const redirectedUrl = await listen(t, async (_request, response) => {
    redirectedRequests++
    sendJson(response, 200, { title: 'Redirected issue', body: 'Redirected body' })
  })
  const baseUrl = await listen(t, async (request, response) => {
    directRequests++
    response.writeHead(307, { location: new URL(request.url, redirectedUrl).href })
    response.end()
  })

  const read = await run(['read', baseUrl, 'acme/specs', '42'], { token: 'secret-token' })
  const update = await run(['update', baseUrl, 'acme/specs', '42'], {
    token: 'secret-token',
    input: { body: 'Approved update body' }
  })

  assert.notEqual(read.code, 0)
  assert.notEqual(update.code, 0)
  assert.equal(directRequests, 2)
  assert.equal(redirectedRequests, 0)
})
