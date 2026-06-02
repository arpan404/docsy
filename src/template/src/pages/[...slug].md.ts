import { getCollection, type CollectionEntry } from 'astro:content';
import { entryToMarkdown } from '../utils/markdown-export';

type DocsEntry = CollectionEntry<'docs'>;

export async function getStaticPaths() {
  const docs = await getCollection('docs');
  return docs.map((entry: DocsEntry) => ({
    params: { slug: entry.id },
    props: { entry },
  }));
}

export function GET({ props }: { props: { entry: DocsEntry } }) {
  return new Response(entryToMarkdown(props.entry), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
}
