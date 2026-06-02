export interface AcceptedMedia {
  mediaType: string;
  quality: number;
  index: number;
}

const MARKDOWN_MEDIA_TYPES = new Set([
  'text/markdown',
  'text/x-markdown',
  'application/markdown',
  'application/x-markdown',
  'text/plain',
]);

const HTML_MEDIA_TYPES = new Set([
  'text/html',
  'application/xhtml+xml',
]);

export function canonicalMarkdownUrl(slug: string): string {
  const cleanSlug = slug.replace(/^\/+|\/+$/g, '');
  if (!cleanSlug || cleanSlug === 'index') {
    return '/';
  }
  return `/${cleanSlug}`;
}

export function shouldServeMarkdown(acceptHeader: string | null | undefined): boolean {
  const accept = typeof acceptHeader === 'string' ? acceptHeader.trim() : '';
  if (!accept) {
    return true;
  }

  const entries = parseAcceptHeader(accept);
  const sortedByQuality = [...entries].sort((a, b) => {
    if (b.quality !== a.quality) return b.quality - a.quality;
    return a.index - b.index;
  });

  for (const entry of sortedByQuality) {
    const mediaType = entry.mediaType.toLowerCase();
    if (MARKDOWN_MEDIA_TYPES.has(mediaType) || mediaType === '*/*') {
      return true;
    }
    if (HTML_MEDIA_TYPES.has(mediaType)) {
      return false;
    }
  }

  return true;
}

export function parseAcceptHeader(acceptHeader: string): AcceptedMedia[] {
  return acceptHeader
    .split(',')
    .map((part) => part.trim())
    .map((part, index) => {
      const [type, ...params] = part.split(';').map((chunk) => chunk.trim());
      if (!type) {
        return null;
      }

      let quality = 1;
      for (const param of params) {
        if (param.startsWith('q=')) {
          const raw = Number.parseFloat(param.slice(2));
          if (!Number.isNaN(raw)) {
            quality = raw;
          }
        }
      }

      return { mediaType: type.toLowerCase(), quality, index };
    })
    .filter((entry): entry is AcceptedMedia => entry !== null);
}
