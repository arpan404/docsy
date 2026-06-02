import { getCollection, type CollectionEntry } from 'astro:content';
import config from 'virtual:docsy/config';
import navigation from 'virtual:docsy/navigation';
import { buildLlmsTxt } from '../utils/markdown-export';

type DocsEntry = CollectionEntry<'docs'>;

export async function GET() {
  const docs = await getCollection('docs');
  const orderedSlugs = (navigation.flatItems || []).map((item: { slug: string }) => item.slug);

  return new Response(buildLlmsTxt({
    siteName: config.name,
    description: config.description,
    entries: docs as DocsEntry[],
    orderedSlugs,
    baseUrl: config.site || config.url,
  }), {
    headers: {
      Link: '</llms.txt>; rel="llms-txt", </llms-full.txt>; rel="llms-full-txt"',
      'X-Llms-Txt': '/llms.txt',
      Vary: 'Accept',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
