import type { Plugin } from 'vite';
import type { DocsyConfig } from '../lib/config.js';
import { buildNavigationTree } from '../lib/navigation.js';

export interface VirtualModuleOptions {
  userContentDir: string;
  config: DocsyConfig;
}

export function docsyVirtualModules(opts: VirtualModuleOptions): Plugin {
  const modules: Record<string, string> = {
    'virtual:docsy/config': `export default ${JSON.stringify(opts.config)};`,
    'virtual:docsy/navigation': generateNavigationModule(opts.config),
    'virtual:docsy/theme': generateThemeModule(opts.config),
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
