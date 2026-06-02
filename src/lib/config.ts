import { z } from 'zod';

// Navigation schemas
const navPageSchema = z.string();

const navGroupSchema: z.ZodType<{
  group: string;
  pages: (string | any)[];
  icon?: string;
}> = z.object({
  group: z.string(),
  pages: z.array(z.union([navPageSchema, z.lazy(() => navDropdownSchema), z.lazy(() => navGroupSchema)])),
  icon: z.string().optional(),
});

const navTabSchema = z.object({
  tab: z.string(),
  pages: z.array(z.union([navPageSchema, z.lazy(() => navGroupSchema), z.lazy(() => navDropdownSchema)])),
  href: z.string().optional(),
});

const navAnchorSchema = z.object({
  anchor: z.string(),
  href: z.string(),
  icon: z.string().optional(),
});

const navDropdownSchema: z.ZodType<{
  dropdown: string;
  pages: (string | any)[];
}> = z.object({
  dropdown: z.string(),
  pages: z.array(z.union([navPageSchema, z.lazy(() => navGroupSchema)])),
});

const topbarLinkSchema = z.union([
  z.object({
    name: z.string(),
    href: z.string(),
  }),
  z.object({
    name: z.string(),
    dropdown: z.array(z.object({
      name: z.string(),
      href: z.string(),
    })),
  }),
]);

const analyticsProviderSchema = z.union([z.string(), z.record(z.any())]);

const assistantApiSchema = z.union([
  z.string(),
  z.object({
    endpoint: z.string(),
    method: z.enum(['POST', 'PUT']).default('POST'),
    headers: z.record(z.string()).default({}),
    timeoutMs: z.number().int().positive().optional(),
  }),
]);

const assistantRagSchema = z.object({
  maxResults: z.number().int().positive().default(4),
  maxCharsPerSource: z.number().int().positive().default(8000),
  includeFullMarkdown: z.boolean().default(true),
  contextRoute: z.string().default('/assistant-context.json'),
}).default({});

const contextualHrefSchema = z.union([
  z.string(),
  z.object({
    base: z.string(),
    query: z.array(z.object({
      key: z.string(),
      value: z.string(),
    })).default([]),
  }),
]);

const contextualOptionSchema = z.union([
  z.enum([
    'copy',
    'view',
    'assistant',
    'chatgpt',
    'claude',
    'perplexity',
    'grok',
    'aistudio',
    'devin',
    'windsurf',
    'mcp',
    'add-mcp',
    'cursor',
    'vscode',
    'devin-mcp',
  ]),
  z.object({
    title: z.string(),
    description: z.string(),
    icon: z.string(),
    iconType: z.string().optional(),
    href: contextualHrefSchema,
  }),
]);

// Language/i18n schema
const languageConfigSchema = z.object({
  language: z.string(),
  label: z.string(),
  isDefault: z.boolean().optional(),
});

