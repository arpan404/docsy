import { getCollection, type CollectionEntry } from 'astro:content';
import { entryToMarkdown } from '../utils/markdown-export';
import { canonicalMarkdownUrl, shouldServeMarkdown } from '../utils/content-negotiation';

type DocsEntry = CollectionEntry<'docs'>;

export async function getStaticPaths() {
  const docs = await getCollection('docs');
  return docs.map((entry: DocsEntry) => ({
    params: { slug: entry.id },
    props: { entry },
  }));
}

export function GET({
  request,
  props,
}: {
  request?: Request;
  props: { entry: DocsEntry };
}) {
  if (request && !shouldServeMarkdown(request.headers.get('Accept'))) {
    return new Response(null, {
      status: 303,
      headers: {
        Location: canonicalMarkdownUrl(props.entry.id),
        Vary: 'Accept',
      },
    });
  }

  return new Response(entryToMarkdown(props.entry), {
    headers: {
      Vary: 'Accept',
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
}
