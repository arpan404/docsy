import { getCollection } from 'astro:content';
import config from 'virtual:docsy/config';
import navigation from 'virtual:docsy/navigation';
import { buildLlmsTxt } from '../../utils/markdown-export';

export async function GET() {
  const entries = await getCollection('docs');
  const body = buildLlmsTxt({
    siteName: config.name,
    description: config.description,
    entries,
    orderedSlugs: navigation.flatItems?.map((item: { slug: string }) => item.slug),
    baseUrl: config.site || config.url,
  });

  return new Response(body, {
    headers: {
      Link: '</llms.txt>; rel="llms-txt", </llms-full.txt>; rel="llms-full-txt"',
      'X-Llms-Txt': '/llms.txt',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
