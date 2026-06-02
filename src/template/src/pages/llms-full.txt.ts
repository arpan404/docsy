import { getCollection, type CollectionEntry } from 'astro:content';
import config from 'virtual:docsy/config';
import navigation from 'virtual:docsy/navigation';
import { buildLlmsFullTxt } from '../utils/markdown-export';

type DocsEntry = CollectionEntry<'docs'>;

export async function GET() {
  const docs = await getCollection('docs');
  const orderedSlugs = (navigation.flatItems || []).map((item: { slug: string }) => item.slug);

  return new Response(buildLlmsFullTxt({
    siteName: config.name,
    description: config.description,
    entries: docs as DocsEntry[],
    orderedSlugs,
  }), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
