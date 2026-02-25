import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('BaseLayout analytics providers', () => {
  const baseLayoutPath = resolve(__dirname, '../src/template/src/layouts/BaseLayout.astro');
  const content = readFileSync(baseLayoutPath, 'utf-8');

  it('includes GA4 wiring', () => {
    expect(content).toContain('config.analytics?.ga4');
    expect(content).toContain('googletagmanager.com/gtag/js');
  });

  it('includes PostHog wiring', () => {
    expect(content).toContain('config.analytics?.posthog');
    expect(content).toContain('posthog.init');
  });

  it('includes Amplitude wiring', () => {
    expect(content).toContain('config.analytics?.amplitude');
    expect(content).toContain('cdn.amplitude.com/libs/analytics-browser');
  });

  it('includes Mixpanel wiring', () => {
    expect(content).toContain('config.analytics?.mixpanel');
    expect(content).toContain('mixpanel.init');
  });
});