export const docsyConfigSchema = z.object({
  // Core
  name: z.string().default('Documentation'),
  theme: z.string().default('horizon'),
  description: z.string().optional(),

  // Branding
  colors: z.object({
    primary: z.string().default('#6366f1'),
    light: z.string().optional(),
    dark: z.string().optional(),
    background: z.object({
      light: z.string().optional(),
      dark: z.string().optional(),
    }).optional(),
  }).default({}),

  logo: z.union([
    z.string(),
    z.object({
      light: z.string(),
      dark: z.string(),
      href: z.string().optional(),
    }),
  ]).optional(),
  favicon: z.string().optional(),

  // Typography
  font: z.object({
    headings: z.object({ family: z.string(), weight: z.number().optional() }).optional(),
    body: z.object({ family: z.string(), weight: z.number().optional() }).optional(),
    code: z.object({ family: z.string() }).optional(),
  }).optional(),

  // Navigation
  navigation: z.array(navGroupSchema).default([]),
  tabs: z.array(navTabSchema).optional(),
  anchors: z.array(navAnchorSchema).optional(),

  // Languages / i18n
  languages: z.array(languageConfigSchema).optional(),
  topbarLinks: z.array(topbarLinkSchema).optional(),
  topbarCtaButton: z.object({
    name: z.string(),
    href: z.string(),
  }).optional(),

  // Appearance
  appearance: z.object({
    default: z.enum(['light', 'dark', 'system']).default('system'),
    strict: z.boolean().default(false),
  }).default({ default: 'system', strict: false }),

  // API
  api: z.object({
    openapi: z.union([z.string(), z.array(z.string())]).optional(),
    baseUrl: z.union([z.string(), z.array(z.string())]).optional(),
    playground: z.object({
      display: z.enum(['interactive', 'simple', 'none']).default('interactive'),
      proxy: z.boolean().default(false),
    }).optional(),
    examples: z.object({
      languages: z.array(z.string()).default(['curl', 'python', 'javascript']),
    }).optional(),
  }).optional(),

  // SEO
  seo: z.object({
    indexing: z.boolean().default(true),
    metatags: z.record(z.string()).optional(),
  }).optional(),

  // Analytics
  analytics: z.object({
    adobe: analyticsProviderSchema.optional(),
    amplitude: analyticsProviderSchema.optional(),
    clarity: analyticsProviderSchema.optional(),
    clearbit: analyticsProviderSchema.optional(),
    fathom: analyticsProviderSchema.optional(),
    ga4: analyticsProviderSchema.optional(),
    gtm: analyticsProviderSchema.optional(),
    heap: analyticsProviderSchema.optional(),
    hightouch: analyticsProviderSchema.optional(),
    hotjar: analyticsProviderSchema.optional(),
    logrocket: analyticsProviderSchema.optional(),
    mixpanel: analyticsProviderSchema.optional(),
    pirsch: analyticsProviderSchema.optional(),
    plausible: analyticsProviderSchema.optional(),
    posthog: analyticsProviderSchema.optional(),
    segment: analyticsProviderSchema.optional(),
  }).optional(),

  // Redirects
  redirects: z.array(z.object({
    source: z.string(),
    destination: z.string(),
    permanent: z.boolean().default(false),
  })).optional(),

  // Footer
  footer: z.object({
    socials: z.record(z.string()).optional(),
    columns: z.array(z.object({
      title: z.string(),
      links: z.array(z.object({
        label: z.string(),
        href: z.string(),
      })),
    })).optional(),
  }).optional(),
  footerSocials: z.record(z.string()).optional(),

  // Feedback
  feedback: z.object({
    thumbsRating: z.boolean().optional(),
    raiseIssue: z.union([z.boolean(), z.string()]).optional(),
    suggestEdit: z.union([z.boolean(), z.string()]).optional(),
    githubRepo: z.string().optional(),
    repository: z.string().optional(),
    suggestEditBranch: z.string().optional(),
    docsPath: z.string().optional(),
    issueBaseUrl: z.string().optional(),
    editBaseUrl: z.string().optional(),
  }).optional(),

  // AI contextual menu
  contextual: z.object({
    options: z.array(contextualOptionSchema).default(['copy', 'view']),
    display: z.enum(['header', 'toc']).default('header'),
  }).optional(),

  // MCP metadata used by contextual menu integrations.
  mcp: z.union([
    z.string(),
    z.object({
      url: z.string().optional(),
      server: z.string().optional(),
      name: z.string().optional(),
    }).passthrough(),
  ]).optional(),

  // Local/bring-your-own AI assistant.
  assistant: z.union([
    z.boolean(),
    z.object({
      enabled: z.boolean().default(true),
      api: assistantApiSchema.optional(),
      rag: assistantRagSchema.optional(),
      placeholder: z.string().optional(),
      suggestedQuestions: z.array(z.string()).optional(),
      contactEmail: z.string().optional(),
    }).passthrough(),
  ]).optional(),

  // Banner
  banner: z.object({
    text: z.string(),
    href: z.string().optional(),
    dismissible: z.boolean().default(true),
  }).optional(),

  // Internal - set by integration
  __contentDir: z.string().optional(),
}).passthrough();

