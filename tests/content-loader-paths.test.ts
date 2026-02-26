import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Content loader user-dir resolution', () => {
  it('resolves docs base from __DOCSY_USER_DIR__ candidates', () => {
    const filePath = resolve(__dirname, '../src/template/src/content.config.ts');
    const content = readFileSync(filePath, 'utf-8');

    expect(content).toContain('declare const __DOCSY_USER_DIR__: string;');
    expect(content).toContain("resolve(userDir, 'docs')");
    expect(content).toContain("resolve(userDir, 'src/content/docs')");
    expect(content).toContain("resolve(userDir, 'src/docs')");
    expect(content).toContain("loader: glob({ pattern: '**/*.{md,mdx}', base: docsBase })");
  });
});
