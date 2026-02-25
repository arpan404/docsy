import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { docsyConfigSchema, normalizeConfig } from '../src/lib/config';

describe('Mintlify compatibility fixtures', () => {
  const fixturePath = resolve(__dirname, 'fixtures/mintlify-compat/mint.json');

  it('normalizes Mintlify fixture config into Docsy-compatible shape', () => {
    const raw = JSON.parse(readFileSync(fixturePath, 'utf-8'));
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
});
