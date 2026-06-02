import { describe, it, expect } from 'vitest';
import { docsyConfigSchema, normalizeConfig } from '../src/lib/config';

describe('docsyConfigSchema', () => {
  it('parses minimal config with defaults', () => {
    const result = docsyConfigSchema.parse({});
    expect(result.name).toBe('Documentation');
    expect(result.theme).toBe('horizon');
    expect(result.navigation).toEqual([]);
    expect(result.colors.primary).toBe('#6366f1');
  });

  it('parses a full config', () => {
    const result = docsyConfigSchema.parse({
      name: 'My Docs',
      theme: 'obsidian',
      description: 'A test site',
      colors: { primary: '#ff0000', light: '#ffeeee', dark: '#990000' },
      navigation: [
        { group: 'Getting Started', pages: ['intro', 'quickstart'] },
      ],
      topbarLinks: [{ name: 'Blog', href: '/blog' }],
      topbarCtaButton: { name: 'GitHub', href: 'https://github.com' },
      appearance: { default: 'dark', strict: true },
      footer: {
        socials: { github: 'https://github.com' },
        columns: [{ title: 'Links', links: [{ label: 'Home', href: '/' }] }],
      },
    });

    expect(result.name).toBe('My Docs');
    expect(result.theme).toBe('obsidian');
    expect(result.colors.primary).toBe('#ff0000');
    expect(result.navigation).toHaveLength(1);
    expect(result.navigation[0].group).toBe('Getting Started');
    expect(result.appearance.default).toBe('dark');
    expect(result.appearance.strict).toBe(true);
  });

  it('supports nested navigation groups', () => {
    const result = docsyConfigSchema.parse({
      navigation: [
        {
          group: 'API',
          pages: [
            'overview',
            { group: 'Endpoints', pages: ['users', 'posts'] },
          ],
        },
      ],
    });

    expect(result.navigation[0].pages).toHaveLength(2);
    expect(result.navigation[0].pages[0]).toBe('overview');
    expect(result.navigation[0].pages[1]).toEqual({
      group: 'Endpoints',
      pages: ['users', 'posts'],
    });
  });

  it('supports dropdown blocks in navigation', () => {
    const result = docsyConfigSchema.parse({
      navigation: [
        {
          group: 'Docs',
          pages: [
            {
              dropdown: 'Guides',
              pages: ['getting-started', 'advanced'],
            },
          ],
        },
      ],
    });

    expect(result.navigation[0].pages[0]).toEqual({
      dropdown: 'Guides',
      pages: ['getting-started', 'advanced'],
    });
  });

  it('supports API config', () => {
    const result = docsyConfigSchema.parse({
      api: {
        openapi: 'openapi.yaml',
        baseUrl: 'https://api.example.com',
        playground: { display: 'interactive', proxy: false },
        examples: { languages: ['curl', 'python'] },
      },
    });

    expect(result.api?.openapi).toBe('openapi.yaml');
    expect(result.api?.playground?.display).toBe('interactive');
    expect(result.api?.examples?.languages).toEqual(['curl', 'python']);
  });

  it('supports analytics config', () => {
    const result = docsyConfigSchema.parse({
      analytics: { ga4: 'G-12345', posthog: 'phc_abc' },
    });
    expect(result.analytics?.ga4).toBe('G-12345');
    expect(result.analytics?.posthog).toBe('phc_abc');
  });

  it('normalizes assistant shorthand to configured defaults', () => {
    const normalized = normalizeConfig({
      assistant: true,
    });
    const parsed = docsyConfigSchema.parse(normalized);

    expect(typeof parsed.assistant).toBe('object');
    if (typeof parsed.assistant === 'object' && parsed.assistant !== null) {
      expect(parsed.assistant.enabled).toBe(true);
      expect(parsed.assistant.api).toBe('/api/assistant');
    } else {
      throw new Error('Expected assistant object');
    }
  });

  it('supports Mintlify integrations analytics config', () => {
    const normalized = normalizeConfig({
      integrations: {
        ga4: { measurementId: 'G-12345' },
        posthog: { apiKey: 'phc_abc', apiHost: 'https://eu.posthog.com', sessionRecording: false },
        mixpanel: { projectToken: 'mix_123' },
        amplitude: { apiKey: 'amp_123' },
        plausible: { domain: 'docs.example.com' },
        gtm: { tagId: 'GTM-123' },
      },
    });
    const result = docsyConfigSchema.parse(normalized);

    expect(result.analytics?.ga4).toEqual({ measurementId: 'G-12345' });
    expect(result.analytics?.posthog).toEqual({
      apiKey: 'phc_abc',
      apiHost: 'https://eu.posthog.com',
      sessionRecording: false,
    });
    expect(result.analytics?.mixpanel).toEqual({ projectToken: 'mix_123' });
    expect(result.analytics?.amplitude).toEqual({ apiKey: 'amp_123' });
    expect(result.analytics?.plausible).toEqual({ domain: 'docs.example.com' });
    expect(result.analytics?.gtm).toEqual({ tagId: 'GTM-123' });
  });

  it('supports redirects', () => {
    const result = docsyConfigSchema.parse({
      redirects: [
        { source: '/old', destination: '/new', permanent: true },
        { source: '/temp', destination: '/other' },
      ],
    });
    expect(result.redirects).toHaveLength(2);
    expect(result.redirects![0].permanent).toBe(true);
    expect(result.redirects![1].permanent).toBe(false);
  });

  it('supports banner config', () => {
    const result = docsyConfigSchema.parse({
      banner: { text: 'Hello world', href: '/link', dismissible: false },
    });
    expect(result.banner?.text).toBe('Hello world');
    expect(result.banner?.dismissible).toBe(false);
  });

  it('supports Mintlify feedback config', () => {
    const result = docsyConfigSchema.parse({
      feedback: {
        thumbsRating: true,
        raiseIssue: true,
        suggestEdit: true,
        githubRepo: 'owner/repo',
        suggestEditBranch: 'docs',
        docsPath: 'content',
      },
    });

    expect(result.feedback?.thumbsRating).toBe(true);
    expect(result.feedback?.raiseIssue).toBe(true);
    expect(result.feedback?.suggestEdit).toBe(true);
    expect(result.feedback?.githubRepo).toBe('owner/repo');
    expect(result.feedback?.suggestEditBranch).toBe('docs');
    expect(result.feedback?.docsPath).toBe('content');
  });

  it('supports Mintlify contextual menu config', () => {
    const result = docsyConfigSchema.parse({
      contextual: {
        display: 'toc',
        options: [
          'copy',
          'view',
          'assistant',
          'chatgpt',
          'claude',
          'perplexity',
          'grok',
          'aistudio',
          'devin',
          'windsurf',
          'mcp',
          'add-mcp',
          'cursor',
          'vscode',
          'devin-mcp',
          {
            title: 'Share',
            description: 'Share this page',
            icon: 'share',
            href: {
              base: 'https://example.com/share',
              query: [{ key: 'text', value: '$path $page $mcp' }],
            },
          },
        ],
      },
      mcp: {
        name: 'docs',
        url: 'https://docs.example.com/mcp',
      },
    });

    expect(result.contextual?.display).toBe('toc');
    expect(result.contextual?.options).toHaveLength(16);
    expect(result.contextual?.options[0]).toBe('copy');
    expect(result.mcp).toEqual({
      name: 'docs',
      url: 'https://docs.example.com/mcp',
    });
  });

  it('defaults contextual display and options', () => {
    const result = docsyConfigSchema.parse({
      contextual: {},
    });

    expect(result.contextual?.display).toBe('header');
    expect(result.contextual?.options).toEqual(['copy', 'view']);
  });

  it('supports assistant config', () => {
    const result = docsyConfigSchema.parse({
      assistant: {
        enabled: true,
        api: '/api/assistant',
        placeholder: 'Ask the docs',
        suggestedQuestions: ['How do I authenticate?'],
        contactEmail: 'support@example.com',
      },
    });

    expect(result.assistant).toEqual({
      enabled: true,
      api: '/api/assistant',
      placeholder: 'Ask the docs',
      suggestedQuestions: ['How do I authenticate?'],
      contactEmail: 'support@example.com',
    });
  });

  it('supports assistant API object and RAG context config', () => {
    const result = docsyConfigSchema.parse({
      assistant: {
        enabled: true,
        api: {
          endpoint: 'https://assistant.example.com/query',
          method: 'PUT',
          headers: { 'X-Docs-Site': 'example' },
          timeoutMs: 5000,
        },
        rag: {
          maxResults: 6,
          maxCharsPerSource: 12000,
          includeFullMarkdown: false,
          contextRoute: '/rag/context.json',
        },
      },
    });

    expect(result.assistant).toEqual({
      enabled: true,
      api: {
        endpoint: 'https://assistant.example.com/query',
        method: 'PUT',
        headers: { 'X-Docs-Site': 'example' },
        timeoutMs: 5000,
      },
      rag: {
        maxResults: 6,
        maxCharsPerSource: 12000,
        includeFullMarkdown: false,
        contextRoute: '/rag/context.json',
      },
    });
  });

  it('allows assistant boolean shorthand', () => {
    expect(docsyConfigSchema.parse({ assistant: true }).assistant).toBe(true);
    expect(docsyConfigSchema.parse({ assistant: false }).assistant).toBe(false);
  });

  it('normalizes assistant boolean shorthand into object config', () => {
    const result = normalizeConfig({
      assistant: true,
    });
    expect(result.assistant).toEqual({
      enabled: true,
      api: '/api/assistant',
    });
  });

  it('allows passthrough of unknown keys', () => {
    const result = docsyConfigSchema.parse({
      customField: 'value',
    });
    expect((result as any).customField).toBe('value');
  });

  it('supports languages config for i18n', () => {
    const result = docsyConfigSchema.parse({
      languages: [
        { language: 'en', label: 'English', isDefault: true },
        { language: 'es', label: 'Spanish' },
      ],
    });
    expect(result.languages).toHaveLength(2);
    expect(result.languages![0].language).toBe('en');
    expect(result.languages![0].isDefault).toBe(true);
    expect(result.languages![1].language).toBe('es');
    expect(result.languages![1].isDefault).toBeUndefined();
  });

  it('allows languages to be omitted', () => {
    const result = docsyConfigSchema.parse({});
    expect(result.languages).toBeUndefined();
  });
});

