import { canonicalMarkdownUrl, shouldServeMarkdown } from './utils/content-negotiation';

/**
 * Route-level middleware for runtime deployments.
 *
 * - Enforces Accept-based behavior for `.md` routes: redirects to canonical HTML
 *   when HTML is the preferred media type.
 * - Adds LLMS discovery headers to rendered pages and markdown responses.
 */
export async function onRequest(
  context: { request: Request },
  next: () => Promise<Response>,
) {
  const request = context.request;
  const { pathname } = new URL(request.url);
  const shouldRedirectToHtml = pathname.endsWith('.md') && !shouldServeMarkdown(request.headers.get('Accept'));

  if (shouldRedirectToHtml) {
    const headers = new Headers({
      Location: canonicalMarkdownUrl(pathname),
    });

    appendLlmsHeaders(headers);
    headers.append('Vary', 'Accept');

    return new Response(null, {
      status: 303,
      headers,
    });
  }

  const response = await next();

  if (!response) {
    return response;
  }

  const isLlmsRoute = pathname === '/llms.txt' || pathname === '/llms-full.txt'
    || pathname === '/.well-known/llms.txt' || pathname === '/.well-known/llms-full.txt';

  if (isLlmsRoute || (!isStaticAssetPath(pathname) && !pathname.startsWith('/api/'))) {
    appendLlmsHeaders(response.headers);
  }

  maybeAppendVaryAccept(response.headers);

  return response;
}

function appendLlmsHeaders(headers: Headers): void {
  const linkValue = '</llms.txt>; rel="llms-txt", </llms-full.txt>; rel="llms-full-txt"';

  if (!headers.has('Link')) {
    headers.set('Link', linkValue);
  } else {
    const existing = headers.get('Link') || '';
    if (!existing.includes('llms-txt')) {
      headers.set('Link', `${existing}, ${linkValue}`);
    }
  }

  if (!headers.has('X-Llms-Txt')) {
    headers.set('X-Llms-Txt', '/llms.txt');
  }
}

function isStaticAssetPath(pathname: string): boolean {
  return pathname.startsWith('/_astro/')
    || pathname.startsWith('/api/')
    || pathname.endsWith('.js')
    || pathname.endsWith('.css')
    || pathname.endsWith('.mjs')
    || pathname.endsWith('.png')
    || pathname.endsWith('.jpg')
    || pathname.endsWith('.jpeg')
    || pathname.endsWith('.gif')
    || pathname.endsWith('.svg')
    || pathname.endsWith('.ico')
    || pathname.endsWith('.txt')
    || pathname.endsWith('.webmanifest')
    || pathname.endsWith('.xml')
    || pathname.endsWith('.json');
}

function maybeAppendVaryAccept(headers: Headers): void {
  const existing = headers.get('Vary');
  if (!existing) {
    headers.set('Vary', 'Accept');
    return;
  }

  const tokens = existing.split(',').map((part) => part.trim().toLowerCase());
  if (!tokens.includes('accept')) {
    headers.set('Vary', `${existing}, Accept`);
  }
}
