import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

const rootDir = resolve(__dirname, '..');

function normalize(text: string): string {
  return text.toLowerCase().replace(/[`*_()[\]./-]/g, ' ').replace(/\s+/g, ' ').trim();
}

describe('README compatibility documentation', () => {
  it('documents the Mintlify-compatible surface area and known differences', () => {
    const readmePath = resolve(rootDir, 'README.md');
    expect(existsSync(readmePath)).toBe(true);

    const readme = readFileSync(readmePath, 'utf-8');

    for (const phrase of [
      'Mintlify-compatible',
      'mint.json',
      'docs.json',
      'MDX',
      'OpenAPI',
      'integrations',
      'Page feedback',
      'contextual menu',
      'assistant',
      'llms.txt',
      'Known Differences',
      'PARITY_MATRIX.md',
    ]) {
      expect(readme).toContain(phrase);
    }
  });

  it('keeps missing parity matrix capabilities documented as known differences', () => {
    const readme = normalize(readFileSync(resolve(rootDir, 'README.md'), 'utf-8'));
    const matrix = readFileSync(resolve(rootDir, 'PARITY_MATRIX.md'), 'utf-8');

    const missingCapabilities = matrix
      .split('\n')
      .filter((line) => line.includes('| ❌ Missing |'))
      .map((line) => line.split('|')[1]?.replace(/`/g, '').trim())
      .filter(Boolean);

    expect(missingCapabilities.length).toBeGreaterThan(0);

    for (const capability of missingCapabilities) {
      expect(readme).toContain(normalize(capability));
    }
  });
});
