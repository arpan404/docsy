import { describe, it, expect } from 'vitest';
import {
  getI18nContext,
  detectLanguageFromSlug,
  getLanguageNavConfig,
  getLanguageTabsConfig,
  getUIStrings,
  DEFAULT_UI_STRINGS,
} from '../src/lib/i18n';

describe('getI18nContext', () => {
  it('returns single-language English default when no languages configured', () => {
    const ctx = getI18nContext({});
    expect(ctx.isMultiLang).toBe(false);
    expect(ctx.defaultLanguage).toBe('en');
    expect(ctx.languages).toHaveLength(1);
    expect(ctx.languages[0]).toEqual({ language: 'en', label: 'English', isDefault: true });
  });

  it('returns single-language default for empty array', () => {
    const ctx = getI18nContext({ languages: [] });
    expect(ctx.isMultiLang).toBe(false);
    expect(ctx.defaultLanguage).toBe('en');
  });

  it('returns multi-lang context for multiple languages', () => {
    const ctx = getI18nContext({
      languages: [
        { language: 'en', label: 'English', isDefault: true },
        { language: 'es', label: 'Spanish' },
      ],
    });
    expect(ctx.isMultiLang).toBe(true);
    expect(ctx.defaultLanguage).toBe('en');
    expect(ctx.languages).toHaveLength(2);
  });

  it('uses first language as default when none marked isDefault', () => {
    const ctx = getI18nContext({
      languages: [
        { language: 'fr', label: 'French' },
        { language: 'de', label: 'German' },
      ],
    });
    expect(ctx.defaultLanguage).toBe('fr');
    expect(ctx.isMultiLang).toBe(true);
  });

  it('detects isDefault correctly when not first in array', () => {
    const ctx = getI18nContext({
      languages: [
        { language: 'es', label: 'Spanish' },
        { language: 'en', label: 'English', isDefault: true },
      ],
    });
    expect(ctx.defaultLanguage).toBe('en');
  });
});

describe('detectLanguageFromSlug', () => {
  const ctx = getI18nContext({
    languages: [
      { language: 'en', label: 'English', isDefault: true },
      { language: 'es', label: 'Spanish' },
      { language: 'fr', label: 'French' },
    ],
  });

  it('returns default language for unprefixed slug', () => {
    const result = detectLanguageFromSlug('introduction', ctx);
    expect(result.lang).toBe('en');
    expect(result.cleanSlug).toBe('introduction');
  });

  it('detects non-default language from slug prefix', () => {
    const result = detectLanguageFromSlug('es/introduction', ctx);
    expect(result.lang).toBe('es');
    expect(result.cleanSlug).toBe('introduction');
  });

  it('handles nested paths with language prefix', () => {
    const result = detectLanguageFromSlug('fr/guide/getting-started', ctx);
    expect(result.lang).toBe('fr');
    expect(result.cleanSlug).toBe('guide/getting-started');
  });

  it('handles bare language code as slug', () => {
    const result = detectLanguageFromSlug('es', ctx);
    expect(result.lang).toBe('es');
    expect(result.cleanSlug).toBe('es');
  });

  it('returns default language for single-lang context', () => {
    const singleCtx = getI18nContext({});
    const result = detectLanguageFromSlug('es/introduction', singleCtx);
    expect(result.lang).toBe('en');
    expect(result.cleanSlug).toBe('es/introduction');
  });

  it('does not strip default language prefix', () => {
    const result = detectLanguageFromSlug('en/introduction', ctx);
    expect(result.lang).toBe('en');
    expect(result.cleanSlug).toBe('en/introduction');
  });
});

describe('getLanguageNavConfig', () => {
  const config = {
    navigation: [
      { group: 'Guide', pages: ['intro', 'quickstart'] },
    ],
    'navigation.es': [
      { group: 'Guía', pages: ['intro', 'inicio-rapido'] },
    ],
  };

  it('returns default navigation for default language', () => {
    const nav = getLanguageNavConfig(config, 'en', 'en');
    expect(nav).toEqual(config.navigation);
  });

  it('returns language override when available', () => {
    const nav = getLanguageNavConfig(config, 'es', 'en');
    expect(nav).toEqual(config['navigation.es']);
  });

  it('falls back to default navigation when no override exists', () => {
    const nav = getLanguageNavConfig(config, 'fr', 'en');
    expect(nav).toEqual(config.navigation);
  });

  it('returns empty array when no navigation at all', () => {
    const nav = getLanguageNavConfig({}, 'en', 'en');
    expect(nav).toEqual([]);
  });
});

describe('getLanguageTabsConfig', () => {
  const config = {
    tabs: [{ tab: 'API', pages: ['auth'] }],
    'tabs.es': [{ tab: 'API', pages: ['autenticacion'] }],
  };

  it('returns default tabs for default language', () => {
    const tabs = getLanguageTabsConfig(config, 'en', 'en');
    expect(tabs).toEqual(config.tabs);
  });

  it('returns language override when available', () => {
    const tabs = getLanguageTabsConfig(config, 'es', 'en');
    expect(tabs).toEqual(config['tabs.es']);
  });

  it('falls back to default tabs when no override', () => {
    const tabs = getLanguageTabsConfig(config, 'fr', 'en');
    expect(tabs).toEqual(config.tabs);
  });
});

describe('getUIStrings', () => {
  it('returns English strings for en', () => {
    const strings = getUIStrings('en');
    expect(strings.previous).toBe('Previous');
    expect(strings.next).toBe('Next');
    expect(strings.noResults).toBe('No results found');
  });

  it('returns Spanish strings for es', () => {
    const strings = getUIStrings('es');
    expect(strings.previous).toBe('Anterior');
    expect(strings.next).toBe('Siguiente');
  });

  it('falls back to English for unknown language', () => {
    const strings = getUIStrings('xx');
    expect(strings).toEqual(DEFAULT_UI_STRINGS['en']);
  });

  it('has strings for all documented languages', () => {
    const expectedLangs = ['en', 'es', 'fr', 'de', 'ja', 'zh', 'pt', 'ko'];
    for (const lang of expectedLangs) {
      const strings = getUIStrings(lang);
      expect(strings.previous).toBeDefined();
      expect(strings.next).toBeDefined();
      expect(strings.searchPlaceholder).toBeDefined();
      expect(strings.noResults).toBeDefined();
      expect(strings.pageNotFound).toBeDefined();
    }
  });
});
