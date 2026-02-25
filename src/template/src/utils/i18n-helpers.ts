/**
 * Shared i18n helpers for Astro components.
 * These work with the virtual:docsy/i18n module data.
 */

interface LanguageConfig {
  language: string;
  label: string;
  isDefault?: boolean;
}

interface I18nData {
  languages: LanguageConfig[];
  defaultLanguage: string;
  isMultiLang: boolean;
  strings: Record<string, Record<string, string>>;
}

/**
 * Detect the current language from a URL pathname.
 */
export function detectLangFromPath(pathname: string, i18n: I18nData): string {
  if (!i18n.isMultiLang) return i18n.defaultLanguage;

  const cleaned = pathname.replace(/^\/+/, '').replace(/\/+$/, '');
  const firstSegment = cleaned.split('/')[0];

  for (const lang of i18n.languages) {
    if (lang.isDefault) continue;
    if (firstSegment === lang.language) {
      return lang.language;
    }
  }

  return i18n.defaultLanguage;
}

/**
 * Get UI strings for a given language from the i18n data.
 */
export function getStrings(lang: string, i18n: I18nData): Record<string, string> {
  return i18n.strings[lang] || i18n.strings[i18n.defaultLanguage] || {};
}

/**
 * Build the equivalent path for a different language.
 * Used by the language switcher to generate links.
 */
export function getPathForLanguage(
  pathname: string,
  targetLang: string,
  i18n: I18nData
): string {
  const currentLang = detectLangFromPath(pathname, i18n);
  const isDefaultTarget = targetLang === i18n.defaultLanguage;
  const isDefaultCurrent = currentLang === i18n.defaultLanguage;

  let cleanPath = pathname.replace(/^\/+/, '').replace(/\/+$/, '');

  // Strip current language prefix if non-default
  if (!isDefaultCurrent) {
    const prefix = currentLang + '/';
    if (cleanPath.startsWith(prefix)) {
      cleanPath = cleanPath.slice(prefix.length);
    } else if (cleanPath === currentLang) {
      cleanPath = '';
    }
  }

  // Add target language prefix if non-default
  if (isDefaultTarget) {
    return '/' + cleanPath;
  }
  return '/' + targetLang + (cleanPath ? '/' + cleanPath : '');
}
