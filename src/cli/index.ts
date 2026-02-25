#!/usr/bin/env node
import { Command } from 'commander';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read version from package.json
let version = '0.1.0';
try {
  const pkgPath = resolve(__dirname, '../../package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  version = pkg.version;
} catch {
  // fallback
}

const program = new Command();

program
  .name('docsy')
  .description('Open-source documentation framework built on Astro')
  .version(version);

program
  .command('dev', { isDefault: true })
  .description('Start the development server')
  .option('-p, --port <number>', 'Port number', '4321')
  .option('--host', 'Expose to network')
  .option('--config <path>', 'Path to config file')
  .action(async (options) => {
    const { devCommand } = await import('./commands/dev.js');
    await devCommand(options);
  });

program
  .command('build')
  .description('Build for production')
  .option('-o, --outDir <path>', 'Output directory', './dist')
  .option('--config <path>', 'Path to config file')
  .action(async (options) => {
    const { buildCommand } = await import('./commands/build.js');
    await buildCommand(options);
  });

program
  .command('init')
  .description('Scaffold a new Docsy project')
  .argument('[directory]', 'Target directory', '.')
  .option('--template <name>', 'Template to use', 'default')
  .action(async (directory, options) => {
    const { initCommand } = await import('./commands/init.js');
    await initCommand(directory, options);
  });

program.parse();
