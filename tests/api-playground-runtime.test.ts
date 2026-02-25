import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('API playground runtime config behavior', () => {
  const apiLayoutPath = resolve(__dirname, '../src/template/src/layouts/APILayout.astro');
  const playgroundPath = resolve(__dirname, '../src/template/src/components/api-playground/APIPlayground.astro');

  const layoutContent = readFileSync(apiLayoutPath, 'utf-8');
  const playgroundContent = readFileSync(playgroundPath, 'utf-8');

  it('prioritizes config.api.baseUrl over OpenAPI server base urls', () => {
    expect(layoutContent).toContain("configuredBaseUrls[0] || openapiData.baseUrls?.[0] || ''");
  });

  it('passes proxy mode from API layout into playground', () => {
    expect(layoutContent).toContain('proxy={apiProxyEnabled}');
  });

  it('uses endpoint-only URL when proxy mode is enabled', () => {
    expect(playgroundContent).toContain('const proxyEnabled = this.dataset.proxy === \'true\'');
    expect(playgroundContent).toContain('let url = proxyEnabled ? endpoint : `${baseUrl}${endpoint}`;');
  });
});
