import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync, existsSync } from 'fs';
import type { DocsyConfig } from '../lib/config.js';
import { buildNavigationTree } from '../lib/navigation.js';
import { buildAllLanguageNavigations } from '../lib/navigation.js';
import { buildSearchIndex, buildMultiLangSearchIndex } from '../lib/search.js';
import { getI18nContext, getUIStrings } from '../lib/i18n.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// The template lives inside the npm package
const TEMPLATE_ROOT = resolve(__dirname, '../../src/template');

export async function startDev(options: {
  port: number;
  host: boolean;
  config: DocsyConfig;
  userDir: string;
}) {
  const { dev } = await import('astro');

  const astroInlineConfig = buildAstroConfig({
    config: options.config,
    userDir: options.userDir,
    mode: 'dev',
  });

  const devServer = await dev({
    ...astroInlineConfig,
    server: {
      port: options.port,
      host: options.host,
    },
  });

  return devServer;
}

export async function runBuild(options: {
  outDir: string;
  config: DocsyConfig;
  userDir: string;
}) {
  const { build } = await import('astro');

  const astroInlineConfig = buildAstroConfig({
    config: options.config,
    userDir: options.userDir,
    mode: 'build',
    outDir: options.outDir,
  });

  await build(astroInlineConfig);
}

function buildAstroConfig(options: {
  config: DocsyConfig;
  userDir: string;
  mode: 'dev' | 'build';
  outDir?: string;
}) {
  const { config, userDir, outDir } = options;

  return {
    root: TEMPLATE_ROOT,
    outDir: outDir ? resolve(userDir, outDir) : undefined,
    integrations: [],
    vite: {
      server: {
        fs: {
          allow: [userDir, TEMPLATE_ROOT, resolve(TEMPLATE_ROOT, '../../')],
        },
      },
      define: {
        '__DOCSY_CONFIG__': JSON.stringify(config),
        '__DOCSY_USER_DIR__': JSON.stringify(userDir),
      },
      resolve: {
        alias: {
          'virtual:docsy/config': '\0virtual:docsy/config',
        },
      },
      plugins: [
        docsyVitePlugin(config, userDir),
      ],
    },
  };
}

function docsyVitePlugin(config: DocsyConfig, userDir: string) {
  const virtualModuleId = 'virtual:docsy/config';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;

  const virtualNavId = 'virtual:docsy/navigation';
  const resolvedVirtualNavId = '\0' + virtualNavId;

  const virtualThemeId = 'virtual:docsy/theme';
  const resolvedVirtualThemeId = '\0' + virtualThemeId;

  const virtualSearchId = 'virtual:docsy/search';
  const resolvedVirtualSearchId = '\0' + virtualSearchId;

  const virtualThemeStylesId = 'virtual:docsy/theme-styles';
  const resolvedVirtualThemeStylesId = '\0' + virtualThemeStylesId;

  const virtualI18nId = 'virtual:docsy/i18n';
  const resolvedVirtualI18nId = '\0' + virtualI18nId;

  // Load the theme CSS file
  const themeName = config.theme || 'default';
  const themeCssPath = resolve(TEMPLATE_ROOT, `src/styles/themes/${themeName}.css`);
  let themeCss = '';
  if (existsSync(themeCssPath)) {
    themeCss = readFileSync(themeCssPath, 'utf-8');
  }

  return {
    name: 'docsy-virtual-modules',
    resolveId(id: string) {
      if (id === virtualModuleId) return resolvedVirtualModuleId;
      if (id === virtualNavId) return resolvedVirtualNavId;
      if (id === virtualThemeId) return resolvedVirtualThemeId;
      if (id === virtualSearchId) return resolvedVirtualSearchId;
      if (id === virtualThemeStylesId) return resolvedVirtualThemeStylesId;
      if (id === virtualI18nId) return resolvedVirtualI18nId;
    },
    load(id: string) {
      if (id === resolvedVirtualModuleId) {
        return `export default ${JSON.stringify(config)};`;
      }
      if (id === resolvedVirtualNavId) {
        const nav = buildNavigationTree(config);
        return `export default ${JSON.stringify(nav)};`;
      }
      if (id === resolvedVirtualThemeId) {
        return `export const themeName = ${JSON.stringify(config.theme || 'default')};
export const colors = ${JSON.stringify(config.colors || {})};`;
      }
      if (id === resolvedVirtualSearchId) {
        const i18nCtx = getI18nContext(config);
        if (i18nCtx.isMultiLang) {
          const allNav = buildAllLanguageNavigations(config, i18nCtx);
          const searchIndex = buildMultiLangSearchIndex(allNav);
          return `export default ${JSON.stringify(searchIndex)};`;
        }
        const nav = buildNavigationTree(config);
        const searchIndex = buildSearchIndex(nav.flatItems);
        return `export default ${JSON.stringify(searchIndex)};`;
      }
      if (id === resolvedVirtualThemeStylesId) {
        return `export default ${JSON.stringify(themeCss)};`;
      }
      if (id === resolvedVirtualI18nId) {
        const i18nCtx = getI18nContext(config);
        const allNav = buildAllLanguageNavigations(config, i18nCtx);
        const strings: Record<string, Record<string, string>> = {};
        for (const lang of i18nCtx.languages) {
          strings[lang.language] = getUIStrings(lang.language);
        }
        return `export default ${JSON.stringify({
          languages: i18nCtx.languages,
          defaultLanguage: i18nCtx.defaultLanguage,
          isMultiLang: i18nCtx.isMultiLang,
          navigation: allNav,
          strings,
        })};`;
      }
    },
  };
}
