import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { docsyConfigSchema, normalizeConfig } from '../src/lib/config';
import { buildNavigationTree, buildNavigationForLanguage } from '../src/lib/navigation';

describe('Mintlify compatibility fixtures', () => {
  const fixtureDir = resolve(__dirname, 'fixtures/mintlify-compat');
  const fixtureFiles = readdirSync(fixtureDir).filter((f) => f.endsWith('.json'));

  for (const fixtureFile of fixtureFiles) {
    it(`parses fixture without schema errors: ${fixtureFile}`, () => {
      const raw = JSON.parse(readFileSync(resolve(fixtureDir, fixtureFile), 'utf-8'));
      const normalized = normalizeConfig(raw);
      const parsed = docsyConfigSchema.parse(normalized);
      expect(parsed.name).toBeTruthy();
    });
  }

  it('normalizes Mintlify fixture config into Docsy-compatible shape', () => {
    const raw = JSON.parse(readFileSync(resolve(fixtureDir, 'mint.json'), 'utf-8'));
    const normalized = normalizeConfig(raw);
    const config = docsyConfigSchema.parse(normalized);

    expect(config.anchors?.[0]).toEqual({
      anchor: 'Discord',
      href: 'https://discord.gg/docsy',
      icon: 'discord',
    });

    expect(config.tabs?.[0]).toEqual({
      tab: 'API',
      href: '/api-reference',
      pages: ['api/overview'],
    });

    expect(config.topbarLinks?.[0]).toEqual({
      name: 'Changelog',
      href: '/changelog',
    });

    expect(config.topbarLinks?.[1]).toEqual({
      name: 'Resources',
      dropdown: [
        { name: 'Blog', href: 'https://example.com/blog' },
        { name: 'Status', href: 'https://status.example.com' },
      ],
    });

    expect(config.topbarCtaButton).toEqual({
      name: 'GitHub',
      href: 'https://github.com/docsy',
    });

    expect(config.api?.playground?.display).toBe('simple');
  });

  it('supports language-specific navigation/tabs overrides', () => {
    const raw = JSON.parse(readFileSync(resolve(fixtureDir, 'i18n-mint.json'), 'utf-8'));
    const normalized = normalizeConfig(raw);
    const config = docsyConfigSchema.parse(normalized);

    const esNav = buildNavigationForLanguage(config as any, 'es', 'en');
    expect(esNav.tree[0].label).toBe('Guía');
    expect(esNav.flatItems[0].slug).toBe('es/introduccion');
  });

  it('supports dropdown nodes in navigation trees', () => {
    const raw = JSON.parse(readFileSync(resolve(fixtureDir, 'nav-dropdown-mint.json'), 'utf-8'));
    const normalized = normalizeConfig(raw);
    const config = docsyConfigSchema.parse(normalized);

    const nav = buildNavigationTree(config as any);
    expect(nav.tree[0].children?.[0].label).toBe('Core');
    expect(nav.flatItems.map((item) => item.slug)).toContain('reference/auth');
  });

  it('preserves API playground options and openapi arrays', () => {
    const raw = JSON.parse(readFileSync(resolve(fixtureDir, 'api-playground-mint.json'), 'utf-8'));
    const normalized = normalizeConfig(raw);
    const config = docsyConfigSchema.parse(normalized);

    expect(config.api?.openapi).toEqual(['openapi/main.yaml', 'openapi/admin.yaml']);
    expect(config.api?.baseUrl).toEqual(['https://api.example.com', 'https://staging-api.example.com']);
    expect(config.api?.playground?.proxy).toBe(true);
    expect(config.api?.examples?.languages).toContain('go');
    expect(config.redirects?.[0].permanent).toBe(true);
  });
});
