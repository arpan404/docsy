#!/usr/bin/env node

import { mkdirSync, rmSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';

const DEFAULT_REPOS = [
  'arpan404/afk/docs',
  'socioy/joor/docs',
];

const repoArgs = process.argv.slice(2);
const repos = repoArgs.length > 0 ? repoArgs : DEFAULT_REPOS;

const root = process.cwd();
const fixturesRoot = resolve(root, 'tests/fixtures/realworld');

async function main() {
  rmSync(fixturesRoot, { recursive: true, force: true });
  mkdirSync(fixturesRoot, { recursive: true });

  for (const repo of repos) {
    await ingestRepo(repo);
  }
}

async function ingestRepo(repo) {
  const parsed = parseRepoSource(repo);
  const slug = parsed.source.replace(/\//g, '__');
  const fixtureDir = resolve(fixturesRoot, slug);

  rmSync(fixtureDir, { recursive: true, force: true });
  mkdirSync(resolve(fixtureDir, 'docs'), { recursive: true });

  console.log(`\n[docsy] ingesting ${parsed.source}`);

  const configCandidates = ['docs.json', 'mint.json'];
  let configRaw = null;
  let configPath = '';

  for (const candidate of configCandidates) {
    const raw = await fetchText(rawUrl(parsed, candidate));
    if (raw) {
      configRaw = raw;
      configPath = candidate;
      break;
    }
  }

  if (!configRaw) {
    console.warn(`[docsy] skipping ${parsed.source}, docs.json/mint.json not found`);
    return;
  }

  writeFileSync(resolve(fixtureDir, 'docs.json'), configRaw, 'utf-8');

  let mint;
  try {
    mint = JSON.parse(configRaw);
  } catch {
    console.warn(`[docsy] skipping ${parsed.source}, invalid docs config json`);
    return;
  }

  const allPageSlugs = extractPageSlugs(mint);
  const pageSlugs = parsed.source === 'arpan404/afk/docs'
    ? allPageSlugs
    : allPageSlugs.slice(0, 1);
  const downloaded = [];

  for (const pageSlug of pageSlugs) {
    const fetched = await fetchPage(parsed, pageSlug);
    if (!fetched) continue;

    const ext = fetched.path.endsWith('.md') ? 'md' : 'mdx';
    const localPath = resolve(fixtureDir, `docs/${pageSlug}.${ext}`);
    mkdirSync(dirname(localPath), { recursive: true });
    writeFileSync(localPath, fetched.content, 'utf-8');
    downloaded.push({ slug: pageSlug, sourcePath: fetched.path });
  }

  if (downloaded.length === 0) {
    const fallbackSlug = pageSlugs[0] || 'index';
    const fallbackPath = resolve(fixtureDir, `docs/${fallbackSlug}.mdx`);
    mkdirSync(dirname(fallbackPath), { recursive: true });
    writeFileSync(
      fallbackPath,
      `---\ntitle: ${titleFromSlug(fallbackSlug)}\n---\n\n# ${titleFromSlug(fallbackSlug)}\n`,
      'utf-8'
    );
    downloaded.push({ slug: fallbackSlug, sourcePath: 'generated:fallback' });
  }

  const fixtureMeta = {
    repo: parsed.repo,
    configPath,
    source: `https://github.com/${parsed.repo}${parsed.basePath ? `/${parsed.basePath}` : ''}`,
    snapshotRoute: downloaded[0].slug,
    downloaded,
  };

  writeFileSync(resolve(fixtureDir, 'fixture.json'), JSON.stringify(fixtureMeta, null, 2) + '\n', 'utf-8');
  console.log(`[docsy] fixture ready: ${slug} (${downloaded.length} docs)`);
}

function extractPageSlugs(mint) {
  const slugs = [];

  const walkPages = (pages) => {
    if (!Array.isArray(pages)) return;
    for (const page of pages) {
      if (typeof page === 'string') {
        if (!page.startsWith('http')) slugs.push(normalizeSlug(page));
        continue;
      }
      if (!page || typeof page !== 'object') continue;
      if (typeof page.slug === 'string') slugs.push(normalizeSlug(page.slug));
      if (Array.isArray(page.pages)) walkPages(page.pages);
    }
  };

  if (Array.isArray(mint.navigation)) {
    for (const section of mint.navigation) {
      walkPages(section?.pages);
    }
  }

  if (mint.navigation && !Array.isArray(mint.navigation) && Array.isArray(mint.navigation.tabs)) {
    for (const tab of mint.navigation.tabs) {
      walkPages(tab?.pages);
      if (Array.isArray(tab?.groups)) {
        for (const group of tab.groups) {
          walkPages(group?.pages);
        }
      }
    }
  }

  if (Array.isArray(mint.tabs)) {
    for (const tab of mint.tabs) {
      walkPages(tab?.pages);
    }
  }

  return [...new Set(slugs.filter(Boolean))];
}

function normalizeSlug(slug) {
  return slug.replace(/^\/+|\/+$/g, '');
}

async function fetchPage(parsedRepo, slug) {
  const roots = ['', 'docs', 'src/content/docs', 'src/docs'];
  const candidates = roots.flatMap((root) => {
    const prefix = root ? `${root}/` : '';
    return [
      `${prefix}${slug}.mdx`,
      `${prefix}${slug}.md`,
      `${prefix}${slug}/index.mdx`,
      `${prefix}${slug}/index.md`,
    ];
  });

  for (const candidate of candidates) {
    const content = await fetchText(rawUrl(parsedRepo, candidate));
    if (content) return { path: candidate, content };
  }

  return null;
}

function parseRepoSource(source) {
  const parts = source.split('/').filter(Boolean);
  if (parts.length < 2) {
    throw new Error(`Invalid repo source "${source}". Expected owner/repo or owner/repo/path.`);
  }

  const repo = `${parts[0]}/${parts[1]}`;
  const basePath = parts.slice(2).join('/');

  return {
    source,
    repo,
    basePath,
  };
}

function rawUrl(parsedRepo, path) {
  const fullPath = parsedRepo.basePath ? `${parsedRepo.basePath}/${path}` : path;
  return `https://raw.githubusercontent.com/${parsedRepo.repo}/HEAD/${fullPath}`;
}

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) return null;
  return await res.text();
}

function titleFromSlug(slug) {
  const part = slug.split('/').pop() || slug;
  return part.replace(/[-_]/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
