import { describe, it, expect } from 'vitest';
import { afterEach, vi } from 'vitest';

import { POST, PUT } from '../src/init-template/api/assistant';

describe('init template assistant endpoint', () => {
  const originalEnv: NodeJS.ProcessEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it('returns ranked markdown-aware response payloads for POST requests', async () => {
    const response = await POST({
      request: new Request('https://example.com/api/assistant', {
        method: 'POST',
        body: JSON.stringify({
          query: 'indexing docs',
          context: [
            { slug: 'introduction', title: 'Introduction', score: 0.9 },
            { slug: 'quickstart', title: 'Quickstart', score: 0.8 },
            { slug: 'api', title: 'API Guide', score: 0.7 },
            { slug: 'faq', title: 'FAQ', score: 0.6 },
            { slug: 'extra', title: 'Extra', score: 0.1 },
          ],
        }),
      }),
    });

    expect(response.status).toBe(200);
    const payload = await response.json();

    expect(payload.answer).toContain('I found 5 relevant docs sections for "indexing docs".');
    expect(Array.isArray(payload.sources)).toBe(true);
    expect(payload.sources).toHaveLength(4);
    expect(payload.sources[0]).toMatchObject({ slug: 'introduction', title: 'Introduction' });
  });

  it('returns an OpenAI-compatible upstream answer when environment is configured', async () => {
    process.env.DOCSY_ASSISTANT_LLM_API_KEY = 'test-openai-key';
    process.env.DOCSY_ASSISTANT_LLM_ENDPOINT = 'https://api.example.com/v1/chat/completions';

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      choices: [{ message: { content: 'Upstream answer for docs.' } }],
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }));

    const response = await POST({
      request: new Request('https://example.com/api/assistant', {
        method: 'POST',
        body: JSON.stringify({
          query: 'indexing docs',
          context: [
            { slug: 'introduction', title: 'Introduction', score: 0.9 },
          ],
        }),
      }),
    });

    expect(response.status).toBe(200);
    const payload = await response.json();

    expect(payload.answer).toBe('Upstream answer for docs.');
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(payload.sources[0]).toMatchObject({ slug: 'introduction', title: 'Introduction' });
  });

  it('handles empty context gracefully for PUT requests', async () => {
    const response = await PUT({
      request: new Request('https://example.com/api/assistant', {
        method: 'PUT',
        body: JSON.stringify({
          query: 'indexing docs',
        }),
      }),
    });

    expect(response.status).toBe(200);
    const payload = await response.json();

    expect(payload.answer).toContain('No indexed documentation context was provided.');
    expect(payload.sources).toEqual([]);
  });
});
