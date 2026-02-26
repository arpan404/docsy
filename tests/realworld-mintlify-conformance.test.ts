import { mkdtempSync, readdirSync, readFileSync, rmSync, cpSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import { afterAll, describe, expect, it } from 'vitest';
import { runBuild } from '../src/cli/astro-bootstrap';
import { loadDocsyConfig } from '../src/cli/config-loader';

const FIXTURES_ROOT = resolve(__dirname, 'fixtures/realworld');
const BUILD_OUTDIR = '.docsy-realworld-dist';
const cleanupDirs: string[] = [];

afterAll(() => {
  for (const dir of cleanupDirs) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe.sequential('Real-world Mintlify conformance snapshots', () => {
  const fixtureDirs = readdirSync(FIXTURES_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  for (const fixtureName of fixtureDirs) {
    it(`builds and snapshots rendered chrome: ${fixtureName}`, async () => {
      const sourceDir = resolve(FIXTURES_ROOT, fixtureName);
      const tmpProjectDir = mkdtempSync(join(tmpdir(), `docsy-realworld-${fixtureName}-`));
      cleanupDirs.push(tmpProjectDir);

      cpSync(sourceDir, tmpProjectDir, { recursive: true });

      const fixtureMetaPath = resolve(tmpProjectDir, 'fixture.json');
      const fixtureMeta = JSON.parse(readFileSync(fixtureMetaPath, 'utf-8')) as {
        repo: string;
        snapshotRoute: string;
      };

      const config = await loadDocsyConfig(tmpProjectDir);
      await runBuild({
        outDir: BUILD_OUTDIR,
        config,
        userDir: tmpProjectDir,
      });

      const html = readBuiltHtml(tmpProjectDir, fixtureMeta.snapshotRoute);
      const topnav = extractTagBlock(html, 'header', 'topnav');
      const sidebar = extractTagBlock(html, 'aside', 'sidebar');

      expect(normalizeHtml(topnav)).toMatchSnapshot(`${fixtureName}:topnav`);
      expect(normalizeHtml(sidebar)).toMatchSnapshot(`${fixtureName}:sidebar`);
    });
  }
});

function readBuiltHtml(projectDir: string, route: string): string {
  const cleanedRoute = route.replace(/^\/+|\/+$/g, '');
  const htmlPath = resolve(projectDir, BUILD_OUTDIR, cleanedRoute, 'index.html');
  return readFileSync(htmlPath, 'utf-8');
}

function extractTagBlock(html: string, tag: string, classToken: string): string {
  const openingTagRegex = new RegExp(`<${tag}\\b[^>]*class=["'][^"']*\\b${classToken}\\b[^"']*["'][^>]*>`, 'i');
  const openingMatch = openingTagRegex.exec(html);

  if (!openingMatch) {
    throw new Error(`Unable to find <${tag}> with class token "${classToken}"`);
  }

  const startIndex = openingMatch.index;
  const openingTagEnd = startIndex + openingMatch[0].length;
  const closingTag = `</${tag}>`;
  const endIndex = html.indexOf(closingTag, openingTagEnd);

  if (endIndex === -1) {
    throw new Error(`Unable to find closing tag ${closingTag}`);
  }

  return html.slice(startIndex, endIndex + closingTag.length);
}

function normalizeHtml(html: string): string {
  return html
    .replace(/\s+/g, ' ')
    .replace(/\/_astro\/[a-zA-Z0-9._-]+/g, '/_astro/<asset>')
    .replace(/\sdata-astro-cid-[a-z0-9-]+(?:="")?/g, '')
    .trim();
}
