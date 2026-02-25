export interface SearchEntry {
  slug: string;
  title: string;
  description: string;
  headings: string[];
  content: string;
}

export interface SearchIndex {
  entries: SearchEntry[];
}

/**
 * Build a search index from the navigation flat items.
 * At build time, this is serialized as JSON and injected as a virtual module.
 * The actual content indexing happens client-side from the rendered pages,
 * but we provide the structure from navigation so search knows about all pages.
 */
export function buildSearchIndex(flatItems: { slug: string; title: string; group: string }[]): SearchIndex {
  return {
    entries: flatItems.map((item) => ({
      slug: item.slug,
      title: item.title,
      description: '',
      headings: [],
      content: '',
    })),
  };
}

/**
 * Simple client-side search scoring.
 * Returns results sorted by relevance score (highest first).
 */
export function searchEntries(
  query: string,
  entries: SearchEntry[]
): { entry: SearchEntry; score: number }[] {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  const results: { entry: SearchEntry; score: number }[] = [];

  for (const entry of entries) {
    let score = 0;
    const titleLower = entry.title.toLowerCase();
    const descLower = entry.description.toLowerCase();
    const contentLower = entry.content.toLowerCase();
    const headingsJoined = entry.headings.join(' ').toLowerCase();

    for (const term of terms) {
      // Title match (highest weight)
      if (titleLower.includes(term)) {
        score += titleLower === term ? 100 : 50;
      }
      // Heading match
      if (headingsJoined.includes(term)) {
        score += 30;
      }
      // Description match
      if (descLower.includes(term)) {
        score += 20;
      }
      // Content match
      if (contentLower.includes(term)) {
        score += 10;
      }
      // Slug match
      if (entry.slug.toLowerCase().includes(term)) {
        score += 15;
      }
    }

    if (score > 0) {
      results.push({ entry, score });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}
