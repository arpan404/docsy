import type { Plugin } from 'vite';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { DocsyConfig } from '../lib/config.js';
import { buildNavigationTree } from '../lib/navigation.js';
import { buildSearchIndex } from '../lib/search.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface VirtualModuleOptions {
  userContentDir: string;
  config: DocsyConfig;
}

export function docsyVirtualModules(opts: VirtualModuleOptions): Plugin {
  const modules: Record<string, string> = {
    'virtual:docsy/config': `export default ${JSON.stringify(opts.config)};`,
    'virtual:docsy/navigation': generateNavigationModule(opts.config),
    'virtual:docsy/theme': generateThemeModule(opts.config),
    'virtual:docsy/search': generateSearchModule(opts.config),
    'virtual:docsy/theme-styles': generateThemeStylesModule(opts.config),
    'virtual:docsy/user-dir': `export default ${JSON.stringify(opts.userContentDir)};`,
  };

  const resolvedIds = new Map<string, string>();
  for (const key of Object.keys(modules)) {
    resolvedIds.set(key, '\0' + key);
  }

  return {
    name: 'vite-plugin-docsy-virtual-modules',
    resolveId(id: string) {
      const resolved = resolvedIds.get(id);
      if (resolved) return resolved;
    },
    load(id: string) {
      for (const [key, resolvedId] of resolvedIds.entries()) {
        if (id === resolvedId) {
          return modules[key];
        }
      }
    },
  };
}

function generateNavigationModule(config: DocsyConfig): string {
  const nav = buildNavigationTree(config);
  return `export default ${JSON.stringify(nav)};
export const tree = ${JSON.stringify(nav.tree)};
export const flatItems = ${JSON.stringify(nav.flatItems)};
export const tabs = ${JSON.stringify(nav.tabs)};
export const anchors = ${JSON.stringify(nav.anchors)};`;
}

function generateThemeModule(config: DocsyConfig): string {
  return `export const themeName = ${JSON.stringify(config.theme || 'default')};
export const colors = ${JSON.stringify(config.colors || {})};
export const appearance = ${JSON.stringify(config.appearance || { default: 'system' })};`;
}

function generateSearchModule(config: DocsyConfig): string {
  const nav = buildNavigationTree(config);
  const searchIndex = buildSearchIndex(nav.flatItems);
  return `export default ${JSON.stringify(searchIndex)};`;
}

function generateThemeStylesModule(config: DocsyConfig): string {
  const themeName = config.theme || 'default';
  const themeCssPath = resolve(__dirname, `../../src/template/src/styles/themes/${themeName}.css`);
  let themeCss = '';
  if (existsSync(themeCssPath)) {
    themeCss = readFileSync(themeCssPath, 'utf-8');
  }
  return `export default ${JSON.stringify(themeCss)};`;
}