export type DocsyConfig = z.infer<typeof docsyConfigSchema>;

function normalizePageEntry(page: any): any {
  if (!page || typeof page !== 'object') return page;

  if (page.group || page.name) {
    return {
      ...page,
      group: page.group || page.name,
      pages: Array.isArray(page.pages) ? page.pages.map(normalizePageEntry) : [],
    };
  }

  if (page.dropdown) {
    return {
      ...page,
      pages: Array.isArray(page.pages) ? page.pages.map(normalizePageEntry) : [],
    };
  }

  if (page.href || page.url || page.slug || page.page) {
    return {
      ...page,
      label: page.label || page.name || page.title,
      slug: page.slug || page.page,
      href: page.href || page.url,
    };
  }

  return page;
}

function normalizeNavigationGroups(groups: any[]): any[] {
  return groups
    .map((group: any) => ({
      ...group,
      group: group.group || group.name || '',
      pages: Array.isArray(group.pages) ? group.pages.map(normalizePageEntry) : [],
    }))
    .filter((group: any) => Array.isArray(group.pages));
}

function normalizeNavigationBlocks(block: any): any[] {
  if (!block || typeof block !== 'object') return [];

  if (Array.isArray(block.groups)) {
    return normalizeNavigationGroups(block.groups);
  }

  if (Array.isArray(block.pages)) {
    return [{
      group: '',
      pages: block.pages.map(normalizePageEntry),
    }];
  }

  return [];
}

function normalizeNavigationTabs(tabs: any[]): any[] {
  return tabs
    .map((tab: any) => {
      const pages = Array.isArray(tab.pages)
        ? tab.pages.map(normalizePageEntry)
        : Array.isArray(tab.groups)
          ? normalizeNavigationGroups(tab.groups)
          : [];

      const normalized: Record<string, any> = {
        tab: tab.tab || tab.name || tab.version,
        pages,
        href: tab.href || tab.url,
      };
      if (tab.icon) normalized.icon = tab.icon;
      if (tab.tag) normalized.tag = tab.tag;
      if (tab.default === true) normalized.default = true;
      return normalized;
    })
    .filter((tab: any) => tab.tab);
}

/**
 * Normalize a mint.json (Mintlify format) config into docsy internal format.
 * This handles the structural differences between formats.
 */
