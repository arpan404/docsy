import { describe, it, expect } from 'vitest';
import { buildSearchIndex, searchEntries, buildMultiLangSearchIndex, type SearchEntry } from '../src/lib/search';

describe('buildSearchIndex', () => {
  it('returns empty index for empty items', () => {
    const result = buildSearchIndex([]);
    expect(result.entries).toEqual([]);
  });

  it('creates entries from flat nav items', () => {
    const result = buildSearchIndex([
      { slug: 'intro', title: 'Introduction', group: 'Guide' },
      { slug: 'setup', title: 'Setup', group: 'Guide' },
    ]);

    expect(result.entries).toHaveLength(2);
    expect(result.entries[0].slug).toBe('intro');
    expect(result.entries[0].title).toBe('Introduction');
    expect(result.entries[0].description).toBe('');
    expect(result.entries[0].headings).toEqual([]);
    expect(result.entries[0].content).toBe('');
  });
});

describe('searchEntries', () => {
  const entries: SearchEntry[] = [
    {
      slug: 'getting-started',
      title: 'Getting Started',
      description: 'Learn how to set up the project',
      headings: ['Installation', 'Configuration'],
      content: 'First install the dependencies using npm install.',
    },
    {
      slug: 'api-reference',
      title: 'API Reference',
      description: 'Complete API documentation',
      headings: ['Authentication', 'Endpoints', 'Rate Limiting'],
      content: 'The API uses bearer tokens for authentication.',
    },
    {
      slug: 'deployment',
      title: 'Deployment',
      description: 'Deploy your documentation site',
      headings: ['Vercel', 'Netlify', 'Docker'],
      content: 'Deploy to Vercel with a single command.',
    },
  ];

  it('returns empty for empty query', () => {
    expect(searchEntries('', entries)).toEqual([]);
    expect(searchEntries('   ', entries)).toEqual([]);
  });

  it('matches by title', () => {
    const results = searchEntries('deployment', entries);
    expect(results).toHaveLength(1);
    expect(results[0].entry.slug).toBe('deployment');
  });

  it('matches by heading', () => {
    const results = searchEntries('authentication', entries);
    expect(results).toHaveLength(1);
    expect(results[0].entry.slug).toBe('api-reference');
  });

  it('matches by content', () => {
    const results = searchEntries('npm install', entries);
    expect(results).toHaveLength(1);
    expect(results[0].entry.slug).toBe('getting-started');
  });

  it('matches by description', () => {
    const results = searchEntries('documentation', entries);
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some(r => r.entry.slug === 'api-reference')).toBe(true);
  });

  it('matches by slug', () => {
    const results = searchEntries('api-reference', entries);
    expect(results).toHaveLength(1);
    expect(results[0].entry.slug).toBe('api-reference');
  });

  it('ranks title matches higher than content matches', () => {
    const results = searchEntries('api', entries);
    expect(results[0].entry.slug).toBe('api-reference');
  });

  it('handles multi-word queries', () => {
    const results = searchEntries('getting started', entries);
    expect(results).toHaveLength(1);
    expect(results[0].entry.slug).toBe('getting-started');
  });

  it('returns results sorted by score descending', () => {
    const results = searchEntries('deploy', entries);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].score).toBeLessThanOrEqual(results[i - 1].score);
    }
  });

  it('returns no results for non-matching query', () => {
    const results = searchEntries('xyzzyfoo', entries);
    expect(results).toEqual([]);
  });
});

describe('buildMultiLangSearchIndex', () => {
  it('builds index with lang field for all languages', () => {
    const allNavigation = {
      en: { flatItems: [{ slug: 'intro', title: 'Introduction', group: 'Guide' }] },
      es: { flatItems: [{ slug: 'es/intro', title: 'Introducción', group: 'Guía' }] },
    };
    const result = buildMultiLangSearchIndex(allNavigation);
    expect(result.entries).toHaveLength(2);
    expect(result.entries[0].lang).toBe('en');
    expect(result.entries[0].slug).toBe('intro');
    expect(result.entries[1].lang).toBe('es');
    expect(result.entries[1].slug).toBe('es/intro');
  });

  it('returns empty index for empty navigation', () => {
    const result = buildMultiLangSearchIndex({});
    expect(result.entries).toEqual([]);
  });
});
