import { existsSync, readdirSync, cpSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import ora from 'ora';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const INIT_TEMPLATE = resolve(__dirname, '../../../src/init-template');

export async function initCommand(
  directory: string,
  options: { template?: string }
) {
  const targetDir = resolve(process.cwd(), directory);
  const dirName = directory === '.' ? 'current directory' : directory;

  console.log();
  console.log(chalk.bold(`  Creating a new Docsy project in ${chalk.cyan(dirName)}`));
  console.log();

  // Check if directory exists and is not empty
  if (existsSync(targetDir)) {
    const files = readdirSync(targetDir);
    if (files.length > 0 && files.some(f => !f.startsWith('.'))) {
      console.error(chalk.red(`  Directory ${dirName} is not empty. Please choose an empty directory.`));
      process.exit(1);
    }
  }

  const spinner = ora('Scaffolding project...').start();

  try {
    // Create target directory
    mkdirSync(targetDir, { recursive: true });

    // Copy init template
    cpSync(INIT_TEMPLATE, targetDir, { recursive: true });

    // Update package.json with project name
    const pkgPath = join(targetDir, 'package.json');
    if (existsSync(pkgPath)) {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
      const projectName = directory === '.' ? 'my-docs' : directory.split('/').pop();
      pkg.name = projectName;
      writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
    }

    spinner.succeed(chalk.green('Project created!'));
    console.log();
    console.log('  Next steps:');
    console.log();
    if (directory !== '.') {
      console.log(`    ${chalk.cyan('cd')} ${directory}`);
    }
    console.log(`    ${chalk.cyan('npm install')}`);
    console.log(`    ${chalk.cyan('npx docsy')}`);
    console.log();
    console.log(`  ${chalk.dim('Edit mint.json to configure your documentation.')}`);
    console.log(`  ${chalk.dim('Add MDX files to start writing docs.')}`);
    console.log();
  } catch (error) {
    spinner.fail(chalk.red('Failed to create project'));
    console.error(error);
    process.exit(1);
  }
}