export function normalizeConfig(raw: Record<string, any>): Record<string, any> {
  // If raw.navigation is an array of { group, pages }, it's Mintlify format
  // Docsy format uses the same structure, so we mostly just pass through
  const config = { ...raw };

  // Normalize assistant shorthand:
  // - `assistant: true` enables local assistant UI and defaults API handoff to built-in template route.
  if (config.assistant === true) {
    config.assistant = {
      enabled: true,
      api: '/api/assistant',
    };
  }

  // Normalize modern Mintlify docs.json navigation object format into Docsy's
  // internal array-based groups + top-level tabs representation.
  if (config.navigation && !Array.isArray(config.navigation) && typeof config.navigation === 'object') {
    const navigationObject = config.navigation;

    if (Array.isArray(navigationObject.anchors) && (!config.anchors || !Array.isArray(config.anchors))) {
      config.anchors = navigationObject.anchors;
    }

    if (Array.isArray(navigationObject.tabs) && (!config.tabs || !Array.isArray(config.tabs))) {
      config.tabs = normalizeNavigationTabs(navigationObject.tabs);
    }

    if (Array.isArray(navigationObject.versions)) {
      const normalizedVersions = normalizeNavigationTabs(navigationObject.versions);
      config.versions = normalizedVersions;

      if (!config.tabs || !Array.isArray(config.tabs)) {
        config.tabs = normalizedVersions;
      }

      const defaultVersion = navigationObject.versions.find((version: any) => version.default === true)
        || navigationObject.versions[0];
      config.navigation = normalizeNavigationBlocks(defaultVersion);
    } else {
      const normalizedNavigation = normalizeNavigationBlocks(navigationObject);
      if (normalizedNavigation.length > 0) {
        config.navigation = normalizedNavigation;
      } else if (Array.isArray(navigationObject.tabs)) {
        const defaultTab = navigationObject.tabs.find((tab: any) => Array.isArray(tab.groups))
          || navigationObject.tabs[0];
        config.navigation = normalizeNavigationBlocks(defaultTab);
      } else {
        config.navigation = [];
      }
    }
  }

  // Normalize Mintlify anchors format
  if (config.anchors && Array.isArray(config.anchors)) {
    config.anchors = config.anchors.map((a: any) => ({
      anchor: a.name || a.anchor,
      href: a.url || a.href,
      icon: a.icon,
    }));
  }

  // Normalize Mintlify tabs format
  if (config.tabs && Array.isArray(config.tabs)) {
    config.tabs = normalizeNavigationTabs(config.tabs);
  }

  // Normalize Mintlify topbar links (url -> href, dropdown.url -> href)
  if (config.topbarLinks && Array.isArray(config.topbarLinks)) {
    config.topbarLinks = config.topbarLinks.map((link: any) => {
      if (Array.isArray(link.dropdown)) {
        return {
          name: link.name,
          dropdown: link.dropdown.map((item: any) => ({
            name: item.name,
            href: item.href || item.url,
          })).filter((item: any) => item.name && item.href),
        };
      }

      return {
        name: link.name,
        href: link.href || link.url,
      };
    }).filter((link: any) => link.name && (link.href || (Array.isArray(link.dropdown) && link.dropdown.length > 0)));
  }

  // Normalize Mintlify CTA button (type/url -> name/href)
  if (config.topbarCtaButton) {
    const cta = { ...config.topbarCtaButton };

    if (!cta.href && cta.url) {
      cta.href = cta.url;
    }

    if (!cta.name && typeof cta.type === 'string') {
      cta.name = cta.type.charAt(0).toUpperCase() + cta.type.slice(1);
    }

    if (!cta.name || !cta.href) {
      delete config.topbarCtaButton;
    } else {
      config.topbarCtaButton = cta;
    }
  }

  // Normalize footerSocials to footer.socials
  if (config.footerSocials && !config.footer?.socials) {
    config.footer = config.footer || {};
    config.footer.socials = config.footerSocials;
  }

  // Normalize Mintlify's root-level openapi field into api.openapi
  if (config.openapi) {
    config.api = config.api || {};
    if (!config.api.openapi) {
      config.api.openapi = config.openapi;
    }
  }

  // Normalize Mintlify docs.json analytics integrations into Docsy's analytics bucket.
  // Mintlify documents provider credentials under `integrations`; older Docsy configs
  // may already use root-level `analytics`, so keep explicit analytics values first.
  if (config.integrations && typeof config.integrations === 'object') {
    const analyticsProviders = [
      'adobe',
      'amplitude',
      'clarity',
      'clearbit',
      'fathom',
      'ga4',
      'gtm',
      'heap',
      'hightouch',
      'hotjar',
      'logrocket',
      'mixpanel',
      'pirsch',
      'plausible',
      'posthog',
      'segment',
    ];

    config.analytics = config.analytics || {};
    for (const provider of analyticsProviders) {
      if (config.analytics[provider] === undefined && config.integrations[provider] !== undefined) {
        config.analytics[provider] = config.integrations[provider];
      }
    }
  }

  // Default theme for mint.json
  if (!config.theme && config.navigation) {
    config.theme = 'horizon';
  }

  return config;
}
