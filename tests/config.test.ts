import { describe, it, expect } from 'vitest';
import { docsyConfigSchema, normalizeConfig } from '../src/lib/config';

describe('docsyConfigSchema', () => {
  it('parses minimal config with defaults', () => {
    const result = docsyConfigSchema.parse({});
    expect(result.name).toBe('Documentation');
    expect(result.theme).toBe('default');
    expect(result.navigation).toEqual([]);
    expect(result.colors.primary).toBe('#6366f1');
  });

  it('parses a full config', () => {
    const result = docsyConfigSchema.parse({
      name: 'My Docs',
      theme: 'stripe',
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
    expect(result.theme).toBe('stripe');
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

  it('does not overwrite existing api config', () => {
    const result = normalizeConfig({
      openapi: 'spec.yaml',
      api: { baseUrl: 'https://api.example.com' },
    });
    expect(result.api).toEqual({ baseUrl: 'https://api.example.com' });
  });

  it('sets default theme when navigation present', () => {
    const result = normalizeConfig({
      navigation: [{ group: 'Docs', pages: ['intro'] }],
    });
    expect(result.theme).toBe('default');
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
