import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('API example languages wiring', () => {
  it('passes api.examples.languages from layout into playground props', () => {
    const layoutPath = resolve(__dirname, '../src/template/src/layouts/APILayout.astro');
    const content = readFileSync(layoutPath, 'utf-8');

    expect(content).toContain("const apiExampleLanguages = config.api?.examples?.languages || ['curl', 'python', 'javascript'];");
    expect(content).toContain('exampleLanguages={apiExampleLanguages}');
  });

  it('renders example language chips in APIPlayground', () => {
    const playgroundPath = resolve(__dirname, '../src/template/src/components/api-playground/APIPlayground.astro');
    const content = readFileSync(playgroundPath, 'utf-8');

    expect(content).toContain('exampleLanguages?: string[];');
    expect(content).toContain('playground__examples');
    expect(content).toContain('{exampleLanguages.map((language) => (');
  });
});
