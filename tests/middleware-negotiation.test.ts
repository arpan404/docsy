import { describe, expect, it } from 'vitest';
import { onRequest } from '../src/template/src/middleware';

describe('middleware content negotiation and LLMS headers', () => {
  it('redirects .md requests when HTML is preferred', async () => {
    const response = await onRequest(
      {
        request: new Request('https://example.com/docs/introduction.md', {
          headers: { Accept: 'text/html, text/plain; q=0.8' },
        }),
      },
      async () => new Response('not-used'),
    );

    expect(response.status).toBe(303);
    expect(response.headers.get('Location')).toBe('/docs/introduction');
  });

  it('adds LLMS headers to HTML responses', async () => {
    const response = await onRequest(
      {
        request: new Request('https://example.com/introduction'),
      },
      async () => new Response('<html />', {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      }),
    );

    expect(response.headers.get('Link')).toContain('rel="llms-txt"');
    expect(response.headers.get('X-Llms-Txt')).toBe('/llms.txt');
  });

  it('adds LLMS headers to markdown responses', async () => {
    const response = await onRequest(
      {
        request: new Request('https://example.com/introduction.md'),
      },
      async () => new Response('hello', {
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
        },
      }),
    );

    expect(response.headers.get('Link')).toContain('rel="llms-txt"');
    expect(response.headers.get('X-Llms-Txt')).toBe('/llms.txt');
  });

  it('adds LLMS headers to .well-known routes', async () => {
    const response = await onRequest(
      {
        request: new Request('https://example.com/.well-known/llms.txt'),
      },
      async () => new Response('ok', {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
        },
      }),
    );

    expect(response.headers.get('Link')).toContain('rel="llms-txt"');
    expect(response.headers.get('X-Llms-Txt')).toBe('/llms.txt');
  });
});
