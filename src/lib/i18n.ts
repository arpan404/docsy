export interface LanguageConfig {
  language: string;
  label: string;
  isDefault?: boolean;
}

export interface I18nContext {
  languages: LanguageConfig[];
  defaultLanguage: string;
  isMultiLang: boolean;
}

/**
 * Extract i18n context from config.
 * If no languages are configured, returns a single-language English default.
 */
export function getI18nContext(config: { languages?: LanguageConfig[] }): I18nContext {
  const languages = config.languages;

  if (!languages || languages.length === 0) {
    return {
      languages: [{ language: 'en', label: 'English', isDefault: true }],
      defaultLanguage: 'en',
      isMultiLang: false,
    };
  }

  const defaultLang = languages.find((l) => l.isDefault) || languages[0];

  return {
    languages,
    defaultLanguage: defaultLang.language,
    isMultiLang: languages.length > 1,
  };
}

/**
 * Detect language from a content slug by checking for language prefix.
 * Returns the language code and the slug with the prefix stripped.
 */
export function detectLanguageFromSlug(
  slug: string,
  ctx: I18nContext
): { lang: string; cleanSlug: string } {
  if (!ctx.isMultiLang) {
    return { lang: ctx.defaultLanguage, cleanSlug: slug };
  }

  for (const langConfig of ctx.languages) {
    if (langConfig.isDefault) continue;
    const prefix = langConfig.language + '/';
    if (slug === langConfig.language || slug.startsWith(prefix)) {
      return {
        lang: langConfig.language,
        cleanSlug: slug.startsWith(prefix) ? slug.slice(prefix.length) : slug,
      };
    }
  }

  return { lang: ctx.defaultLanguage, cleanSlug: slug };
}

/**
 * Get the navigation config array for a specific language.
 * Looks for `config["navigation.{lang}"]`; falls back to `config.navigation`.
 */
export function getLanguageNavConfig(
  config: Record<string, any>,
  lang: string,
  defaultLang: string
): any[] {
  if (lang === defaultLang) return config.navigation || [];
  const override = config[`navigation.${lang}`];
  if (override && Array.isArray(override)) return override;
  return config.navigation || [];
}

/**
 * Get the tabs config for a specific language.
 */
export function getLanguageTabsConfig(
  config: Record<string, any>,
  lang: string,
  defaultLang: string
): any[] | undefined {
  if (lang === defaultLang) return config.tabs;
  const override = config[`tabs.${lang}`];
  if (override && Array.isArray(override)) return override;
  return config.tabs;
}

/**
 * Default UI strings for common languages.
 */
