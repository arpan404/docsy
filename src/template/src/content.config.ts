import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const docs = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/docs' }),
  schema: z.object({
    // Core page metadata
    title: z.string().optional(),
    description: z.string().optional(),
    sidebarTitle: z.string().optional(),
    icon: z.string().optional(),
    iconType: z.string().optional(),
    tag: z.string().optional(),
    hidden: z.boolean().optional(),
    noindex: z.boolean().optional(),
    mode: z.enum(['default', 'wide', 'custom']).optional(),

    // API reference
    api: z.string().optional(),
    openapi: z.string().optional(),

    // OpenGraph meta
    'og:title': z.string().optional(),
    'og:description': z.string().optional(),
    'og:image': z.string().optional(),

    // Twitter meta
    'twitter:title': z.string().optional(),
    'twitter:description': z.string().optional(),
    'twitter:image': z.string().optional(),
  }),
});

export const collections = { docs };
