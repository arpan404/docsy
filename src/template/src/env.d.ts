/// <reference types="astro/client" />

declare module 'virtual:docsy/config' {
  interface DocsyConfig {
    name: string;
    theme: string;
    description?: string;
    colors: {
      primary: string;
      light?: string;
      dark?: string;
      background?: {
        light?: string;
        dark?: string;
      };
    };
    logo?: string | {
      light: string;
      dark: string;
      href?: string;
    };
    favicon?: string;
    font?: {
      headings?: { family: string; weight?: number };
      body?: { family: string; weight?: number };
      code?: { family: string };
    };
    navigation: Array<{
      group: string;
      pages: any[];
      icon?: string;
    }>;
    tabs?: Array<{
      tab: string;
      pages: any[];
      href?: string;
    }>;
    anchors?: Array<{
      anchor: string;
      href: string;
      icon?: string;
    }>;
    topbarLinks?: Array<{
      name: string;
      href: string;
    }>;
    topbarCtaButton?: {
      name: string;
      href: string;
    };
    appearance: {
      default: 'light' | 'dark' | 'system';
      strict: boolean;
    };
    api?: {
      openapi?: string | string[];
      baseUrl?: string | string[];
      playground?: {
        display: 'interactive' | 'simple' | 'none';
        proxy: boolean;
      };
      examples?: {
        languages: string[];
      };
    };
    seo?: {
      indexing: boolean;
      metatags?: Record<string, string>;
    };
    analytics?: {
      ga4?: string;
      amplitude?: string;
      posthog?: string;
      mixpanel?: string;
    };
    redirects?: Array<{
      source: string;
      destination: string;
      permanent: boolean;
    }>;
    footer?: {
      socials?: Record<string, string>;
      columns?: Array<{
        title: string;
        links: Array<{
          label: string;
          href: string;
        }>;
      }>;
    };
    footerSocials?: Record<string, string>;
    banner?: {
      text: string;
      href?: string;
      dismissible: boolean;
    };
    __contentDir?: string;
    [key: string]: any;
  }

  const config: DocsyConfig;
  export default config;
}

declare module 'virtual:docsy/navigation' {
  interface NavNode {
    type: 'page' | 'group' | 'tab' | 'anchor' | 'separator';
    label: string;
    slug?: string;
    href?: string;
    icon?: string;
    children?: NavNode[];
  }

  interface FlatNavItem {
    slug: string;
    title: string;
    group: string;
    order: number;
  }

  interface NavigationContext {
    tree: NavNode[];
    flatItems: FlatNavItem[];
    tabs: NavNode[];
    anchors: NavNode[];
  }

  const navigation: NavigationContext;
  export default navigation;
  export const tree: NavNode[];
  export const flatItems: FlatNavItem[];
  export const tabs: NavNode[];
  export const anchors: NavNode[];
}

declare module 'virtual:docsy/theme' {
  export const themeName: string;
  export const colors: Record<string, any>;
  export const appearance: {
    default: 'light' | 'dark' | 'system';
    strict?: boolean;
  };
}

declare module 'virtual:docsy/user-dir' {
  const userDir: string;
  export default userDir;
}

declare module 'virtual:docsy/search' {
  interface SearchEntry {
    slug: string;
    title: string;
    description: string;
    headings: string[];
    content: string;
  }

  interface SearchIndex {
    entries: SearchEntry[];
  }

  const searchIndex: SearchIndex;
  export default searchIndex;
}
