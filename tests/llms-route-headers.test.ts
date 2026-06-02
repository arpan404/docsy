import { describe, expect, it, vi, beforeAll } from 'vitest';

vi.mock('astro:content', () => ({
  getCollection: vi.fn(() => Promise.resolve([])),
}));
vi.mock('virtual:docsy/config', () => ({
  default: {
    name: 'Docs',
    description: 'Docs fixture',
    site: 'https://example.com',
  },
}));
vi.mock('virtual:docsy/navigation', () => ({
  default: { flatItems: [{ slug: 'index' }, { slug: 'guide' }] },
}));

type GetAllHandler = () => Promise<Response>;

let getLlms: GetAllHandler;
let getLlmsFull: GetAllHandler;
let getWellKnownLlms: GetAllHandler;
let getWellKnownLlmsFull: GetAllHandler;

beforeAll(async () => {
  ({ GET: getLlms } = (await import('../src/template/src/pages/llms.txt')) as { GET: GetAllHandler });
  ({ GET: getLlmsFull } = (await import('../src/template/src/pages/llms-full.txt')) as { GET: GetAllHandler });
  ({ GET: getWellKnownLlms } = (await import('../src/template/src/pages/.well-known/llms.txt')) as { GET: GetAllHandler });
  ({ GET: getWellKnownLlmsFull } = (await import('../src/template/src/pages/.well-known/llms-full.txt')) as { GET: GetAllHandler });
});

describe('LLMs discovery routes', () => {
  it('adds discovery headers on /llms.txt', async () => {
    const response = await getLlms();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('text/plain');
    expect(response.headers.get('Link')).toBe('</llms.txt>; rel="llms-txt", </llms-full.txt>; rel="llms-full-txt"');
    expect(response.headers.get('X-Llms-Txt')).toBe('/llms.txt');
  });

  it('adds discovery headers on /llms-full.txt', async () => {
    const response = await getLlmsFull();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('text/plain');
    expect(response.headers.get('Link')).toBe('</llms.txt>; rel="llms-txt", </llms-full.txt>; rel="llms-full-txt"');
    expect(response.headers.get('X-Llms-Txt')).toBe('/llms.txt');
  });

  it('adds discovery headers on /.well-known/llms.txt', async () => {
    const response = await getWellKnownLlms();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('text/plain');
    expect(response.headers.get('Link')).toBe('</llms.txt>; rel="llms-txt", </llms-full.txt>; rel="llms-full-txt"');
    expect(response.headers.get('X-Llms-Txt')).toBe('/llms.txt');
  });

  it('adds discovery headers on /.well-known/llms-full.txt', async () => {
    const response = await getWellKnownLlmsFull();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('text/plain');
    expect(response.headers.get('Link')).toBe('</llms.txt>; rel="llms-txt", </llms-full.txt>; rel="llms-full-txt"');
    expect(response.headers.get('X-Llms-Txt')).toBe('/llms.txt');
  });
});
