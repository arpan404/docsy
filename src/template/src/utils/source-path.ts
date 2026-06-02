import { existsSync } from 'fs';
import { resolve, relative } from 'path';

const DOCS_BASE_CANDIDATES = [
  'docs',
  'src/content/docs',
  'src/docs',
];

function toPosixPath(value: string): string {
  return value.replace(/\\/g, '/');
}

export function resolveSourcePath(userDir: string, slug: string): string {
  const cleanSlug = slug.replace(/^\/+|\/+$/g, '');
  const fileCandidates = [
    `${cleanSlug}.mdx`,
    `${cleanSlug}.md`,
    `${cleanSlug}/index.mdx`,
    `${cleanSlug}/index.md`,
  ];

  for (const base of DOCS_BASE_CANDIDATES) {
    const baseDir = resolve(userDir, base);
    for (const candidate of fileCandidates) {
      const absolutePath = resolve(baseDir, candidate);
      if (existsSync(absolutePath)) {
        return toPosixPath(relative(userDir, absolutePath));
      }
    }
  }

  return toPosixPath(`docs/${cleanSlug || 'index'}.mdx`);
}
