import assert from 'node:assert/strict'
import { existsSync, linkSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const cli = fileURLToPath(new URL('../bin/tspec.js', import.meta.url))
const sourceAgent = fileURLToPath(new URL('../agents/oh-my-pi/tspec-conformance-reviewer.md', import.meta.url))

function projectDir (t) {
  const dir = mkdtempSync(join(tmpdir(), 'tracer-spec-'))
  t.after(() => rmSync(dir, { recursive: true, force: true }))
  return dir
}

function run (directory, args, env) {
  return spawnSync(process.execPath, [cli, ...args], { cwd: directory, encoding: 'utf8', env: { ...process.env, ...env } })
}

function snapshot (root) {
  const files = {}
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name)
      if (entry.isDirectory()) walk(path)
      else if (entry.isFile() || entry.isSymbolicLink()) files[path] = readFileSync(path, 'utf8')
    }
  }
  walk(root)
  return files
}

test('install refreshes harness files without touching project content', (t) => {
  const directory = projectDir(t)
  assert.equal(run(directory, ['init', '--tools', 'oh-my-pi']).status, 0)

  const skill = join(directory, '.omp/skills/tspec-explore/SKILL.md')
  const config = join(directory, 'traceability.yml')
  const page = join(directory, 'docs/modules/specs/pages/index.adoc')
  const projectFiles = [config, page, join(directory, 'AGENTS.md'), join(directory, 'package.json')]
  const before = projectFiles.map((file) => readFileSync(file, 'utf8'))
  writeFileSync(config, `${before[0]}\n# edited\n`)
  writeFileSync(skill, 'stale\n')

  const result = run(directory, ['install', '--tools', 'oh-my-pi', '--force'])
  assert.equal(result.status, 0, result.stderr)

  assert.equal(readFileSync(config, 'utf8'), `${before[0]}\n# edited\n`)
  assert.equal(readFileSync(page, 'utf8'), before[1])
  assert.equal(readFileSync(projectFiles[2], 'utf8'), before[2])
  assert.equal(readFileSync(projectFiles[3], 'utf8'), before[3])
  assert.notEqual(readFileSync(skill, 'utf8'), 'stale\n')
  for (const scaffold of ['traceability.yml', 'tspec.yml', 'AGENTS.md', 'docs/modules/specs/pages/index.adoc']) {
    assert.equal(existsSync(join(directory, scaffold)), true)
  }
})

test('install never writes a scaffold file and writes nothing on dry-run', (t) => {
  const directory = projectDir(t)
  const result = run(directory, ['install', '--tools', 'oh-my-pi,codex', '--dry-run'])
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /\.omp\/agents\/tspec-conformance-reviewer\.md/)
  assert.match(result.stdout, /\.codex\/agents\/tspec-conformance-reviewer\.toml/)
  assert.equal(readdirSync(directory).length, 0)

  assert.equal(run(directory, ['install', '--tools', 'oh-my-pi,codex']).status, 0)
  for (const scaffold of ['traceability.yml', 'tspec.yml', 'package.json', 'AGENTS.md', 'README.adoc', 'antora-playbook.yml', 'docs', 'plans', 'scripts']) {
    assert.equal(existsSync(join(directory, scaffold)), false, `${scaffold} must not be scaffolded`)
  }
})

test('dry-run lists only harness files', (t) => {
  const directory = projectDir(t)
  const result = run(directory, ['install', '--tools', 'oh-my-pi,codex', '--dry-run'])
  assert.equal(result.status, 0, result.stderr)
  const listed = result.stdout.split('\n').filter((line) => line.startsWith('    - ')).map((line) => line.slice(6))
  assert.ok(listed.length > 0)
  for (const file of listed) {
    assert.match(file, /^(\.omp\/(skills|commands|agents)|\.agents\/skills|\.codex\/agents)\//)
  }
})

test('install errors without writing when no harness is selected', (t) => {
  const directory = projectDir(t)
  for (const args of [['--tools', 'none'], ['--tools', 'none', '--dry-run'], ['--tools', '']]) {
    const result = run(directory, ['install', ...args])
    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /No harness selected/)
    assert.equal(readdirSync(directory).length, 0)
  }
})

