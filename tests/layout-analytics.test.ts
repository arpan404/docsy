import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('BaseLayout analytics providers', () => {
  const baseLayoutPath = resolve(__dirname, '../src/template/src/layouts/BaseLayout.astro');
  const content = readFileSync(baseLayoutPath, 'utf-8');

  it('includes GA4 wiring', () => {
    expect(content).toContain("analyticsValue(analytics.ga4, ['measurementId'])");
    expect(content).toContain('googletagmanager.com/gtag/js');
  });

  it('includes PostHog wiring', () => {
    expect(content).toContain("analyticsValue(analytics.posthog, ['apiKey'])");
    expect(content).toContain('posthogHost');
    expect(content).toContain('posthogSessionRecording');
    expect(content).toContain('posthog.init');
  });

  it('includes Amplitude wiring', () => {
    expect(content).toContain("analyticsValue(analytics.amplitude, ['apiKey'])");
    expect(content).toContain('cdn.amplitude.com/libs/analytics-browser');
  });

  it('includes Mixpanel wiring', () => {
    expect(content).toContain("analyticsValue(analytics.mixpanel, ['projectToken'])");
    expect(content).toContain('mixpanel.init');
  });

  it('includes additional Mintlify analytics integrations', () => {
    expect(content).toContain("analyticsValue(analytics.gtm, ['tagId'])");
    expect(content).toContain('googletagmanager.com/gtm.js');
    expect(content).toContain("analyticsValue(analytics.clarity, ['projectId'])");
    expect(content).toContain('clarity.ms/tag');
    expect(content).toContain("analyticsValue(analytics.fathom, ['siteId'])");
    expect(content).toContain('cdn.usefathom.com/script.js');
    expect(content).toContain("analyticsValue(analytics.plausible, ['domain'])");
    expect(content).toContain('plausible.io/js/script.js');
    expect(content).toContain("analyticsValue(analytics.heap, ['appId'])");
    expect(content).toContain('cdn.heapanalytics.com/js/heap-');
    expect(content).toContain("analyticsValue(analytics.hotjar, ['hjid'])");
    expect(content).toContain('static.hotjar.com/c/hotjar-');
    expect(content).toContain("analyticsValue(analytics.logrocket, ['appId'])");
    expect(content).toContain('cdn.lr-ingest.com/LogRocket.min.js');
    expect(content).toContain("analyticsValue(analytics.segment, ['key'])");
    expect(content).toContain('cdn.segment.com/analytics.js');
    expect(content).toContain("analyticsValue(analytics.pirsch, ['id'])");
    expect(content).toContain('api.pirsch.io/pirsch.js');
    expect(content).toContain("analyticsValue(analytics.adobe, ['launchUrl'])");
  });
});
