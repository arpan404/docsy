import { describe, it, expect } from 'vitest';
import { mapRedirectsForAstro } from '../src/cli/astro-bootstrap';

describe('mapRedirectsForAstro', () => {
  it('returns empty map when no redirects are configured', () => {
    expect(mapRedirectsForAstro({})).toEqual({});
  });

  it('maps temporary redirects to 302 objects', () => {
    const result = mapRedirectsForAstro({
      redirects: [
        { source: '/old', destination: '/new', permanent: false },
      ],
    });

    expect(result).toEqual({
      '/old': { destination: '/new', status: 302 },
    });
  });

  it('maps permanent redirects to 301 objects', () => {
    const result = mapRedirectsForAstro({
      redirects: [
        { source: '/old', destination: '/new', permanent: true },
      ],
    });

    expect(result).toEqual({
      '/old': { destination: '/new', status: 301 },
    });
  });
});
