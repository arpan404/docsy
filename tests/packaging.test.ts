import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import tsupConfig from '../tsup.config';

describe('packaging output configuration', () => {
  it('package bin and exports point to .mjs files', () => {
    const pkgPath = resolve(__dirname, '../package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));

    expect(pkg.bin.docsy).toBe('./dist/cli/index.mjs');
    expect(pkg.exports['.']).toBe('./dist/integration/index.mjs');
  });

  it('tsup emits .mjs files for both build targets', () => {
    expect(Array.isArray(tsupConfig)).toBe(true);
    const configs = tsupConfig as any[];
    expect(configs.length).toBeGreaterThanOrEqual(2);

    for (const cfg of configs) {
      expect(typeof cfg.outExtension).toBe('function');
      const extension = cfg.outExtension({ format: 'esm' });
      expect(extension.js).toBe('.mjs');
    }
  });
});
