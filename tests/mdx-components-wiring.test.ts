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

  it('exports the current Mintlify component surface aliases', () => {
    const filePath = resolve(__dirname, '../src/template/src/components/mdx/index.ts');
    const content = readFileSync(filePath, 'utf-8');

    for (const component of [
      'Panel',
      'Prompt',
      'View',
      'Tile',
      'Color',
      'ColorItem',
      'ColorRow',
      'RequestExample',
      'ResponseExample',
      'Columns',
      'ParamField',
    ]) {
      expect(content).toContain(component);
    }
  });
});
