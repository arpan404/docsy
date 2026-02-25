import { existsSync, readFileSync } from 'fs';
import { resolve, join } from 'path';
import { docsyConfigSchema, normalizeConfig, type DocsyConfig } from '../lib/config.js';

const CONFIG_FILE_NAMES = [
  'docsy.json',
  'docsy.config.json',
  'docs.json',
  'mint.json',
];

export async function loadDocsyConfig(
  userDir: string,
  explicitPath?: string
): Promise<DocsyConfig> {
  let configPath: string | undefined;

  if (explicitPath) {
    configPath = resolve(userDir, explicitPath);
    if (!existsSync(configPath)) {
      throw new Error(`Config file not found: ${configPath}`);
    }
  } else {
    for (const name of CONFIG_FILE_NAMES) {
      const candidate = join(userDir, name);
      if (existsSync(candidate)) {
        configPath = candidate;
        break;
      }
    }
  }

  if (!configPath) {
    console.warn('No config file found. Using defaults. Create a mint.json or docsy.json to configure.');
    return docsyConfigSchema.parse({
      name: 'Documentation',
      theme: 'default',
      navigation: [],
      __contentDir: userDir,
    });
  }

  try {
    const raw = JSON.parse(readFileSync(configPath, 'utf-8'));
    const normalized = normalizeConfig(raw);
    normalized.__contentDir = userDir;

    return docsyConfigSchema.parse(normalized);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in config file: ${configPath}\n${error.message}`);
    }
    throw error;
  }
}
