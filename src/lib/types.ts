export interface PageFrontmatter {
  title?: string;
  description?: string;
  sidebarTitle?: string;
  icon?: string;
  iconType?: string;
  tag?: string;
  hidden?: boolean;
  noindex?: boolean;
  mode?: 'default' | 'wide' | 'custom';
  api?: string;
  openapi?: string;
  'og:title'?: string;
  'og:description'?: string;
  'og:image'?: string;
  'twitter:title'?: string;
  'twitter:description'?: string;
  'twitter:image'?: string;
}

export interface TemplateFontDef {
  family: string;
  weights: number[];
}

export interface TemplateDefinition {
  name: string;
  label: string;
  description: string;
  cssFile: string;
  fonts: {
    body: TemplateFontDef;
    headings: TemplateFontDef;
    mono?: TemplateFontDef;
  };
  defaultAppearance?: 'light' | 'dark' | 'system';
}

export const AVAILABLE_TEMPLATES: TemplateDefinition[] = [
  {
    name: 'horizon',
    label: 'Horizon',
    description: 'Modern professional with soft shadows and gradient accents',
    cssFile: 'horizon.css',
    fonts: {
      body: { family: 'DM Sans', weights: [400, 500, 600, 700] },
      headings: { family: 'Plus Jakarta Sans', weights: [500, 600, 700, 800] },
      mono: { family: 'JetBrains Mono', weights: [400, 500] },
    },
  },
  {
    name: 'obsidian',
    label: 'Obsidian',
    description: 'Dark luxury with gold accents and grain texture',
    cssFile: 'obsidian.css',
    fonts: {
      body: { family: 'Outfit', weights: [300, 400, 500, 600] },
      headings: { family: 'Cormorant Garamond', weights: [400, 500, 600, 700] },
      mono: { family: 'JetBrains Mono', weights: [400] },
    },
    defaultAppearance: 'dark',
  },
  {
    name: 'terminal',
    label: 'Terminal',
    description: 'Hacker CLI with phosphor green and scanlines',
    cssFile: 'terminal.css',
    fonts: {
      body: { family: 'JetBrains Mono', weights: [400, 500, 600, 700] },
      headings: { family: 'JetBrains Mono', weights: [500, 600, 700] },
    },
    defaultAppearance: 'dark',
  },
  {
    name: 'paper',
    label: 'Paper',
    description: 'Editorial print with serif typography and drop caps',
    cssFile: 'paper.css',
    fonts: {
      body: { family: 'Crimson Pro', weights: [400, 500, 600, 700] },
      headings: { family: 'Playfair Display', weights: [400, 600, 700, 800] },
      mono: { family: 'IBM Plex Mono', weights: [400, 500] },
    },
  },
  {
    name: 'neon',
    label: 'Neon',
    description: 'Cyberpunk with neon glows and animated borders',
    cssFile: 'neon.css',
    fonts: {
      body: { family: 'Outfit', weights: [300, 400, 500, 600] },
      headings: { family: 'Orbitron', weights: [400, 500, 600, 700, 800] },
      mono: { family: 'JetBrains Mono', weights: [400] },
    },
    defaultAppearance: 'dark',
  },
  {
    name: 'canvas',
    label: 'Canvas',
    description: 'Minimalist zen with extreme whitespace and hairline borders',
    cssFile: 'canvas.css',
    fonts: {
      body: { family: 'General Sans', weights: [400, 500, 600] },
      headings: { family: 'Instrument Serif', weights: [400] },
      mono: { family: 'IBM Plex Mono', weights: [400, 500] },
    },
  },
  {
    name: 'architect',
    label: 'Architect',
    description: 'Technical blueprint with grid background and dense layout',
    cssFile: 'architect.css',
    fonts: {
      body: { family: 'IBM Plex Sans', weights: [400, 500, 600] },
      headings: { family: 'IBM Plex Mono', weights: [500, 600, 700] },
    },
  },
  {
    name: 'meadow',
    label: 'Meadow',
    description: 'Organic warm with sage, cream, and rounded shapes',
    cssFile: 'meadow.css',
    fonts: {
      body: { family: 'Public Sans', weights: [400, 500, 600, 700] },
      headings: { family: 'Lora', weights: [400, 500, 600, 700] },
      mono: { family: 'IBM Plex Mono', weights: [400, 500] },
    },
  },
  {
    name: 'prism',
    label: 'Prism',
    description: 'Neo-brutalist with thick borders and offset shadows',
    cssFile: 'prism.css',
    fonts: {
      body: { family: 'Space Grotesk', weights: [400, 500, 600, 700] },
      headings: { family: 'Syne', weights: [600, 700, 800] },
      mono: { family: 'JetBrains Mono', weights: [400, 500] },
    },
  },
  {
    name: 'duo',
    label: 'Duo',
    description: 'Split modern with dark nav and light content',
    cssFile: 'duo.css',
    fonts: {
      body: { family: 'Manrope', weights: [400, 500, 600, 700] },
      headings: { family: 'Space Grotesk', weights: [500, 600, 700] },
      mono: { family: 'JetBrains Mono', weights: [400, 500] },
    },
  },
];

// Backwards compatibility alias
export type ThemeDefinition = TemplateDefinition;
export const AVAILABLE_THEMES = AVAILABLE_TEMPLATES;
