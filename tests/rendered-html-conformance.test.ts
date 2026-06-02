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

describe.sequential('Rendered HTML conformance snapshots', () => {
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

  it('renders modern docs.json navigation object versions and grouped tabs', async () => {
    const projectDir = createTempProject('docs-json-navigation-conformance');
    writeFileSync(resolve(projectDir, 'docs.json'), JSON.stringify({
      '$schema': 'https://mintlify.com/docs.json',
      name: 'Modern Navigation Fixture',
      theme: 'mint',
      colors: { primary: '#2563eb' },
      navigation: {
        versions: [
          {
            version: '1.0.0',
            groups: [{ group: 'v1 Guides', pages: ['v1/overview'] }],
          },
          {
            version: '2.0.0',
            default: true,
            tag: 'Latest',
            groups: [
              {
                group: 'v2 Guides',
                pages: ['v2/overview', { group: 'API', pages: ['v2/api/auth'] }],
              },
            ],
          },
        ],
      },
    }, null, 2), 'utf-8');

    writeDocs(projectDir, {
      'docs/v1/overview.mdx': `---\ntitle: v1 Overview\n---\n\n# v1 Overview\n`,
      'docs/v2/overview.mdx': `---\ntitle: v2 Overview\n---\n\n# v2 Overview\n`,
      'docs/v2/api/auth.mdx': `---\ntitle: Auth\n---\n\n# Auth\n`,
    });

    await buildFixtureProject(projectDir, 'docs.json');

    const html = readBuiltHtml(projectDir, 'v2/overview');
    const topnav = normalizeHtml(extractTagBlock(html, 'header', 'topnav'));
    const sidebar = normalizeHtml(extractTagBlock(html, 'aside', 'sidebar'));

    expect(topnav).toContain('Modern Navigation Fixture');
    expect(topnav).toContain('version-switcher');
    expect(topnav).toContain('aria-label="Select documentation version"');
    expect(topnav).toContain('href="/v1/overview"');
    expect(topnav).toContain('1.0.0');
    expect(topnav).toContain('href="/v2/overview"');
    expect(topnav).toContain('2.0.0');
    expect(topnav).toContain('Latest');
    expect(sidebar).toContain('v2 Guides');
    expect(sidebar).toContain('href="/v2/overview"');
    expect(sidebar).toContain('API');
    expect(sidebar).toContain('href="/v2/api/auth"');
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

  it('renders Mintlify thumbs feedback when enabled', async () => {
    const projectDir = createTempProject('feedback-conformance');
    writeFileSync(resolve(projectDir, 'mint.json'), JSON.stringify({
      name: 'Feedback Fixture',
      navigation: [{ group: 'Guides', pages: ['introduction'] }],
      topbarCtaButton: { type: 'github', url: 'https://github.com/example/docs' },
      feedback: { thumbsRating: true, raiseIssue: true, suggestEdit: true },
    }, null, 2), 'utf-8');

    writeDocs(projectDir, {
      'docs/introduction.mdx': `---\ntitle: Introduction\n---\n\n# Introduction\n\nWelcome.\n`,
    });

    await buildFixtureProject(projectDir);

    const html = readBuiltHtml(projectDir, 'introduction');
    const feedback = extractTagBlock(html, 'section', 'docsy-feedback');
    const normalized = normalizeHtml(feedback);

    expect(normalized).toContain('Was this page helpful?');
    expect(normalized).toContain('data-feedback-value="positive"');
    expect(normalized).toContain('data-feedback-value="negative"');
    expect(normalized).toContain('data-feedback-action="suggest_edit"');
    expect(normalized).toContain('data-feedback-action="raise_issue"');
    expect(normalized).toContain('https://github.com/example/docs/edit/main/docs/introduction.mdx');
    expect(normalized).toContain('https://github.com/example/docs/issues/new');
    expect(normalized).toContain('Thanks for the feedback.');
  });

  it('resolves markdown source files for feedback edit and issue links', async () => {
    const projectDir = createTempProject('markdown-sourcepath-conformance');
    writeFileSync(resolve(projectDir, 'mint.json'), JSON.stringify({
      name: 'Markdown Source Fixture',
      navigation: [{ group: 'Guides', pages: ['introduction'] }],
      topbarCtaButton: { type: 'github', url: 'https://github.com/example/docs' },
      feedback: { thumbsRating: true, raiseIssue: true, suggestEdit: true },
    }, null, 2), 'utf-8');

    writeDocs(projectDir, {
      'docs/introduction.md': `---\ntitle: Introduction\n---\n\n# Introduction\n\nPlain markdown page.\n`,
    });

    await buildFixtureProject(projectDir);

    const html = readBuiltHtml(projectDir, 'introduction');
    const feedback = normalizeHtml(extractTagBlock(html, 'section', 'docsy-feedback'));

    expect(feedback).toContain('data-source-path="docs/introduction.md"');
    expect(feedback).toContain('https://github.com/example/docs/edit/main/docs/introduction.md');
    expect(feedback).toContain('Source%3A+docs%2Fintroduction.md');
  });

  it('generates AI-readable markdown exports', async () => {
    const projectDir = createTempProject('markdown-export-conformance');
    writeFileSync(resolve(projectDir, 'mint.json'), JSON.stringify({
      name: 'Export Fixture',
      description: 'Docs for export tests',
      navigation: [{ group: 'Guides', pages: ['introduction', 'api/overview'] }],
    }, null, 2), 'utf-8');

    writeDocs(projectDir, {
      'docs/introduction.mdx': `---\ntitle: Introduction\ndescription: Intro page\n---\n\n# Introduction\n\nWelcome to **docs**.\n\n<Visibility for="humans">Hidden from agents.</Visibility>\n<Visibility for="agents">Agent-only guidance.</Visibility>\n`,
      'docs/api/overview.mdx': `---\ntitle: API Overview\ndescription: Endpoint list\napi: GET /users\n---\n\nUse the API.\n`,
    });

    await buildFixtureProject(projectDir);

    const llms = readBuiltText(projectDir, 'llms.txt');
    const llmsFull = readBuiltText(projectDir, 'llms-full.txt');
    const wellKnownLlms = readBuiltText(projectDir, '.well-known/llms.txt');
    const wellKnownLlmsFull = readBuiltText(projectDir, '.well-known/llms-full.txt');
    const introductionMd = readBuiltText(projectDir, 'introduction.md');
    const apiMd = readBuiltText(projectDir, 'api/overview.md');

    expect(llms).toContain('# Export Fixture');
    expect(llms).toContain('> Docs for export tests');
    expect(llms).toContain('- [Introduction](/introduction.md): Intro page');
    expect(llms).toContain('- [API Overview](/api/overview.md): Endpoint list API: GET /users');
    expect(llmsFull).toContain('# Export Fixture');
    expect(llmsFull).toContain('# Introduction');
    expect(llmsFull).toContain('Agent-only guidance.');
    expect(wellKnownLlms).toBe(llms);
    expect(wellKnownLlmsFull).toBe(llmsFull);
    expect(introductionMd).toContain('# Introduction');
    expect(introductionMd).toContain('Welcome to **docs**.');
    expect(introductionMd).toContain('Agent-only guidance.');
    expect(introductionMd).not.toContain('Hidden from agents.');
    expect(apiMd).toContain('# API Overview');
    expect(apiMd).toContain('Use the API.');
  });

  it('includes LLMS discovery hints in generated page head', async () => {
    const projectDir = createTempProject('llms-discovery-hints-conformance');
    writeFileSync(resolve(projectDir, 'mint.json'), JSON.stringify({
      name: 'Discovery Fixture',
      navigation: [{ group: 'Guides', pages: ['introduction'] }],
    }, null, 2), 'utf-8');

    writeDocs(projectDir, {
      'docs/introduction.mdx': `---\ntitle: Introduction\ndescription: Intro page\n---\n\n# Introduction\n`,
    });

    await buildFixtureProject(projectDir);

    const html = readBuiltHtml(projectDir, 'introduction');
    const normalized = normalizeHtml(html);

    expect(normalized).toContain('rel="llms-txt"');
    expect(normalized).toContain('href="/llms.txt"');
    expect(normalized).toContain('rel="llms-full-txt"');
    expect(normalized).toContain('href="/llms-full.txt"');
  });

  it('renders Mintlify contextual menu actions', async () => {
    const projectDir = createTempProject('contextual-conformance');
    writeFileSync(resolve(projectDir, 'mint.json'), JSON.stringify({
      name: 'Contextual Fixture',
      site: 'https://docs.example.com',
      navigation: [{ group: 'Guides', pages: ['introduction'] }],
      mcp: { name: 'contextual-fixture', url: 'https://docs.example.com/mcp' },
      contextual: {
        options: [
          'copy',
          'view',
          'assistant',
          'chatgpt',
          'claude',
          'perplexity',
          'mcp',
          'add-mcp',
          'cursor',
          'vscode',
          {
            title: 'Request a feature',
            description: 'Open a GitHub discussion',
            icon: 'plus',
            href: {
              base: 'https://github.com/orgs/example/discussions/new',
              query: [{ key: 'body', value: '$path $mcp' }],
            },
          },
        ],
      },
    }, null, 2), 'utf-8');

    writeDocs(projectDir, {
      'docs/introduction.mdx': `---\ntitle: Introduction\n---\n\n# Introduction\n\nWelcome.\n`,
    });

    await buildFixtureProject(projectDir);

    const html = readBuiltHtml(projectDir, 'introduction');
    const menu = extractTagBlock(html, 'details', 'docsy-contextual');
    const normalized = normalizeHtml(menu);

    expect(normalized).toContain('data-markdown-url="/introduction.md"');
    expect(normalized).toContain('Copy page');
    expect(normalized).toContain('href="/introduction.md"');
    expect(normalized).toContain('data-contextual-action="assistant"');
    expect(normalized).toContain('data-contextual-action="chatgpt"');
    expect(normalized).toContain('data-contextual-action="claude"');
    expect(normalized).toContain('data-contextual-action="perplexity"');
    expect(normalized).toContain('data-copy-text="https://docs.example.com/mcp"');
    expect(normalized).toContain('npx add-mcp https://docs.example.com/mcp');
    expect(normalized).toContain('cursor://anysphere.cursor-deeplink/mcp/install');
    expect(normalized).toContain('vscode:mcp/install');
    expect(normalized).toContain('Request a feature');
    expect(normalized).toContain('https://github.com/orgs/example/discussions/new?body=%2Fintroduction+https%3A%2F%2Fdocs.example.com%2Fmcp');
  });

  it('renders docs assistant when enabled', async () => {
    const projectDir = createTempProject('assistant-conformance');
    writeFileSync(resolve(projectDir, 'mint.json'), JSON.stringify({
      name: 'Assistant Fixture',
      description: 'Assistant context fixture',
      navigation: [{ group: 'Guides', pages: ['introduction'] }],
      assistant: {
        enabled: true,
        api: {
          endpoint: '/api/assistant',
          method: 'PUT',
          headers: { 'X-Docs-Site': 'assistant-fixture' },
          timeoutMs: 4500,
        },
        rag: {
          maxResults: 3,
          maxCharsPerSource: 4096,
          includeFullMarkdown: false,
          contextRoute: '/assistant-context.json',
        },
        placeholder: 'Ask the product docs',
        suggestedQuestions: ['How do I install?'],
        contactEmail: 'support@example.com',
      },
    }, null, 2), 'utf-8');

    writeDocs(projectDir, {
      'docs/introduction.mdx': `---\ntitle: Introduction\ndescription: Install guide\n---\n\n# Introduction\n\nInstall with npm.\n`,
    });

    await buildFixtureProject(projectDir);

    const html = readBuiltHtml(projectDir, 'introduction');
    const assistantContext = JSON.parse(readBuiltText(projectDir, 'assistant-context.json'));
    const topnav = extractTagBlock(html, 'header', 'topnav');
    const normalizedTopnav = normalizeHtml(topnav);
    const normalizedPage = normalizeHtml(html);

    expect(normalizedTopnav).toContain('data-assistant-trigger');
    expect(normalizedTopnav).toContain('Ask AI');
    expect(normalizedPage).toContain('class="docsy-assistant"');
    expect(normalizedPage).toContain('data-assistant-api="/api/assistant"');
    expect(normalizedPage).toContain('data-assistant-api-config="{&#34;endpoint&#34;:&#34;/api/assistant&#34;,&#34;method&#34;:&#34;PUT&#34;,&#34;headers&#34;:{&#34;X-Docs-Site&#34;:&#34;assistant-fixture&#34;},&#34;timeoutMs&#34;:4500}"');
    expect(normalizedPage).toContain('data-max-results="3"');
    expect(normalizedPage).toContain('data-max-chars-per-source="4096"');
    expect(normalizedPage).toContain('data-include-full-markdown="false"');
    expect(normalizedPage).toContain('data-context-route="/assistant-context.json"');
    expect(normalizedPage).toContain('data-contact-email="support@example.com"');
    expect(normalizedPage).toContain('Ask these docs');
    expect(normalizedPage).toContain('Ask the product docs');
    expect(normalizedPage).toContain('How do I install?');

    expect(assistantContext.name).toBe('Assistant Fixture');
    expect(assistantContext.description).toBe('Assistant context fixture');
    expect(assistantContext.routes).toEqual({
      llms: '/llms.txt',
      llmsFull: '/llms-full.txt',
    });
    expect(assistantContext.pages).toHaveLength(1);
    expect(assistantContext.pages[0]).toMatchObject({
      slug: 'introduction',
      title: 'Introduction',
      description: 'Install guide',
      markdownUrl: '/introduction.md',
    });
    expect(assistantContext.pages[0].markdown).toContain('Install with npm.');
  });

  it('renders current Mintlify component surface examples', async () => {
    const projectDir = createTempProject('component-surface-conformance');
    writeFileSync(resolve(projectDir, 'mint.json'), JSON.stringify({
      name: 'Component Surface Fixture',
      navigation: [{ group: 'Components', pages: ['components'] }],
    }, null, 2), 'utf-8');

    writeDocs(projectDir, {
      'docs/components.mdx': `---
title: Components
---

# Components

<Panel title="Side notes">
  <Info>Pin info to the side panel.</Info>
</Panel>

<Prompt description="Generate clear docs." actions={["copy", "cursor"]}>
You are a technical writing assistant.
</Prompt>

<View title="JavaScript" icon="code">
JavaScript view content.
</View>

<View title="Python" icon="code">
Python view content.
</View>

<Columns cols={2}>
  <Tile href="/components" title="Accordion" description="Two variants">
    <img src="/images/accordion.svg" alt="Accordion preview" />
  </Tile>
  <Card title="Card title" icon="box">Card body.</Card>
</Columns>

<Color variant="compact">
  <Color.Item name="blue-500" value="#3B82F6" />
  <Color.Item name="theme-bg" value={{ light: "#FFFFFF", dark: "#000000" }} />
</Color>

<Color variant="table">
  <Color.Row title="Primary">
    <Color.Item name="primary-500" value="#3B82F6" />
  </Color.Row>
</Color>

<RequestExample>
\`\`\`bash Request
curl https://api.example.com
\`\`\`
</RequestExample>

<ResponseExample>
\`\`\`json Response
{ "ok": true }
\`\`\`
</ResponseExample>
`,
    });

    await buildFixtureProject(projectDir);

    const html = readBuiltHtml(projectDir, 'components');
    const normalized = normalizeHtml(html);

    expect(normalized).toContain('class="docsy-panel"');
    expect(normalized).toContain('Side notes');
    expect(normalized).toContain('class="docsy-prompt"');
    expect(normalized).toContain('Copy prompt');
    expect(normalized).toContain('Open in Cursor');
    expect(normalized).toContain('data-docsy-view');
    expect(normalized).toContain('data-view-title="JavaScript"');
    expect(normalized).toContain('class="docsy-tile"');
    expect(normalized).toContain('Accordion');
    expect(normalized).toContain('class="docsy-color docsy-color--compact"');
    expect(normalized).toContain('blue-500');
    expect(normalized).toContain('theme-bg');
    expect(normalized).toContain('class="docsy-color-row"');
    expect(normalized).toContain('Primary');
    expect(normalized).toContain('class="docsy-example docsy-example--request"');
    expect(normalized).toContain('class="docsy-example docsy-example--response"');
    expect(normalized).toContain('curl');
    expect(normalized).toContain('https://api.example.com');
    expect(normalized).toContain('&quot;ok&quot;');
    expect(normalized).toContain('true');
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

async function buildFixtureProject(projectDir: string, configFile = 'mint.json'): Promise<void> {
  const config = await loadDocsyConfig(projectDir, configFile);
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

function readBuiltText(projectDir: string, route: string): string {
  const cleanedRoute = route.replace(/^\/+|\/+$/g, '');
  return readFileSync(resolve(projectDir, BUILD_OUTDIR, cleanedRoute), 'utf-8');
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
    .replace(/\sdata-astro-cid-[a-z0-9-]+(?:="(?:true)?")?/g, '')
    .trim();
}
