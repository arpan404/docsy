import chalk from 'chalk';
import ora from 'ora';
import { loadDocsyConfig } from '../config-loader.js';
import { startDev } from '../astro-bootstrap.js';

export async function devCommand(options: {
  port: string;
  host?: boolean;
  config?: string;
}) {
  const spinner = ora('Starting Docsy dev server...').start();

  try {
    const userDir = process.cwd();
    const config = await loadDocsyConfig(userDir, options.config);

    spinner.text = `Loading ${chalk.cyan(config.name)} documentation...`;

    const port = parseInt(options.port, 10);

    await startDev({
      port,
      host: !!options.host,
      config,
      userDir,
    });

    spinner.succeed(chalk.green('Docsy dev server running!'));
    console.log();
    console.log(`  ${chalk.cyan('➜')}  Local:   ${chalk.cyan(`http://localhost:${port}`)}`);
    if (options.host) {
      console.log(`  ${chalk.cyan('➜')}  Network: ${chalk.cyan(`http://0.0.0.0:${port}`)}`);
    }
    console.log();
    console.log(`  ${chalk.dim('Press Ctrl+C to stop')}`);
  } catch (error) {
    spinner.fail(chalk.red('Failed to start dev server'));
    console.error(error);
    process.exit(1);
  }
}
