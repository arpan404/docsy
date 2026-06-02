import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Theme and tabs runtime wiring', () => {
  it('applies config-based color/font CSS vars and font loading in BaseLayout', () => {
    const filePath = resolve(__dirname, '../src/template/src/layouts/BaseLayout.astro');
    const content = readFileSync(filePath, 'utf-8');

    expect(content).toContain("import { templateName, templateFonts, appearance, colors } from 'virtual:docsy/theme';");
    expect(content).toContain('runtimeCssVarStyle');
    expect(content).toContain('--docsy-color-primary');
    expect(content).toContain('fonts.googleapis.com/css2?family=');
  });

  it('renders navigation tabs in TopNav using language-aware nav data', () => {
    const filePath = resolve(__dirname, '../src/template/src/components/nav/TopNav.astro');
    const content = readFileSync(filePath, 'utf-8');

    expect(content).toContain("import navigation from 'virtual:docsy/navigation';");
    expect(content).toContain('const rawTabs: unknown[] = Array.isArray(langNav.tabs)');
    expect(content).toContain('const navTabs: NavTab[] = (hasVersionSelector ? [] : rawTabs)');
    expect(content).toContain('function normalizeNavTab(value: unknown): NavTab | null');
    expect(content).toContain('class:list={[\'topnav-tab\', { active: isTabActive(tab) }]}');
  });

  it('renders Mintlify navigation versions as a selector instead of duplicate tabs', () => {
    const filePath = resolve(__dirname, '../src/template/src/components/nav/TopNav.astro');
    const content = readFileSync(filePath, 'utf-8');

    expect(content).toContain('const rawVersions: unknown[] = Array.isArray(config.versions)');
    expect(content).toContain('const hasVersionSelector = versionItems.length > 0');
    expect(content).toContain('class="version-switcher"');
    expect(content).toContain('aria-label="Select documentation version"');
    expect(content).toContain('version-switcher-tag');
  });
});
