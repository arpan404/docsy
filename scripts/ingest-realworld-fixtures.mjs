#!/usr/bin/env node

import { mkdirSync, rmSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';

const DEFAULT_REPOS = [
  'entropi-so/docs',
  'hyperpix/documentation',
  'CNDO-GmbH/docs',
];

const repoArgs = process.argv.slice(2);
const repos = repoArgs.length > 0 ? repoArgs : DEFAULT_REPOS;

const root = process.cwd();
const fixturesRoot = resolve(root, 'tests/fixtures/realworld');

async function main() {
  mkdirSync(fixturesRoot, { recursive: true });

  for (const repo of repos) {
    await ingestRepo(repo);
  }
}

async function ingestRepo(repo) {
  const slug = repo.replace('/', '__');
  const fixtureDir = resolve(fixturesRoot, slug);

  rmSync(fixtureDir, { recursive: true, force: true });
  mkdirSync(resolve(fixtureDir, 'docs'), { recursive: true });

  console.log(`\n[docsy] ingesting ${repo}`);

  const mintUrl = rawUrl(repo, 'mint.json');
  const mintRaw = await fetchText(mintUrl);
  if (!mintRaw) {
    console.warn(`[docsy] skipping ${repo}, mint.json not found`);
    return;
  }

  writeFileSync(resolve(fixtureDir, 'mint.json'), mintRaw, 'utf-8');

  let mint;
  try {
    mint = JSON.parse(mintRaw);
  } catch {
    console.warn(`[docsy] skipping ${repo}, invalid mint.json`);
    return;
  }

  const pageSlugs = extractPageSlugs(mint).slice(0, 1);
  const downloaded = [];

  for (const pageSlug of pageSlugs) {
    const fetched = await fetchPage(repo, pageSlug);
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
    repo,
    source: `https://github.com/${repo}`,
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

async function fetchPage(repo, slug) {
  const candidates = [
    `docs/${slug}.mdx`,
    `docs/${slug}.md`,
    `docs/${slug}/index.mdx`,
    `docs/${slug}/index.md`,
    `src/content/docs/${slug}.mdx`,
    `src/content/docs/${slug}.md`,
    `src/content/docs/${slug}/index.mdx`,
    `src/content/docs/${slug}/index.md`,
    `${slug}.mdx`,
    `${slug}.md`,
  ];

  for (const candidate of candidates) {
    const content = await fetchText(rawUrl(repo, candidate));
    if (content) return { path: candidate, content };
  }

  return null;
}

function rawUrl(repo, path) {
  return `https://raw.githubusercontent.com/${repo}/HEAD/${path}`;
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
