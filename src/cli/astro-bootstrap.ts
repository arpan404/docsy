import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import type { DocsyConfig } from '../lib/config.js';

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

  return {
    name: 'docsy-virtual-modules',
    resolveId(id: string) {
      if (id === virtualModuleId) return resolvedVirtualModuleId;
      if (id === virtualNavId) return resolvedVirtualNavId;
      if (id === virtualThemeId) return resolvedVirtualThemeId;
    },
    load(id: string) {
      if (id === resolvedVirtualModuleId) {
        return `export default ${JSON.stringify(config)};`;
      }
      if (id === resolvedVirtualNavId) {
        const { buildNavigationTree } = require('../lib/navigation.js');
        const nav = buildNavigationTree(config);
        return `export default ${JSON.stringify(nav)};`;
      }
      if (id === resolvedVirtualThemeId) {
        return `export const themeName = ${JSON.stringify(config.theme || 'default')};
export const colors = ${JSON.stringify(config.colors || {})};`;
      }
    },
  };
}
