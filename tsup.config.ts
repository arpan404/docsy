import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: { 'cli/index': 'src/cli/index.ts' },
    format: ['esm'],
    outDir: 'dist',
    platform: 'node',
    target: 'node18',
    splitting: false,
    clean: true,
    banner: {
      js: '#!/usr/bin/env node',
    },
    external: [
      'astro',
      '@astrojs/mdx',
      '@astrojs/react',
      '@astrojs/vercel',
      '@astrojs/sitemap',
      'react',
      'react-dom',
    ],
  },
  {
    entry: { 'integration/index': 'src/integration/index.ts' },
    format: ['esm'],
    outDir: 'dist',
    platform: 'node',
    target: 'node18',
    splitting: false,
    dts: true,
    external: [
      'astro',
      '@astrojs/mdx',
      '@astrojs/react',
      '@astrojs/vercel',
      '@astrojs/sitemap',
      'react',
      'react-dom',
    ],
  },
]);
