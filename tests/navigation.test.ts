import { describe, it, expect } from 'vitest';
import { buildNavigationTree, getPrevNext, buildNavigationForLanguage, buildAllLanguageNavigations } from '../src/lib/navigation';

describe('buildNavigationTree', () => {
  it('returns empty context for empty config', () => {
    const result = buildNavigationTree({});
    expect(result.tree).toEqual([]);
    expect(result.flatItems).toEqual([]);
    expect(result.tabs).toEqual([]);
    expect(result.anchors).toEqual([]);
  });

  it('builds tree from simple navigation', () => {
    const result = buildNavigationTree({
      navigation: [
        { group: 'Getting Started', pages: ['introduction', 'quickstart'] },
      ],
    });

    expect(result.tree).toHaveLength(1);
    expect(result.tree[0].type).toBe('group');
    expect(result.tree[0].label).toBe('Getting Started');
    expect(result.tree[0].children).toHaveLength(2);
    expect(result.tree[0].children![0]).toEqual({
      type: 'page',
      label: 'Introduction',
      slug: 'introduction',
    });
  });

  it('populates flatItems in order', () => {
    const result = buildNavigationTree({
      navigation: [
        { group: 'Guide', pages: ['intro', 'setup', 'usage'] },
      ],
    });

    expect(result.flatItems).toHaveLength(3);
    expect(result.flatItems[0].slug).toBe('intro');
    expect(result.flatItems[1].slug).toBe('setup');
    expect(result.flatItems[2].slug).toBe('usage');
    expect(result.flatItems[0].group).toBe('Guide');
  });

  it('handles nested groups', () => {
    const result = buildNavigationTree({
      navigation: [
        {
          group: 'API',
          pages: [
            'overview',
            { group: 'Auth', pages: ['login', 'register'] },
          ],
        },
      ],
    });

    expect(result.tree[0].children).toHaveLength(2);
    expect(result.tree[0].children![0].type).toBe('page');
    expect(result.tree[0].children![1].type).toBe('group');
    expect(result.tree[0].children![1].label).toBe('Auth');
    expect(result.tree[0].children![1].children).toHaveLength(2);
  });

  it('builds flatItems across multiple groups', () => {
    const result = buildNavigationTree({
      navigation: [
        { group: 'Guide', pages: ['intro'] },
        { group: 'Reference', pages: ['api-ref', 'cli-ref'] },
      ],
    });

    expect(result.flatItems).toHaveLength(3);
    expect(result.flatItems[0].group).toBe('Guide');
    expect(result.flatItems[1].group).toBe('Reference');
    expect(result.flatItems[2].group).toBe('Reference');
  });

  it('processes tabs', () => {
    const result = buildNavigationTree({
      tabs: [
        { tab: 'API Reference', pages: ['auth', 'users'], href: '/api' },
      ],
    });

    expect(result.tabs).toHaveLength(1);
    expect(result.tabs[0].type).toBe('tab');
    expect(result.tabs[0].label).toBe('API Reference');
    expect(result.tabs[0].href).toBe('/api');
    expect(result.tabs[0].children).toHaveLength(2);
  });

  it('processes anchors', () => {
    const result = buildNavigationTree({
      anchors: [
        { anchor: 'Community', href: 'https://discord.gg/test', icon: 'discord' },
        { anchor: 'Blog', href: '/blog' },
      ],
    });

    expect(result.anchors).toHaveLength(2);
    expect(result.anchors[0]).toEqual({
      type: 'anchor',
      label: 'Community',
      href: 'https://discord.gg/test',
      icon: 'discord',
    });
    expect(result.anchors[1].icon).toBeUndefined();
  });

  it('converts slugs to titles correctly', () => {
    const result = buildNavigationTree({
      navigation: [
        { group: 'Test', pages: ['getting-started', 'api_reference', 'guide/nested-page'] },
      ],
    });

    expect(result.flatItems[0].title).toBe('Getting Started');
    expect(result.flatItems[1].title).toBe('Api Reference');
    expect(result.flatItems[2].title).toBe('Nested Page');
  });
});

describe('getPrevNext', () => {
  const flatItems = [
    { slug: 'intro', title: 'Intro', group: 'Guide', order: 0 },
    { slug: 'setup', title: 'Setup', group: 'Guide', order: 1 },
    { slug: 'usage', title: 'Usage', group: 'Guide', order: 2 },
  ];

  it('returns prev and next for middle item', () => {
    const result = getPrevNext('setup', flatItems);
    expect(result.prev?.slug).toBe('intro');
    expect(result.next?.slug).toBe('usage');
  });

  it('returns no prev for first item', () => {
    const result = getPrevNext('intro', flatItems);
    expect(result.prev).toBeUndefined();
    expect(result.next?.slug).toBe('setup');
  });

  it('returns no next for last item', () => {
    const result = getPrevNext('usage', flatItems);
    expect(result.prev?.slug).toBe('setup');
    expect(result.next).toBeUndefined();
  });

  it('returns empty for unknown slug', () => {
    const result = getPrevNext('unknown', flatItems);
    expect(result.prev).toBeUndefined();
    expect(result.next).toBeUndefined();
  });

  it('returns empty for empty list', () => {
    const result = getPrevNext('intro', []);
    expect(result).toEqual({});
  });
});

describe('buildNavigationForLanguage', () => {
  it('builds default language navigation without prefixes', () => {
    const config = {
      navigation: [
        { group: 'Guide', pages: ['intro', 'quickstart'] },
      ],
    };
    const nav = buildNavigationForLanguage(config, 'en', 'en');
    expect(nav.flatItems[0].slug).toBe('intro');
    expect(nav.flatItems[1].slug).toBe('quickstart');
  });

  it('prefixes slugs for non-default language', () => {
    const config = {
      navigation: [
        { group: 'Guide', pages: ['intro', 'quickstart'] },
      ],
    };
    const nav = buildNavigationForLanguage(config, 'es', 'en');
    expect(nav.flatItems[0].slug).toBe('es/intro');
    expect(nav.flatItems[1].slug).toBe('es/quickstart');
  });

  it('uses language-specific navigation override', () => {
    const config = {
      navigation: [
        { group: 'Guide', pages: ['intro'] },
      ],
      'navigation.es': [
        { group: 'Guía', pages: ['introduccion'] },
      ],
    };
    const nav = buildNavigationForLanguage(config, 'es', 'en');
    expect(nav.tree[0].label).toBe('Guía');
    expect(nav.flatItems[0].slug).toBe('es/introduccion');
  });

  it('falls back to default navigation when no override', () => {
    const config = {
      navigation: [
        { group: 'Guide', pages: ['intro'] },
      ],
    };
    const nav = buildNavigationForLanguage(config, 'fr', 'en');
    expect(nav.tree[0].label).toBe('Guide');
    expect(nav.flatItems[0].slug).toBe('fr/intro');
  });
});

describe('buildAllLanguageNavigations', () => {
  it('builds navigation for all configured languages', () => {
    const config = {
      navigation: [
        { group: 'Guide', pages: ['intro'] },
      ],
    };
    const i18nCtx = {
      languages: [
        { language: 'en' },
        { language: 'es' },
      ],
      defaultLanguage: 'en',
    };
    const result = buildAllLanguageNavigations(config, i18nCtx);
    expect(Object.keys(result)).toEqual(['en', 'es']);
    expect(result['en'].flatItems[0].slug).toBe('intro');
    expect(result['es'].flatItems[0].slug).toBe('es/intro');
  });
});
