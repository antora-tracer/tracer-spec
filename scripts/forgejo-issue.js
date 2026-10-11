import { pathToFileURL } from 'node:url'

const loopbackHosts = new Set(['127.0.0.1', '::1', '[::1]', 'localhost'])

export function buildIssueUrl (baseUrl, repository, issueIndex) {
  const base = new URL(baseUrl)
  if (base.protocol !== 'https:' && !(base.protocol === 'http:' && loopbackHosts.has(base.hostname))) {
    throw new Error('Forgejo URLs must use HTTPS except for loopback hosts')
  }
  if (base.username || base.password || base.search || base.hash) {
    throw new Error('Forgejo URL must not contain credentials, query, or fragment')
  }

  const [owner, repo, extra] = repository.split('/')
  if (!owner || !repo || extra !== undefined || [owner, repo].some(part => part === '.' || part === '..')) {
    throw new Error('Forgejo repository must be owner/repo without dot segments')
  }
  if (!/^[1-9]\d*$/.test(String(issueIndex))) throw new Error('Forgejo issue index must be a positive integer')

  base.pathname = `${base.pathname.replace(/\/+$/, '')}/api/v1/`
  return new URL(`repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues/${issueIndex}`, base)
}

function authHeaders (extra = {}) {
  const token = process.env.FORGEJO_TOKEN
  if (!token) throw new Error('Set FORGEJO_TOKEN in the process environment')
  return { Accept: 'application/json', Authorization: `token ${token}`, ...extra }
}

async function readIssue (baseUrl, repository, issueIndex) {
  const response = await fetch(buildIssueUrl(baseUrl, repository, issueIndex), { headers: authHeaders(), redirect: 'error' })
  if (!response.ok) throw new Error(`Forgejo issue read failed (HTTP ${response.status})`)

  const issue = await response.json()
  if (!issue || typeof issue.title !== 'string' || (issue.body !== undefined && issue.body !== null && typeof issue.body !== 'string')) {
    throw new Error('Forgejo issue response did not contain a valid title and body')
  }
  return { title: issue.title, body: issue.body ?? '' }
}

async function updateIssue (baseUrl, repository, issueIndex, body) {
  if (typeof body !== 'string') throw new Error('Forgejo issue body must be text')
  const response = await fetch(buildIssueUrl(baseUrl, repository, issueIndex), {
    method: 'PATCH',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ body }),
    redirect: 'error'
  })
  if (!response.ok) throw new Error(`Forgejo issue update failed (HTTP ${response.status})`)
  await response.body?.cancel()
  return { status: response.status }
}

async function readStdin () {
  let input = ''
  for await (const chunk of process.stdin) input += chunk
  return input
}

async function main () {
  const [operation, baseUrl, repository, issueIndex, ...extra] = process.argv.slice(2)
  if (!['read', 'update'].includes(operation) || !baseUrl || !repository || !issueIndex || extra.length) {
    throw new Error('Usage: node scripts/forgejo-issue.js <read|update> <base-url> <owner/repo> <issue-index>')
  }

  if (operation === 'read') {
    process.stdout.write(`${JSON.stringify(await readIssue(baseUrl, repository, issueIndex))}\n`)
    return
  }

  let input
  try {
    input = JSON.parse(await readStdin())
  } catch {
    throw new Error('Update input must be JSON with a string body')
  }
  process.stdout.write(`${JSON.stringify(await updateIssue(baseUrl, repository, issueIndex, input?.body))}\n`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => {
    process.stderr.write(`${error.message}\n`)
    process.exitCode = 1
  })
}
