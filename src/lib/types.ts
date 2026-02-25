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

export interface ThemeDefinition {
  name: string;
  label: string;
  description: string;
  cssFile: string;
}

export const AVAILABLE_THEMES: ThemeDefinition[] = [
  { name: 'default', label: 'Default', description: 'Clean neutral design', cssFile: 'default.css' },
  { name: 'stripe', label: 'Stripe', description: 'Navy/slate professional', cssFile: 'stripe.css' },
  { name: 'vercel', label: 'Vercel', description: 'Black/white stark contrast', cssFile: 'vercel.css' },
  { name: 'github', label: 'GitHub', description: 'Blue links, compact', cssFile: 'github.css' },
  { name: 'linear', label: 'Linear', description: 'Purple/violet gradients', cssFile: 'linear.css' },
  { name: 'notion', label: 'Notion', description: 'Light, serif headings', cssFile: 'notion.css' },
  { name: 'supabase', label: 'Supabase', description: 'Emerald green, dark-first', cssFile: 'supabase.css' },
  { name: 'tailwind', label: 'Tailwind', description: 'Sky blue, distinctive', cssFile: 'tailwind.css' },
  { name: 'shadcn', label: 'shadcn', description: 'Zinc neutral, minimal', cssFile: 'shadcn.css' },
  { name: 'mintlify', label: 'Mintlify', description: 'Mintlify-compatible', cssFile: 'mintlify.css' },
  { name: 'terminal', label: 'Terminal', description: 'Green on black, monospace', cssFile: 'terminal.css' },
  { name: 'academic', label: 'Academic', description: 'Serif, scholarly', cssFile: 'academic.css' },
  { name: 'corporate', label: 'Corporate', description: 'Conservative, enterprise', cssFile: 'corporate.css' },
  { name: 'playful', label: 'Playful', description: 'Bright, rounded, bouncy', cssFile: 'playful.css' },
  { name: 'brutalist', label: 'Brutalist', description: 'Stark, raw, no shadows', cssFile: 'brutalist.css' },
  { name: 'retro', label: 'Retro', description: 'Pixel aesthetic, amber tones', cssFile: 'retro.css' },
  { name: 'newspaper', label: 'Newspaper', description: 'Print editorial, drop caps', cssFile: 'newspaper.css' },
  { name: 'glassmorphism', label: 'Glass', description: 'Translucent, blur effects', cssFile: 'glassmorphism.css' },
  { name: 'nordic', label: 'Nordic', description: 'Muted tones, whitespace', cssFile: 'nordic.css' },
  { name: 'monochrome', label: 'Monochrome', description: 'Pure B&W, max contrast', cssFile: 'monochrome.css' },
];
