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
    topbarLinks?: Array<
      | {
          name: string;
          href: string;
        }
      | {
          name: string;
          dropdown: Array<{
            name: string;
            href: string;
          }>;
        }
    >;
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
  export const templateName: string;
  export const templateDefaultAppearance: 'light' | 'dark' | 'system';
  export const templateFonts: {
    body: { family: string; weights: number[] };
    headings: { family: string; weights: number[] };
    mono?: { family: string; weights: number[] };
  };
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

declare module 'virtual:docsy/theme-styles' {
  const themeStyles: string;
  export default themeStyles;
}

declare module 'virtual:docsy/i18n' {
  interface LanguageConfig {
    language: string;
    label: string;
    isDefault?: boolean;
  }

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

  interface I18nData {
    languages: LanguageConfig[];
    defaultLanguage: string;
    isMultiLang: boolean;
    navigation: Record<string, NavigationContext>;
    strings: Record<string, Record<string, string>>;
  }

  const i18n: I18nData;
  export default i18n;
}

declare module 'virtual:docsy/openapi' {
  interface OpenAPIEndpoint {
    operationId: string;
    method: 'get' | 'post' | 'put' | 'patch' | 'delete';
    path: string;
    summary: string;
    description: string;
    parameters: Array<{
      name: string;
      in: 'query' | 'path' | 'header' | 'cookie';
      required: boolean;
      schema: any;
      description: string;
      example?: any;
    }>;
    requestBody?: {
      required: boolean;
      contentType: string;
      schema: any;
      description?: string;
    };
    responses: Record<string, {
      statusCode: string;
      description: string;
      schema?: any;
      headers?: Record<string, any>;
    }>;
    security: Record<string, string[]>[];
    tags: string[];
    deprecated: boolean;
  }

  interface OpenAPIData {
    specs: Array<{
      info: {
        title: string;
        version: string;
        description?: string;
      };
      servers: Array<{ url: string; description?: string }>;
      tags: Array<{ name: string; description?: string }>;
    }>;
    endpoints: OpenAPIEndpoint[];
    endpointsByOperationId: Record<string, OpenAPIEndpoint>;
    endpointsByMethodPath: Record<string, OpenAPIEndpoint>;
    endpointsByPath: Record<string, OpenAPIEndpoint[]>;
    baseUrls: string[];
  }

  const openapiData: OpenAPIData;
  export default openapiData;
}