export const DEFAULT_UI_STRINGS: Record<string, Record<string, string>> = {
  en: {
    previous: 'Previous',
    next: 'Next',
    searchPlaceholder: 'Search documentation...',
    searchDocs: 'Search docs...',
    noResults: 'No results found',
    typeToSearch: 'Type to start searching',
    toNavigate: 'to navigate',
    toSelect: 'to select',
    toClose: 'to close',
    pageNotFound: 'Page not found',
    pageNotFoundMessage: 'The page you are looking for does not exist or has been moved.',
    backToHome: 'Back to home',
  },
  es: {
    previous: 'Anterior',
    next: 'Siguiente',
    searchPlaceholder: 'Buscar documentaci\u00f3n...',
    searchDocs: 'Buscar...',
    noResults: 'No se encontraron resultados',
    typeToSearch: 'Escribe para buscar',
    toNavigate: 'para navegar',
    toSelect: 'para seleccionar',
    toClose: 'para cerrar',
    pageNotFound: 'P\u00e1gina no encontrada',
    pageNotFoundMessage: 'La p\u00e1gina que buscas no existe o ha sido movida.',
    backToHome: 'Volver al inicio',
  },
  fr: {
    previous: 'Pr\u00e9c\u00e9dent',
    next: 'Suivant',
    searchPlaceholder: 'Rechercher...',
    searchDocs: 'Rechercher...',
    noResults: 'Aucun r\u00e9sultat',
    typeToSearch: 'Tapez pour rechercher',
    toNavigate: 'pour naviguer',
    toSelect: 'pour s\u00e9lectionner',
    toClose: 'pour fermer',
    pageNotFound: 'Page non trouv\u00e9e',
    pageNotFoundMessage: 'La page que vous recherchez n\u2019existe pas ou a \u00e9t\u00e9 d\u00e9plac\u00e9e.',
    backToHome: 'Retour \u00e0 l\u2019accueil',
  },
  de: {
    previous: 'Zur\u00fcck',
    next: 'Weiter',
    searchPlaceholder: 'Dokumentation durchsuchen...',
    searchDocs: 'Suchen...',
    noResults: 'Keine Ergebnisse gefunden',
    typeToSearch: 'Tippen Sie, um zu suchen',
    toNavigate: 'zum Navigieren',
    toSelect: 'zum Ausw\u00e4hlen',
    toClose: 'zum Schlie\u00dfen',
    pageNotFound: 'Seite nicht gefunden',
    pageNotFoundMessage: 'Die gesuchte Seite existiert nicht oder wurde verschoben.',
    backToHome: 'Zur\u00fcck zur Startseite',
  },
  ja: {
    previous: '\u524d\u3078',
    next: '\u6b21\u3078',
    searchPlaceholder: '\u30c9\u30ad\u30e5\u30e1\u30f3\u30c8\u3092\u691c\u7d22...',
    searchDocs: '\u691c\u7d22...',
    noResults: '\u7d50\u679c\u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093',
    typeToSearch: '\u5165\u529b\u3057\u3066\u691c\u7d22',
    toNavigate: '\u79fb\u52d5',
    toSelect: '\u9078\u629e',
    toClose: '\u9589\u3058\u308b',
    pageNotFound: '\u30da\u30fc\u30b8\u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093',
    pageNotFoundMessage: '\u304a\u63a2\u3057\u306e\u30da\u30fc\u30b8\u306f\u5b58\u5728\u3057\u306a\u3044\u304b\u3001\u79fb\u52d5\u3055\u308c\u307e\u3057\u305f\u3002',
    backToHome: '\u30db\u30fc\u30e0\u306b\u623b\u308b',
  },
  zh: {
    previous: '\u4e0a\u4e00\u9875',
    next: '\u4e0b\u4e00\u9875',
    searchPlaceholder: '\u641c\u7d22\u6587\u6863...',
    searchDocs: '\u641c\u7d22...',
    noResults: '\u672a\u627e\u5230\u7ed3\u679c',
    typeToSearch: '\u8f93\u5165\u4ee5\u641c\u7d22',
    toNavigate: '\u5bfc\u822a',
    toSelect: '\u9009\u62e9',
    toClose: '\u5173\u95ed',
    pageNotFound: '\u9875\u9762\u672a\u627e\u5230',
    pageNotFoundMessage: '\u60a8\u8981\u67e5\u627e\u7684\u9875\u9762\u4e0d\u5b58\u5728\u6216\u5df2\u88ab\u79fb\u52a8\u3002',
    backToHome: '\u8fd4\u56de\u9996\u9875',
  },
  pt: {
    previous: 'Anterior',
    next: 'Pr\u00f3ximo',
    searchPlaceholder: 'Pesquisar documenta\u00e7\u00e3o...',
    searchDocs: 'Pesquisar...',
    noResults: 'Nenhum resultado encontrado',
    typeToSearch: 'Digite para pesquisar',
    toNavigate: 'para navegar',
    toSelect: 'para selecionar',
    toClose: 'para fechar',
    pageNotFound: 'P\u00e1gina n\u00e3o encontrada',
    pageNotFoundMessage: 'A p\u00e1gina que voc\u00ea procura n\u00e3o existe ou foi movida.',
    backToHome: 'Voltar ao in\u00edcio',
  },
  ko: {
    previous: '\uc774\uc804',
    next: '\ub2e4\uc74c',
    searchPlaceholder: '\ubb38\uc11c \uac80\uc0c9...',
    searchDocs: '\uac80\uc0c9...',
    noResults: '\uacb0\uacfc\ub97c \ucc3e\uc744 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4',
    typeToSearch: '\uac80\uc0c9\uc5b4\ub97c \uc785\ub825\ud558\uc138\uc694',
    toNavigate: '\ud0d0\uc0c9',
    toSelect: '\uc120\ud0dd',
    toClose: '\ub2eb\uae30',
    pageNotFound: '\ud398\uc774\uc9c0\ub97c \ucc3e\uc744 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4',
    pageNotFoundMessage: '\ucc3e\uc73c\uc2dc\ub294 \ud398\uc774\uc9c0\uac00 \uc874\uc7ac\ud558\uc9c0 \uc54a\uac70\ub098 \uc774\ub3d9\ub418\uc5c8\uc2b5\ub2c8\ub2e4.',
    backToHome: '\ud648\uc73c\ub85c \ub3cc\uc544\uac00\uae30',
  },
};

/**
 * Get UI strings for a given language code.
 * Falls back to English if the language is not in the default map.
 */
export function getUIStrings(lang: string): Record<string, string> {
  return DEFAULT_UI_STRINGS[lang] || DEFAULT_UI_STRINGS['en'];
}
