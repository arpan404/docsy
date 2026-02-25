import type { AstroIntegration } from 'astro';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { docsyVirtualModules } from './virtual-modules.js';
import type { DocsyConfig } from '../lib/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface DocsyIntegrationOptions {
  userContentDir: string;
  config: DocsyConfig;
}

export function docsyIntegration(options: DocsyIntegrationOptions): AstroIntegration {
  return {
    name: 'docsy',
    hooks: {
      'astro:config:setup': ({ updateConfig }) => {
        updateConfig({
          vite: {
            plugins: [
              docsyVirtualModules({
                userContentDir: options.userContentDir,
                config: options.config,
              }),
            ],
            server: {
              fs: {
                allow: [
                  options.userContentDir,
                  resolve(__dirname, '../../src/template'),
                ],
              },
            },
          },
        });
      },
    },
  };
}

export default docsyIntegration;
