import type { Plugin } from 'vite';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import type { DocsyConfig } from '../lib/config.js';
import { buildNavigationTree } from '../lib/navigation.js';
import { buildAllLanguageNavigations } from '../lib/navigation.js';
import { buildSearchIndex, buildMultiLangSearchIndex, type SearchDocumentData } from '../lib/search.js';
import { getI18nContext, getUIStrings } from '../lib/i18n.js';
import { parseOpenAPISpec, type ParsedAPI, type ParsedEndpoint } from '../lib/openapi-parser.js';
import { AVAILABLE_TEMPLATES } from '../lib/types.js';

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
    'virtual:docsy/search': generateSearchModule(opts.config, opts.userContentDir),
    'virtual:docsy/theme-styles': generateThemeStylesModule(opts.config),
    'virtual:docsy/i18n': generateI18nModule(opts.config),
    'virtual:docsy/user-dir': `export default ${JSON.stringify(opts.userContentDir)};`,
  };

  const virtualOpenApiId = 'virtual:docsy/openapi';
  let openApiModulePromise: Promise<string> | null = null;

  const resolvedIds = new Map<string, string>();
  for (const key of Object.keys(modules)) {
    resolvedIds.set(key, '\0' + key);
  }
  resolvedIds.set(virtualOpenApiId, '\0' + virtualOpenApiId);

  return {
    name: 'vite-plugin-docsy-virtual-modules',
    resolveId(id: string) {
      const resolved = resolvedIds.get(id);
      if (resolved) return resolved;
    },
    load(id: string) {
      if (id === resolvedIds.get(virtualOpenApiId)) {
        if (!openApiModulePromise) {
          openApiModulePromise = generateOpenAPIModule(opts);
        }
        return openApiModulePromise;
      }

      for (const [key, resolvedId] of resolvedIds.entries()) {
        if (id === resolvedId) {
          if (key === virtualOpenApiId) continue;
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
  const templateName = config.theme || 'horizon';
  const template = AVAILABLE_TEMPLATES.find(t => t.name === templateName) || AVAILABLE_TEMPLATES[0];
  const defaultAppearance = template.defaultAppearance || 'system';
  return `export const themeName = ${JSON.stringify(template.name)};
export const templateName = ${JSON.stringify(template.name)};
export const templateFonts = ${JSON.stringify(template.fonts)};
export const templateDefaultAppearance = ${JSON.stringify(defaultAppearance)};
export const colors = ${JSON.stringify(config.colors || {})};
export const appearance = ${JSON.stringify(config.appearance || { default: defaultAppearance })};`;
}

function generateSearchModule(config: DocsyConfig, userContentDir: string): string {
  const i18nCtx = getI18nContext(config);
  if (i18nCtx.isMultiLang) {
    const allNav = buildAllLanguageNavigations(config, i18nCtx);
    const allSlugs = Object.values(allNav).flatMap((nav) => nav.flatItems.map((item) => item.slug));
    const documentsBySlug = buildSearchDocuments(userContentDir, allSlugs);
    const searchIndex = buildMultiLangSearchIndex(allNav, documentsBySlug);
    return `export default ${JSON.stringify(searchIndex)};`;
  }
  const nav = buildNavigationTree(config);
  const documentsBySlug = buildSearchDocuments(userContentDir, nav.flatItems.map((item) => item.slug));
  const searchIndex = buildSearchIndex(nav.flatItems, documentsBySlug);
  return `export default ${JSON.stringify(searchIndex)};`;
}

function buildSearchDocuments(userContentDir: string, slugs: string[]): Record<string, SearchDocumentData> {
  const documentsBySlug: Record<string, SearchDocumentData> = {};

  for (const slug of Array.from(new Set(slugs))) {
    const docPath = findDocPathForSlug(userContentDir, slug);
    if (!docPath) continue;

    const file = readFileSync(docPath, 'utf-8');
    const parsed = matter(file);
    const body = parsed.content || '';

    const headings = extractHeadings(body);
    const plainContent = stripMarkdownForSearch(body);
    const description = typeof parsed.data.description === 'string' ? parsed.data.description : '';

    documentsBySlug[slug] = {
      description,
      headings,
      content: plainContent,
    };
  }

  return documentsBySlug;
}

function findDocPathForSlug(userContentDir: string, slug: string): string | null {
  const cleanSlug = slug.replace(/^\/+|\/+$/g, '');
  const candidates = [
    resolve(userContentDir, `docs/${cleanSlug}.mdx`),
    resolve(userContentDir, `docs/${cleanSlug}.md`),
    resolve(userContentDir, `docs/${cleanSlug}/index.mdx`),
    resolve(userContentDir, `docs/${cleanSlug}/index.md`),
    resolve(userContentDir, `src/content/docs/${cleanSlug}.mdx`),
    resolve(userContentDir, `src/content/docs/${cleanSlug}.md`),
    resolve(userContentDir, `src/content/docs/${cleanSlug}/index.mdx`),
    resolve(userContentDir, `src/content/docs/${cleanSlug}/index.md`),
    resolve(userContentDir, `src/docs/${cleanSlug}.mdx`),
    resolve(userContentDir, `src/docs/${cleanSlug}.md`),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

function extractHeadings(markdownContent: string): string[] {
  const headings: string[] = [];
  const headingRegex = /^#{1,6}\s+(.+)$/gm;
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(markdownContent)) !== null) {
    const headingText = match[1].replace(/[`*_~\[\]\(\)]/g, '').trim();
    if (headingText) headings.push(headingText);
  }

  return headings;
}

function stripMarkdownForSearch(markdownContent: string): string {
  return markdownContent
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^\)]*\)/g, ' ')
    .replace(/\[[^\]]*\]\([^\)]*\)/g, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_~>-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function generateThemeStylesModule(config: DocsyConfig): string {
  const templateName = config.theme || 'horizon';
  const template = AVAILABLE_TEMPLATES.find(t => t.name === templateName) || AVAILABLE_TEMPLATES[0];
  const themeCssPath = resolve(__dirname, `../../src/template/src/styles/themes/${template.cssFile}`);
  let themeCss = '';
  if (existsSync(themeCssPath)) {
    themeCss = readFileSync(themeCssPath, 'utf-8');
  }
  return `export default ${JSON.stringify(themeCss)};`;
}

function generateI18nModule(config: DocsyConfig): string {
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

interface OpenAPIIndex {
  specs: Array<Pick<ParsedAPI, 'info' | 'servers' | 'tags'>>;
  endpoints: ParsedEndpoint[];
  endpointsByOperationId: Record<string, ParsedEndpoint>;
  endpointsByMethodPath: Record<string, ParsedEndpoint>;
  endpointsByPath: Record<string, ParsedEndpoint[]>;
  baseUrls: string[];
}

async function generateOpenAPIModule(opts: VirtualModuleOptions): Promise<string> {
  const configured = opts.config.api?.openapi;
  const specPaths = Array.isArray(configured)
    ? configured
    : configured
      ? [configured]
      : [];

  const parsedSpecs: ParsedAPI[] = [];
  for (const specPath of specPaths) {
    try {
      const parsed = await parseOpenAPISpec(specPath, opts.userContentDir);
      parsedSpecs.push(parsed);
    } catch (error) {
      console.warn(`[docsy] Failed to parse OpenAPI spec: ${specPath}`);
      console.warn(error);
    }
  }

  const endpoints: ParsedEndpoint[] = parsedSpecs.flatMap((spec) => spec.endpoints);
  const endpointsByOperationId: Record<string, ParsedEndpoint> = {};
  const endpointsByMethodPath: Record<string, ParsedEndpoint> = {};
  const endpointsByPath: Record<string, ParsedEndpoint[]> = {};

  for (const endpoint of endpoints) {
    endpointsByOperationId[endpoint.operationId] = endpoint;
    endpointsByMethodPath[toMethodPathKey(endpoint.method, endpoint.path)] = endpoint;

    if (!endpointsByPath[endpoint.path]) {
      endpointsByPath[endpoint.path] = [];
    }
    endpointsByPath[endpoint.path].push(endpoint);
  }

  const configuredBaseUrls = Array.isArray(opts.config.api?.baseUrl)
    ? opts.config.api?.baseUrl
    : opts.config.api?.baseUrl
      ? [opts.config.api.baseUrl]
      : [];
  const specBaseUrls = parsedSpecs.flatMap((spec) => spec.servers.map((server) => server.url)).filter(Boolean);
  const baseUrls = Array.from(new Set([...configuredBaseUrls, ...specBaseUrls]));

  const index: OpenAPIIndex = {
    specs: parsedSpecs.map((spec) => ({
      info: spec.info,
      servers: spec.servers,
      tags: spec.tags,
    })),
    endpoints,
    endpointsByOperationId,
    endpointsByMethodPath,
    endpointsByPath,
    baseUrls,
  };

  return `export default ${JSON.stringify(index)};`;
}

function toMethodPathKey(method: string, path: string): string {
  return `${method.toUpperCase()} ${path}`;
}
