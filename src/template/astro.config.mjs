import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import remarkMermaid from './src/remark-plugins/mermaid.mjs';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  integrations: [
    mdx({
      remarkPlugins: [remarkMermaid],
      shikiConfig: {
        theme: 'github-dark',
        wrap: true,
      },
    }),
    react(),
    sitemap(),
  ],
  // The docsy integration and virtual modules are injected at runtime
  // by the CLI via astro-bootstrap.ts, so they are not listed here.
});