describe('normalizeConfig', () => {
  it('passes through standard config unchanged', () => {
    const input = { name: 'Docs', navigation: [] };
    const result = normalizeConfig(input);
    expect(result.name).toBe('Docs');
    expect(result.navigation).toEqual([]);
  });

  it('normalizes Mintlify anchors format', () => {
    const result = normalizeConfig({
      anchors: [
        { name: 'Community', url: 'https://discord.gg/example', icon: 'discord' },
      ],
    });
    expect(result.anchors[0]).toEqual({
      anchor: 'Community',
      href: 'https://discord.gg/example',
      icon: 'discord',
    });
  });

  it('normalizes Mintlify tabs format', () => {
    const result = normalizeConfig({
      tabs: [
        { name: 'API', url: '/api', pages: ['endpoint-a'] },
      ],
    });
    expect(result.tabs[0]).toEqual({
      tab: 'API',
      href: '/api',
      pages: ['endpoint-a'],
    });
  });

  it('normalizes modern docs.json navigation groups', () => {
    const result = normalizeConfig({
      navigation: {
        groups: [
          {
            group: 'Guides',
            pages: ['introduction', { group: 'API', pages: ['api/auth'] }],
          },
        ],
      },
    });

    expect(result.navigation).toEqual([
      {
        group: 'Guides',
        pages: ['introduction', { group: 'API', pages: ['api/auth'] }],
      },
    ]);
  });

  it('normalizes modern docs.json root pages', () => {
    const result = normalizeConfig({
      navigation: {
        pages: ['introduction', { title: 'External', url: 'https://example.com' }],
      },
    });

    expect(result.navigation).toEqual([
      {
        group: '',
        pages: [
          'introduction',
          {
            title: 'External',
            url: 'https://example.com',
            label: 'External',
            slug: undefined,
            href: 'https://example.com',
          },
        ],
      },
    ]);
  });

  it('normalizes modern docs.json navigation tabs and anchors', () => {
    const result = normalizeConfig({
      navigation: {
        tabs: [
          {
            tab: 'Guides',
            groups: [{ group: 'Start', pages: ['introduction'] }],
          },
          {
            name: 'API',
            url: '/api/overview',
            pages: ['api/overview'],
          },
        ],
        anchors: [{ name: 'Community', url: 'https://discord.gg/example', icon: 'discord' }],
      },
    });

    expect(result.navigation).toEqual([
      { group: 'Start', pages: ['introduction'] },
    ]);
    expect(result.tabs).toEqual([
      {
        tab: 'Guides',
        pages: [{ group: 'Start', pages: ['introduction'] }],
        href: undefined,
      },
      {
        tab: 'API',
        pages: ['api/overview'],
        href: '/api/overview',
      },
    ]);
    expect(result.anchors).toEqual([
      { anchor: 'Community', href: 'https://discord.gg/example', icon: 'discord' },
    ]);
  });

  it('normalizes modern docs.json navigation versions using the default version', () => {
    const result = normalizeConfig({
      navigation: {
        versions: [
          {
            version: '1.0.0',
            groups: [{ group: 'v1', pages: ['v1/overview'] }],
          },
          {
            version: '2.0.0',
            default: true,
            tag: 'Latest',
            groups: [{ group: 'v2', pages: ['v2/overview', 'v2/quickstart'] }],
          },
        ],
      },
    });

    expect(result.navigation).toEqual([
      { group: 'v2', pages: ['v2/overview', 'v2/quickstart'] },
    ]);
    expect(result.tabs).toEqual([
      {
        tab: '1.0.0',
        pages: [{ group: 'v1', pages: ['v1/overview'] }],
        href: undefined,
      },
      {
        tab: '2.0.0',
        pages: [{ group: 'v2', pages: ['v2/overview', 'v2/quickstart'] }],
        href: undefined,
        tag: 'Latest',
        default: true,
      },
    ]);
    expect(result.versions).toEqual(result.tabs);
  });

  it('normalizes footerSocials to footer.socials', () => {
    const result = normalizeConfig({
      footerSocials: { github: 'https://github.com' },
    });
    expect(result.footer.socials).toEqual({ github: 'https://github.com' });
  });

  it('does not overwrite existing footer.socials', () => {
    const result = normalizeConfig({
      footer: { socials: { twitter: 'https://twitter.com' } },
      footerSocials: { github: 'https://github.com' },
    });
    expect(result.footer.socials).toEqual({ twitter: 'https://twitter.com' });
  });

  it('normalizes openapi field to api.openapi', () => {
    const result = normalizeConfig({
      openapi: 'spec.yaml',
    });
    expect(result.api).toEqual({ openapi: 'spec.yaml' });
  });

  it('merges root openapi into existing api config without overwriting fields', () => {
    const result = normalizeConfig({
      openapi: 'spec.yaml',
      api: { baseUrl: 'https://api.example.com' },
    });
    expect(result.api).toEqual({
      baseUrl: 'https://api.example.com',
      openapi: 'spec.yaml',
    });
  });

  it('sets default theme when navigation present', () => {
    const result = normalizeConfig({
      navigation: [{ group: 'Docs', pages: ['intro'] }],
    });
    expect(result.theme).toBe('horizon');
  });

  it('normalizes topbarLinks url fields and dropdown urls', () => {
    const result = normalizeConfig({
      topbarLinks: [
        { name: 'Docs', url: '/docs' },
        {
          name: 'Resources',
          dropdown: [
            { name: 'Blog', url: 'https://example.com/blog' },
            { name: 'Status', href: 'https://status.example.com' },
          ],
        },
      ],
    });

    expect(result.topbarLinks).toEqual([
      { name: 'Docs', href: '/docs' },
      {
        name: 'Resources',
        dropdown: [
          { name: 'Blog', href: 'https://example.com/blog' },
          { name: 'Status', href: 'https://status.example.com' },
        ],
      },
    ]);
  });

  it('normalizes topbar CTA url to href', () => {
    const result = normalizeConfig({
      topbarCtaButton: { name: 'GitHub', url: 'https://github.com/docsy' },
    });

    expect(result.topbarCtaButton).toEqual({
      name: 'GitHub',
      href: 'https://github.com/docsy',
      url: 'https://github.com/docsy',
    });
  });
});
