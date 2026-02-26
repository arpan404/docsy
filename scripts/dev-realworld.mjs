#!/usr/bin/env node

import { existsSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { spawn, spawnSync } from 'child_process';

const root = process.cwd();
const fixturesRoot = resolve(root, 'tests/fixtures/realworld');
const distCli = resolve(root, 'dist/cli/index.mjs');

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printHelp();
  process.exit(0);
}

const fixtures = getFixtureNames(fixturesRoot);

if (fixtures.length === 0) {
  console.error('[docsy] No real-world fixtures found. Run: npm run fixtures:realworld:ingest');
  process.exit(1);
}

if (args.list) {
  console.log(fixtures.join('\n'));
  process.exit(0);
}

const fixtureName = args.fixture || fixtures[0];
if (!fixtures.includes(fixtureName)) {
  console.error(`[docsy] Unknown fixture "${fixtureName}".`);
  console.error(`[docsy] Available fixtures: ${fixtures.join(', ')}`);
  process.exit(1);
}

if (!existsSync(distCli)) {
  console.log('[docsy] dist CLI not found. Running build first...');
  const build = spawnSync('npm', ['run', 'build'], { stdio: 'inherit', cwd: root });
  if (build.status !== 0) {
    process.exit(build.status ?? 1);
  }
}

const fixtureDir = resolve(fixturesRoot, fixtureName);
const devArgs = [distCli, 'dev', '--port', String(args.port)];
if (args.host) devArgs.push('--host');
if (args.config) devArgs.push('--config', args.config);

console.log(`[docsy] Starting dev server for fixture: ${fixtureName}`);
console.log(`[docsy] Working directory: ${fixtureDir}`);

const child = spawn('node', devArgs, {
  cwd: fixtureDir,
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});

function parseArgs(argv) {
  const parsed = {
    fixture: undefined,
    port: 4321,
    host: false,
    config: undefined,
    list: false,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token === '--fixture' || token === '-f') {
      parsed.fixture = argv[index + 1];
      index += 1;
      continue;
    }
    if (token === '--port' || token === '-p') {
      parsed.port = Number(argv[index + 1] || '4321');
      index += 1;
      continue;
    }
    if (token === '--config') {
      parsed.config = argv[index + 1];
      index += 1;
      continue;
    }
    if (token === '--host') {
      parsed.host = true;
      continue;
    }
    if (token === '--list' || token === '-l') {
      parsed.list = true;
      continue;
    }
    if (token === '--help' || token === '-h') {
      parsed.help = true;
      continue;
    }
  }

  if (!Number.isFinite(parsed.port) || parsed.port <= 0) {
    throw new Error(`Invalid port: ${parsed.port}`);
  }

  return parsed;
}

function getFixtureNames(fixturesDirectory) {
  if (!existsSync(fixturesDirectory)) return [];
  return readdirSync(fixturesDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function printHelp() {
  console.log(`Usage: npm run dev:realworld -- [options]\n
Options:\n  -f, --fixture <name>   Fixture directory name under tests/fixtures/realworld\n  -p, --port <number>   Dev server port (default: 4321)\n      --host            Expose dev server to network\n      --config <path>   Explicit config path (relative to fixture dir)\n  -l, --list            List available fixtures\n  -h, --help            Show this help\n`);
}
