import { describe, expect, it, vi, beforeAll } from 'vitest';
import { canonicalMarkdownUrl, shouldServeMarkdown } from '../src/template/src/utils/content-negotiation';

vi.mock('astro:content', () => ({
  getCollection: vi.fn(),
}));

type DocsEntry = {
  id: string;
  data: { title?: string };
  body: string;
  collection: 'docs';
};

let GET: ({ request, props }: { request: Request; props: { entry: DocsEntry } }) => Response;

beforeAll(async () => {
  ({ GET } = await import('../src/template/src/pages/[...slug].md'));
});

describe('content negotiation helpers', () => {
  it('defaults to markdown when Accept is missing or empty', () => {
    expect(shouldServeMarkdown(undefined)).toBe(true);
    expect(shouldServeMarkdown('')).toBe(true);
  });

  it('returns markdown for markdown/plain media types', () => {
    expect(shouldServeMarkdown('text/markdown, text/html')).toBe(true);
    expect(shouldServeMarkdown('text/plain; q=0.9')).toBe(true);
    expect(shouldServeMarkdown('application/x-markdown')).toBe(true);
  });

  it('prefers HTML when HTML is the best-quality media type', () => {
    expect(shouldServeMarkdown('text/html; q=1, text/plain; q=0.5')).toBe(false);
    expect(shouldServeMarkdown('text/plain; q=0.4, text/html; q=0.9')).toBe(false);
  });

  it('maps markdown slugs to canonical HTML URLs', () => {
    expect(canonicalMarkdownUrl('introduction')).toBe('/introduction');
    expect(canonicalMarkdownUrl('library/quickstart')).toBe('/library/quickstart');
    expect(canonicalMarkdownUrl('index')).toBe('/');
    expect(canonicalMarkdownUrl('/index')).toBe('/');
  });

  it('returns a markdown response for markdown-oriented Accept headers', async () => {
    const entry = {
      id: 'introduction',
      data: { title: 'Introduction' },
      body: '# Introduction\n',
      collection: 'docs' as const,
    } satisfies DocsEntry;

    const response = await GET({
      request: new Request('https://example.com/introduction.md', {
        headers: { Accept: 'text/markdown' },
      }),
      props: { entry },
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('text/markdown');
  });

  it('redirects to HTML when HTML is the best requested type', async () => {
    const entry = {
      id: 'introduction',
      data: { title: 'Introduction' },
      body: '# Introduction\n',
      collection: 'docs' as const,
    } satisfies DocsEntry;

    const response = await GET({
      request: new Request('https://example.com/introduction.md', {
        headers: { Accept: 'text/html;q=0.9, text/plain;q=0.5' },
      }),
      props: { entry },
    });

    expect(response.status).toBe(303);
    expect(response.headers.get('Location')).toBe(canonicalMarkdownUrl('introduction'));
  });
});
