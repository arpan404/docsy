import type { CollectionEntry } from 'astro:content';

type DocsEntry = CollectionEntry<'docs'>;

export function entryToMarkdown(entry: DocsEntry): string {
  const title = typeof entry.data.title === 'string' ? entry.data.title : titleFromSlug(entry.id);
  const description = typeof entry.data.description === 'string' ? entry.data.description : '';
  const body = cleanMdxForMarkdown((entry as any).body || '');
  const lines: string[] = [];

  if (!startsWithHeading(body)) {
    lines.push(`# ${title}`);
    if (description) {
      lines.push('', `> ${description}`);
    }
    lines.push('');
  }

  lines.push(body);

  return `${lines.join('\n').replace(/\n{3,}/g, '\n\n').trim()}\n`;
}

export function buildLlmsTxt(options: {
  siteName: string;
  description?: string;
  entries: DocsEntry[];
  orderedSlugs?: string[];
  baseUrl?: string;
}): string {
  const entries = orderEntries(options.entries, options.orderedSlugs);
  const lines = [`# ${options.siteName}`];

  if (options.description) {
    lines.push('', `> ${oneLine(options.description)}`);
  }

  lines.push('', '## Docs');
  for (const entry of entries) {
    const title = typeof entry.data.title === 'string' ? entry.data.title : titleFromSlug(entry.id);
    const description = summarizeDescription(entry);
    const url = pageMarkdownUrl(entry.id, options.baseUrl);
    lines.push(`- [${title}](${url})${description ? `: ${description}` : ''}`);
  }

  return `${lines.join('\n')}\n`;
}

export function buildLlmsFullTxt(options: {
  siteName: string;
  description?: string;
  entries: DocsEntry[];
  orderedSlugs?: string[];
}): string {
  const entries = orderEntries(options.entries, options.orderedSlugs);
  const lines = [`# ${options.siteName}`];

  if (options.description) {
    lines.push('', `> ${oneLine(options.description)}`);
  }

  for (const entry of entries) {
    lines.push('', '---', '', entryToMarkdown(entry).trim());
  }

  return `${lines.join('\n')}\n`;
}

export function pageMarkdownUrl(slug: string, baseUrl?: string): string {
  const path = `/${slug.replace(/^\/+|\/+$/g, '')}.md`;
  if (!baseUrl) return path;
  return `${baseUrl.replace(/\/$/, '')}${path}`;
}

function orderEntries(entries: DocsEntry[], orderedSlugs: string[] = []): DocsEntry[] {
  const byId = new Map(entries.map((entry) => [entry.id, entry]));
  const seen = new Set<string>();
  const ordered: DocsEntry[] = [];

  for (const slug of orderedSlugs) {
    const entry = byId.get(slug);
    if (entry) {
      ordered.push(entry);
      seen.add(entry.id);
    }
  }

  const remaining = entries
    .filter((entry) => !seen.has(entry.id))
    .sort((a, b) => a.id.localeCompare(b.id));

  return [...ordered, ...remaining];
}

function cleanMdxForMarkdown(content: string): string {
  return content
    .replace(/^import\s.+$/gm, '')
    .replace(/^export\s.+$/gm, '')
    .replace(/<Visibility\s+for=["']humans["'][^>]*>[\s\S]*?<\/Visibility>/g, '')
    .replace(/<\/?Visibility[^>]*>/g, '')
    .trim();
}

function startsWithHeading(content: string): boolean {
  return /^#\s+/.test(content.trimStart());
}

function summarizeDescription(entry: DocsEntry): string {
  const description = typeof entry.data.description === 'string' ? entry.data.description : '';
  const api = typeof entry.data.api === 'string' ? entry.data.api : '';
  const openapi = typeof entry.data.openapi === 'string' ? entry.data.openapi : '';
  const pieces = [description, api ? `API: ${api}` : '', openapi ? `OpenAPI: ${openapi}` : ''].filter(Boolean);
  return truncate(oneLine(pieces.join(' ')), 300);
}

function oneLine(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value;
}

function titleFromSlug(slug: string): string {
  const name = slug.split('/').pop() || slug;
  return name
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
