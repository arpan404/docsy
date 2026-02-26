import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('MDX component auto-wiring', () => {
  it('injects built-in MDX components into rendered docs content', () => {
    const filePath = resolve(__dirname, '../src/template/src/pages/[...slug].astro');
    const content = readFileSync(filePath, 'utf-8');

    expect(content).toContain("import * as mdxComponents from '../components/mdx';");
    expect(content).toContain('<Content components={mdxComponents} />');
  });
});
