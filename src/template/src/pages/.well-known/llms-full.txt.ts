import { getCollection } from 'astro:content';
import config from 'virtual:docsy/config';
import navigation from 'virtual:docsy/navigation';
import { buildLlmsFullTxt } from '../../utils/markdown-export';

export async function GET() {
  const entries = await getCollection('docs');
  const body = buildLlmsFullTxt({
    siteName: config.name,
    description: config.description,
    entries,
    orderedSlugs: navigation.flatItems?.map((item: { slug: string }) => item.slug),
  });

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
