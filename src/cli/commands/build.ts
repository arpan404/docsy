import chalk from 'chalk';
import ora from 'ora';
import { loadDocsyConfig } from '../config-loader.js';
import { runBuild } from '../astro-bootstrap.js';

export async function buildCommand(options: {
  outDir: string;
  config?: string;
}) {
  const spinner = ora('Building documentation...').start();

  try {
    const userDir = process.cwd();
    const config = await loadDocsyConfig(userDir, options.config);

    spinner.text = `Building ${chalk.cyan(config.name)}...`;

    await runBuild({
      outDir: options.outDir,
      config,
      userDir,
    });

    spinner.succeed(chalk.green(`Build complete! Output: ${chalk.cyan(options.outDir)}`));
    console.log();
    console.log(`  ${chalk.dim('Deploy the output directory to any static host.')}`);
    console.log(`  ${chalk.dim('For Vercel: npx vercel --prebuilt')}`);
  } catch (error) {
    spinner.fail(chalk.red('Build failed'));
    console.error(error);
    process.exit(1);
  }
}
