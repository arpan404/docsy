import { getCollection, type CollectionEntry } from 'astro:content';
import config from 'virtual:docsy/config';
import navigation from 'virtual:docsy/navigation';
import { entryToMarkdown, pageMarkdownUrl } from '../utils/markdown-export';

type DocsEntry = CollectionEntry<'docs'>;

export async function GET() {
  const docs = await getCollection('docs');
  const orderedSlugs = Array.isArray((navigation as any).flat)
    ? (navigation as any).flat.map((item: { slug?: string }) => item.slug).filter(Boolean)
    : [];
  const orderedDocs = orderDocs(docs as DocsEntry[], orderedSlugs);

  return new Response(JSON.stringify({
    name: config.name || 'Documentation',
    description: config.description || '',
    generatedAt: new Date().toISOString(),
    routes: {
      llms: '/llms.txt',
      llmsFull: '/llms-full.txt',
    },
    pages: orderedDocs.map((entry) => ({
      slug: entry.id,
      title: typeof entry.data.title === 'string' ? entry.data.title : titleFromSlug(entry.id),
      description: typeof entry.data.description === 'string' ? entry.data.description : '',
      api: typeof entry.data.api === 'string' ? entry.data.api : undefined,
      openapi: typeof entry.data.openapi === 'string' ? entry.data.openapi : undefined,
      markdownUrl: pageMarkdownUrl(entry.id),
      markdown: entryToMarkdown(entry).trim(),
    })),
  }, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
}

function orderDocs(entries: DocsEntry[], orderedSlugs: string[]): DocsEntry[] {
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

  return [
    ...ordered,
    ...entries.filter((entry) => !seen.has(entry.id)).sort((a, b) => a.id.localeCompare(b.id)),
  ];
}

function titleFromSlug(slug: string): string {
  const name = slug.split('/').pop() || slug;
  return name
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