test('install writes each agent in its harness directory and format', (t) => {
  const directory = projectDir(t)
  const result = run(directory, ['install', '--tools', 'oh-my-pi,claude,codex', '--link'])
  assert.equal(result.status, 0, result.stderr)

  const ompAgent = join(directory, '.omp/agents/tspec-conformance-reviewer.md')
  const claudeAgent = join(directory, '.claude/agents/tspec-conformance-reviewer.md')
  const codexAgent = join(directory, '.codex/agents/tspec-conformance-reviewer.toml')
  assert.equal(lstatSync(ompAgent).isSymbolicLink(), true)
  assert.equal(realpathSync(ompAgent), realpathSync(sourceAgent))
  assert.equal(existsSync(claudeAgent), true)
  const codex = readFileSync(codexAgent, 'utf8')
  assert.match(codex, /^name = "tspec-conformance-reviewer"$/m)
  assert.match(codex, /^developer_instructions = """/m)
})

test('harnesses without an agent convention receive no agent file', (t) => {
  const directory = projectDir(t)
  const result = run(directory, ['install', '--tools', 'pi,agents'])
  assert.equal(result.status, 0, result.stderr)
  assert.equal(existsSync(join(directory, '.pi/skills/tspec-archive/SKILL.md')), true)
  assert.equal(existsSync(join(directory, '.agents/skills/tspec-archive/SKILL.md')), true)
  assert.equal(existsSync(join(directory, '.agents/agents')), false)
  assert.equal(existsSync(join(directory, '.pi/agents')), false)
})

test('agent names never collide with bundled agents', () => {
  const bundled = ['reviewer', 'scout', 'security-reviewer', 'sonic', 'task', 'default', 'worker', 'explorer']
  for (const harness of ['oh-my-pi', 'claude', 'codex']) {
    for (const file of readdirSync(fileURLToPath(new URL(`../agents/${harness}`, import.meta.url)))) {
      const name = file.replace(/\.(md|toml)$/, '')
      assert.equal(bundled.includes(name), false, `${name} would replace a bundled agent`)
    }
  }
})

test('install writes agents to user scope under HOME', (t) => {
  const directory = projectDir(t)
  const home = join(directory, 'home')
  mkdirSync(home)
  const result = run(directory, ['install', '--tools', 'oh-my-pi,claude,codex', '--scope', 'user'], { HOME: home })
  assert.equal(result.status, 0, result.stderr)

  assert.equal(existsSync(join(home, '.omp/agent/agents/tspec-conformance-reviewer.md')), true)
  assert.equal(existsSync(join(home, '.claude/agents/tspec-conformance-reviewer.md')), true)
  assert.equal(existsSync(join(home, '.codex/agents/tspec-conformance-reviewer.toml')), true)
  // Skills and agents move to HOME; slash commands stay project-local.
  assert.equal(existsSync(join(directory, '.omp/skills')), false)
  assert.equal(existsSync(join(directory, '.omp/agents')), false)
  assert.equal(existsSync(join(directory, '.codex')), false)
  assert.equal(existsSync(join(directory, '.omp/commands/tspec-archive.md')), true)
})

test('install replaces a symlink instead of writing through it', (t) => {
  const directory = projectDir(t)
  const outside = join(directory, 'outside.md')
  writeFileSync(outside, 'original\n')
  const dest = join(directory, '.omp/agents/tspec-conformance-reviewer.md')
  mkdirSync(join(directory, '.omp/agents'), { recursive: true })
  symlinkSync(outside, dest, 'file')

  const result = run(directory, ['install', '--tools', 'oh-my-pi', '--force'])
  assert.equal(result.status, 0, result.stderr)

  assert.equal(readFileSync(outside, 'utf8'), 'original\n')
  assert.equal(lstatSync(dest).isSymbolicLink(), false)
  assert.match(readFileSync(dest, 'utf8'), /tspec-conformance-reviewer/)
})

test('install replaces a dangling symlink instead of writing through it', (t) => {
  const directory = projectDir(t)
  const outsideDir = join(directory, 'outside')
  mkdirSync(outsideDir)
  const dangling = join(outsideDir, 'newfile.md')
  const dest = join(directory, '.omp/agents/tspec-conformance-reviewer.md')
  mkdirSync(join(directory, '.omp/agents'), { recursive: true })
  symlinkSync(dangling, dest, 'file')
  const skillDest = join(directory, '.omp/skills/tspec-archive/SKILL.md')
  mkdirSync(join(directory, '.omp/skills/tspec-archive'), { recursive: true })
  symlinkSync(join(directory, 'traceability.yml'), skillDest, 'file')

  const result = run(directory, ['install', '--tools', 'oh-my-pi', '--force'])
  assert.equal(result.status, 0, result.stderr)

  // Nothing outside the harness directories was created.
  assert.equal(existsSync(dangling), false)
  assert.equal(existsSync(join(directory, 'traceability.yml')), false)
  assert.equal(lstatSync(dest).isSymbolicLink(), false)
  assert.equal(lstatSync(skillDest).isSymbolicLink(), false)
  assert.match(readFileSync(dest, 'utf8'), /tspec-conformance-reviewer/)
  assert.match(readFileSync(skillDest, 'utf8'), /tspec-archive/)
})

test('install skips a dangling symlink without --force', (t) => {
  const directory = projectDir(t)
  const outsideDir = join(directory, 'outside')
  mkdirSync(outsideDir)
  const dangling = join(outsideDir, 'newfile.md')
  const dest = join(directory, '.omp/agents/tspec-conformance-reviewer.md')
  mkdirSync(join(directory, '.omp/agents'), { recursive: true })
  symlinkSync(dangling, dest, 'file')

  const result = run(directory, ['install', '--tools', 'oh-my-pi'])
  assert.equal(result.status, 0, result.stderr)

  assert.equal(existsSync(dangling), false)
  assert.equal(lstatSync(dest).isSymbolicLink(), true)
  assert.match(result.stdout, /Skipped \d+ existing harness file/)
})

test('install does not claim a skill install when only agents were written', (t) => {
  const directory = projectDir(t)
  assert.equal(run(directory, ['install', '--tools', 'oh-my-pi']).status, 0)
  rmSync(join(directory, '.omp/agents/tspec-conformance-reviewer.md'))

  const result = run(directory, ['install', '--tools', 'oh-my-pi'])
  assert.equal(result.status, 0, result.stderr)
  assert.doesNotMatch(result.stdout, /Installed skills for/)
  assert.match(result.stdout, /Installed 1 agent definition/)
})

test('install does not write through a symlinked harness directory', (t) => {
  const directory = projectDir(t)
  assert.equal(run(directory, ['init', '--tools', 'oh-my-pi']).status, 0)

  // A scaffold file whose content must survive, reachable via a symlinked
  // harness directory.
  const guarded = join(directory, 'skills/tspec-archive/SKILL.md')
  writeFileSync(guarded, 'USER EDIT - MUST SURVIVE\n')
  rmSync(join(directory, '.omp/skills'), { recursive: true, force: true })
  symlinkSync(join(directory, 'skills'), join(directory, '.omp/skills'), 'dir')

  const result = run(directory, ['install', '--tools', 'oh-my-pi', '--force'])
  assert.equal(result.status, 0, result.stderr)
  assert.equal(readFileSync(guarded, 'utf8'), 'USER EDIT - MUST SURVIVE\n')
  assert.match(result.stdout, /Skipped \d+ existing harness file/)
})

test('install does not write commands through a symlinked harness directory', (t) => {
  const directory = projectDir(t)
  assert.equal(run(directory, ['init', '--tools', 'oh-my-pi']).status, 0)

  const guarded = join(directory, 'docs/modules/specs/pages/index.adoc')
  const before = readFileSync(guarded, 'utf8')
  rmSync(join(directory, '.omp/commands'), { recursive: true, force: true })
  symlinkSync(join(directory, 'docs/modules/specs/pages'), join(directory, '.omp/commands'), 'dir')

  const result = run(directory, ['install', '--tools', 'oh-my-pi', '--force'])
  assert.equal(result.status, 0, result.stderr)
  assert.equal(readFileSync(guarded, 'utf8'), before)
  assert.equal(existsSync(join(directory, 'docs/modules/specs/pages/tspec-archive.md')), false)
})

test('install does not write commands through a symlinked directory at user scope', (t) => {
  const directory = projectDir(t)
  const home = join(directory, 'home')
  mkdirSync(home)
  assert.equal(run(directory, ['init', '--tools', 'oh-my-pi'], { HOME: home }).status, 0)

  const guarded = join(directory, 'docs/modules/specs/pages/index.adoc')
  const before = readFileSync(guarded, 'utf8')
  rmSync(join(directory, '.omp/commands'), { recursive: true, force: true })
  symlinkSync(join(directory, 'docs/modules/specs/pages'), join(directory, '.omp/commands'), 'dir')

  const result = run(directory, ['install', '--tools', 'oh-my-pi', '--scope', 'user', '--force'], { HOME: home })
  assert.equal(result.status, 0, result.stderr)
  assert.equal(readFileSync(guarded, 'utf8'), before)
  assert.equal(readdirSync(join(directory, 'docs/modules/specs/pages')).some((f) => f.endsWith('.md')), false)
})

test('install does not write through a hardlink to a project file', (t) => {
  const directory = projectDir(t)
  assert.equal(run(directory, ['init', '--tools', 'oh-my-pi']).status, 0)

  const guarded = join(directory, 'traceability.yml')
  writeFileSync(guarded, 'SENTINEL-CONFIG\n')
  const dest = join(directory, '.omp/agents/tspec-conformance-reviewer.md')
  rmSync(dest)
  linkSync(guarded, dest)

  const result = run(directory, ['install', '--tools', 'oh-my-pi', '--force'])
  assert.equal(result.status, 0, result.stderr)
  assert.equal(readFileSync(guarded, 'utf8'), 'SENTINEL-CONFIG\n')
  assert.notEqual(statSync(guarded).ino, statSync(dest).ino)
})

test('install does not write through a symlinked user harness directory', (t) => {
  const directory = projectDir(t)
  const home = join(directory, 'home')
  const project = join(directory, 'project')
  mkdirSync(join(home, '.agents'), { recursive: true })
  mkdirSync(join(project, 'docs/modules/specs/pages'), { recursive: true })
  writeFileSync(join(project, 'docs/modules/specs/pages/index.adoc'), 'KEEP\n')
  // A user harness directory symlinked into a project tree must not receive writes.
  symlinkSync(join(project, 'docs/modules/specs/pages'), join(home, '.agents/skills'), 'dir')

  const result = run(directory, ['install', '--tools', 'agents', '--scope', 'user', '--force'], { HOME: home })
  assert.equal(result.status, 0, result.stderr)
  assert.equal(readFileSync(join(project, 'docs/modules/specs/pages/index.adoc'), 'utf8'), 'KEEP\n')
  assert.equal(readdirSync(join(project, 'docs/modules/specs/pages')).some((f) => f.endsWith('.md')), false)
  assert.equal(existsSync(join(project, 'docs/modules/specs/pages/tspec-archive')), false)
})

test('install reports skipped files without claiming an install', (t) => {
  const directory = projectDir(t)
  assert.equal(run(directory, ['install', '--tools', 'oh-my-pi']).status, 0)
  const second = run(directory, ['install', '--tools', 'oh-my-pi'])
  assert.equal(second.status, 0, second.stderr)
  assert.doesNotMatch(second.stdout, /Installed skills for/)
  assert.match(second.stdout, /Skipped \d+ existing harness file/)
})