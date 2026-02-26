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
    ga4: z.string().optional(),
    amplitude: z.string().optional(),
    posthog: z.string().optional(),
    mixpanel: z.string().optional(),
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

/**
 * Normalize a mint.json (Mintlify format) config into docsy internal format.
 * This handles the structural differences between formats.
 */
export function normalizeConfig(raw: Record<string, any>): Record<string, any> {
  // If raw.navigation is an array of { group, pages }, it's Mintlify format
  // Docsy format uses the same structure, so we mostly just pass through
  const config = { ...raw };

  // Normalize navigation object format: { tabs: [...] } -> navigation[] + tabs[]
  if (config.navigation && !Array.isArray(config.navigation) && Array.isArray(config.navigation.tabs)) {
    const normalizedTabs = config.navigation.tabs.map((tab: any) => {
      const groupedPages = Array.isArray(tab.groups)
        ? tab.groups.flatMap((group: any) => Array.isArray(group.pages) ? group.pages : [])
        : [];

      return {
        tab: tab.tab || tab.name,
        pages: Array.isArray(tab.pages) ? tab.pages : groupedPages,
        href: tab.url || tab.href,
      };
    }).filter((tab: any) => tab.tab);

    if (!config.tabs || !Array.isArray(config.tabs)) {
      config.tabs = normalizedTabs;
    }

    const firstTabWithGroups = config.navigation.tabs.find((tab: any) => Array.isArray(tab.groups));
    if (firstTabWithGroups) {
      config.navigation = firstTabWithGroups.groups.map((group: any) => ({
        group: group.group,
        pages: Array.isArray(group.pages) ? group.pages : [],
      })).filter((group: any) => group.group);
    } else {
      config.navigation = [];
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
    config.tabs = config.tabs.map((t: any) => ({
      tab: t.name || t.tab,
      pages: t.pages || [],
      href: t.url || t.href,
    }));
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

  // Default theme for mint.json
  if (!config.theme && config.navigation) {
    config.theme = 'horizon';
  }

  return config;
}
