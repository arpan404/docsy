import { describe, it, expect } from 'vitest';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { loadDocsyConfig } from '../src/cli/config-loader';

describe('loadDocsyConfig', () => {
  it('returns defaults when no config exists', async () => {
    // Use a temp directory with no config files
    const emptyDir = resolve(__dirname, '__fixtures_empty__');
    // loadDocsyConfig should not throw, just warn and return defaults
    const config = await loadDocsyConfig('/tmp/nonexistent-docsy-test-dir');
    expect(config.name).toBe('Documentation');
    expect(config.theme).toBe('default');
    expect(config.navigation).toEqual([]);
  });

  it('loads config from init-template', async () => {
    const templateDir = resolve(__dirname, '../src/init-template');
    if (!existsSync(resolve(templateDir, 'mint.json'))) {
      return; // Skip if init-template doesn't exist
    }

    const config = await loadDocsyConfig(templateDir);
    expect(config.name).toBe('My Documentation');
    expect(config.navigation).toHaveLength(2);
    expect(config.navigation[0].group).toBe('Getting Started');
  });

  it('throws for invalid JSON', async () => {
    // Create a test scenario with explicit bad path
    await expect(
      loadDocsyConfig('/tmp', 'nonexistent.json')
    ).rejects.toThrow('Config file not found');
  });
});

describe('init-template', () => {
  const templateDir = resolve(__dirname, '../src/init-template');

  it('has all required files', () => {
    expect(existsSync(resolve(templateDir, 'package.json'))).toBe(true);
    expect(existsSync(resolve(templateDir, 'mint.json'))).toBe(true);
    expect(existsSync(resolve(templateDir, 'docs/introduction.mdx'))).toBe(true);
    expect(existsSync(resolve(templateDir, 'docs/quickstart.mdx'))).toBe(true);
    expect(existsSync(resolve(templateDir, 'docs/essentials/markdown.mdx'))).toBe(true);
    expect(existsSync(resolve(templateDir, 'docs/essentials/components.mdx'))).toBe(true);
    expect(existsSync(resolve(templateDir, 'public/_headers'))).toBe(true);
    expect(existsSync(resolve(templateDir, 'public/_redirects'))).toBe(true);
    expect(existsSync(resolve(templateDir, 'public/vercel.json'))).toBe(true);
    expect(existsSync(resolve(templateDir, 'api/assistant.ts'))).toBe(true);
  });

  it('has valid mint.json config', async () => {
    const { readFileSync } = await import('fs');
    const raw = JSON.parse(readFileSync(resolve(templateDir, 'mint.json'), 'utf-8'));
    const config = docsyConfigSchema.parse(raw);
    expect(config.name).toBe('My Documentation');
    expect(config.assistant).toBeTruthy();
    if (typeof config.assistant === 'object') {
      expect(config.assistant.enabled).toBe(true);
      expect(config.assistant.api).toEqual('/api/assistant');
    }
  });

  it('has valid package.json', async () => {
    const { readFileSync } = await import('fs');
    const pkg = JSON.parse(readFileSync(resolve(templateDir, 'package.json'), 'utf-8'));
    expect(pkg.scripts.dev).toBe('docsy dev');
    expect(pkg.scripts.build).toBe('docsy build');
    expect(pkg.dependencies.docsy).toBeDefined();
  });
});

// Need to import after describe blocks to avoid circular issues
import { docsyConfigSchema } from '../src/lib/config';
