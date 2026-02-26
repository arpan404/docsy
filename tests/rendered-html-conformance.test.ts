import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import { afterAll, describe, expect, it } from 'vitest';
import { runBuild } from '../src/cli/astro-bootstrap';
import { loadDocsyConfig } from '../src/cli/config-loader';

const FIXTURE_DIR = resolve(__dirname, 'fixtures/mintlify-compat');
const BUILD_OUTDIR = '.docsy-phase3-dist';

const cleanupDirs: string[] = [];

afterAll(() => {
  for (const dir of cleanupDirs) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe('Rendered HTML conformance snapshots', () => {
  it('renders topnav and sidebar semantics for mint-compatible fixture', async () => {
    const projectDir = createTempProject('mint-config-conformance');
    writeFixtureConfig(projectDir, 'mint.json');

    writeDocs(projectDir, {
      'docs/introduction.mdx': `---\ntitle: Introduction\ndescription: Intro page\n---\n\n# Introduction\n\nWelcome to docs.\n`,
      'docs/quickstart.mdx': `---\ntitle: Quickstart\n---\n\n# Quickstart\n`,
      'docs/api/overview.mdx': `---\ntitle: API Overview\n---\n\n# API Overview\n`,
    });

    await buildFixtureProject(projectDir);

    const html = readBuiltHtml(projectDir, 'introduction');
    const topnav = extractTagBlock(html, 'header', 'topnav');
    const sidebar = extractTagBlock(html, 'aside', 'sidebar');

    expect(normalizeHtml(topnav)).toMatchSnapshot('mint-topnav');
    expect(normalizeHtml(sidebar)).toMatchSnapshot('mint-sidebar');
  });

  it('renders language-specific navigation in built i18n pages', async () => {
    const projectDir = createTempProject('i18n-conformance');
    writeFixtureConfig(projectDir, 'i18n-mint.json');

    writeDocs(projectDir, {
      'docs/introduction.mdx': `---\ntitle: Introduction\n---\n\n# Introduction\n`,
      'docs/quickstart.mdx': `---\ntitle: Quickstart\n---\n\n# Quickstart\n`,
      'docs/es/introduccion.mdx': `---\ntitle: Introducción\n---\n\n# Introducción\n`,
      'docs/es/inicio-rapido.mdx': `---\ntitle: Inicio rápido\n---\n\n# Inicio rápido\n`,
      'docs/es/api/resumen.mdx': `---\ntitle: Resumen API\n---\n\n# Resumen API\n`,
      'docs/api/overview.mdx': `---\ntitle: API Overview\n---\n\n# API Overview\n`,
    });

    await buildFixtureProject(projectDir);

    const html = readBuiltHtml(projectDir, 'es/introduccion');
    const topnav = extractTagBlock(html, 'header', 'topnav');
    const sidebar = extractTagBlock(html, 'aside', 'sidebar');

    expect(normalizeHtml(topnav)).toMatchSnapshot('i18n-es-topnav');
    expect(normalizeHtml(sidebar)).toMatchSnapshot('i18n-es-sidebar');
  });

  it('renders API playground runtime attributes from config + OpenAPI defaults', async () => {
    const projectDir = createTempProject('api-playground-conformance');
    writeFixtureConfig(projectDir, 'api-playground-mint.json');

    writeDocs(projectDir, {
      'docs/api/overview.mdx': `---\ntitle: API Overview\napi: GET /users/{userId}\nopenapi: openapi/main.yaml\n---\n\n# API Overview\n`,
    });

    writeDocs(projectDir, {
      'openapi/main.yaml': `openapi: 3.0.0\ninfo:\n  title: Main API\n  version: 1.0.0\nservers:\n  - url: https://fallback.example.com\npaths:\n  /users/{userId}:\n    get:\n      operationId: listUsers\n      summary: List users\n      parameters:\n        - in: path\n          name: userId\n          required: true\n          schema:\n            type: string\n            default: me\n        - in: query\n          name: page\n          schema:\n            type: integer\n            default: 1\n        - in: header\n          name: X-Request-ID\n          schema:\n            type: string\n            default: req-123\n      responses:\n        '200':\n          description: ok\n`,
      'openapi/admin.yaml': `openapi: 3.0.0\ninfo:\n  title: Admin API\n  version: 1.0.0\npaths:\n  /admins:\n    get:\n      operationId: listAdmins\n      responses:\n        '200':\n          description: ok\n`,
    });

    await buildFixtureProject(projectDir);

    const html = readBuiltHtml(projectDir, 'api/overview');
    const playground = extractTagBlock(html, 'docsy-api-playground', 'playground');

    expect(normalizeHtml(playground)).toMatchSnapshot('api-playground-markup');
  });
});

function createTempProject(prefix: string): string {
  const projectDir = mkdtempSync(join(tmpdir(), `docsy-${prefix}-`));
  cleanupDirs.push(projectDir);
  return projectDir;
}

function writeFixtureConfig(projectDir: string, fixtureFileName: string): void {
  const fixturePath = resolve(FIXTURE_DIR, fixtureFileName);
  const fixtureContent = readFileSync(fixturePath, 'utf-8');
  writeFileSync(resolve(projectDir, 'mint.json'), fixtureContent, 'utf-8');
}

function writeDocs(projectDir: string, files: Record<string, string>): void {
  for (const [relativePath, content] of Object.entries(files)) {
    const targetPath = resolve(projectDir, relativePath);
    mkdirSync(resolve(targetPath, '..'), { recursive: true });
    writeFileSync(targetPath, content, 'utf-8');
  }
}

async function buildFixtureProject(projectDir: string): Promise<void> {
  const config = await loadDocsyConfig(projectDir, 'mint.json');
  await runBuild({
    outDir: BUILD_OUTDIR,
    config,
    userDir: projectDir,
  });
}

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