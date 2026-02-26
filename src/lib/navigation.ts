import { getLanguageNavConfig, getLanguageTabsConfig } from './i18n.js';

export interface NavNode {
  type: 'page' | 'group' | 'tab' | 'anchor' | 'separator';
  label: string;
  slug?: string;
  href?: string;
  icon?: string;
  children?: NavNode[];
}

export interface FlatNavItem {
  slug: string;
  title: string;
  group: string;
  order: number;
}

export interface NavigationContext {
  tree: NavNode[];
  flatItems: FlatNavItem[];
  tabs: NavNode[];
  anchors: NavNode[];
}

export function buildNavigationTree(config: {
  navigation?: { group: string; pages: any[] }[];
  tabs?: { tab: string; pages: any[]; href?: string }[];
  anchors?: { anchor: string; href: string; icon?: string }[];
}): NavigationContext {
  const tree: NavNode[] = [];
  const flatItems: FlatNavItem[] = [];
  let order = 0;

  // Process sidebar groups
  if (config.navigation) {
    for (const group of config.navigation) {
      const children = processPages(group.pages, group.group, flatItems, order);
      order += children.length;
      tree.push({
        type: 'group',
        label: group.group,
        children,
      });
    }
  }

  // Process tabs
  const tabs: NavNode[] = [];
  if (config.tabs) {
    for (const tab of config.tabs) {
      tabs.push({
        type: 'tab',
        label: tab.tab,
        href: tab.href,
        children: processPages(tab.pages, tab.tab, flatItems, order),
      });
    }
  }

  // Process anchors
  const anchors: NavNode[] = [];
  if (config.anchors) {
    for (const anchor of config.anchors) {
      anchors.push({
        type: 'anchor',
        label: anchor.anchor,
        href: anchor.href,
        icon: anchor.icon,
      });
    }
  }

  return { tree, flatItems, tabs, anchors };
}

function processPages(
  pages: any[],
  groupName: string,
  flatItems: FlatNavItem[],
  startOrder: number
): NavNode[] {
  return pages.map((page, i) => {
    if (typeof page === 'string') {
      flatItems.push({
        slug: page,
        title: slugToTitle(page),
        group: groupName,
        order: startOrder + i,
      });
      return {
        type: 'page' as const,
        label: slugToTitle(page),
        slug: page,
      };
    }
    if (page.group) {
      return {
        type: 'group' as const,
        label: page.group,
        icon: page.icon,
        children: processPages(page.pages || [], page.group, flatItems, startOrder + i * 100),
      };
    }
    if (page.dropdown) {
      return {
        type: 'group' as const,
        label: page.dropdown,
        children: processPages(page.pages || [], page.dropdown, flatItems, startOrder + i * 100),
      };
    }
    return {
      type: 'page' as const,
      label: page.label || page.slug || 'Unknown',
      slug: page.slug,
      href: page.href,
      icon: page.icon,
    };
  });
}

function slugToTitle(slug: string): string {
  const name = slug.split('/').pop() || slug;
  return name
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Find previous and next pages for pagination
 */
export function getPrevNext(
  currentSlug: string,
  flatItems: FlatNavItem[]
): { prev?: FlatNavItem; next?: FlatNavItem } {
  const index = flatItems.findIndex((item) => item.slug === currentSlug);
  if (index === -1) return {};
  return {
    prev: index > 0 ? flatItems[index - 1] : undefined,
    next: index < flatItems.length - 1 ? flatItems[index + 1] : undefined,
  };
}

/**
 * Build navigation for a specific language.
 * Uses language-specific overrides (e.g. `navigation.es`) if available,
 * otherwise falls back to the default navigation.
 * For non-default languages, all slugs are prefixed with `{lang}/`.
 */
export function buildNavigationForLanguage(
  config: Record<string, any>,
  lang: string,
  defaultLang: string
): NavigationContext {
  const navConfig = getLanguageNavConfig(config, lang, defaultLang);
  const tabsConfig = getLanguageTabsConfig(config, lang, defaultLang);

  const nav = buildNavigationTree({
    navigation: navConfig,
    tabs: tabsConfig,
    anchors: config.anchors,
  });

  if (lang !== defaultLang) {
    return prefixNavigationSlugs(nav, lang);
  }

  return nav;
}

/**
 * Build navigation trees for all configured languages.
 * Returns a map of language code -> NavigationContext.
 */
export function buildAllLanguageNavigations(
  config: Record<string, any>,
  i18nCtx: { languages: { language: string }[]; defaultLanguage: string }
): Record<string, NavigationContext> {
  const result: Record<string, NavigationContext> = {};
  for (const langConfig of i18nCtx.languages) {
    result[langConfig.language] = buildNavigationForLanguage(
      config,
      langConfig.language,
      i18nCtx.defaultLanguage
    );
  }
  return result;
}

/**
 * Prefix all slugs in a navigation context with a language code.
 */
function prefixNavigationSlugs(nav: NavigationContext, lang: string): NavigationContext {
  return {
    tree: prefixTreeSlugs(nav.tree, lang),
    flatItems: nav.flatItems.map((item) => ({
      ...item,
      slug: `${lang}/${item.slug}`,
    })),
    tabs: prefixTreeSlugs(nav.tabs, lang),
    anchors: nav.anchors,
  };
}

function prefixTreeSlugs(nodes: NavNode[], lang: string): NavNode[] {
  return nodes.map((node) => ({
    ...node,
    slug: node.slug ? `${lang}/${node.slug}` : node.slug,
    children: node.children ? prefixTreeSlugs(node.children, lang) : undefined,
  }));
}
