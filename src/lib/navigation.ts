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
    return {
      type: 'page' as const,
      label: page.label || page.slug || 'Unknown',
      slug: page.slug,
      href: page.href,
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
