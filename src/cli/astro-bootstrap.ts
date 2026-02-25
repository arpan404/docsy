import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import type { DocsyConfig } from '../lib/config.js';
import { docsyVirtualModules } from '../integration/virtual-modules.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// The template lives inside the npm package
const TEMPLATE_ROOT = resolve(__dirname, '../../src/template');

export async function startDev(options: {
  port: number;
  host: boolean;
  config: DocsyConfig;
  userDir: string;
}): Promise<void> {
  const { dev } = await import('astro');

  const astroInlineConfig = buildAstroConfig({
    config: options.config,
    userDir: options.userDir,
    mode: 'dev',
  });

  await dev({
    ...astroInlineConfig,
    server: {
      port: options.port,
      host: options.host,
    },
  });
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
    redirects: mapRedirectsForAstro(config),
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
      plugins: [
        docsyVirtualModules({
          userContentDir: userDir,
          config,
        }),
      ],
    },
  };
}

export function mapRedirectsForAstro(config: Pick<DocsyConfig, 'redirects'>): Record<string, string | { destination: string; status: 301 | 302 }> {
  const redirects = config.redirects || [];
  const mapped: Record<string, string | { destination: string; status: 301 | 302 }> = {};

  for (const redirect of redirects) {
    mapped[redirect.source] = redirect.permanent
      ? { destination: redirect.destination, status: 301 }
      : { destination: redirect.destination, status: 302 };
  }

  return mapped;
}
