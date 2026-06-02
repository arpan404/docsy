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

  if (pathname.endsWith('.md') && !shouldServeMarkdown(request.headers.get('Accept'))) {
    return new Response(null, {
      status: 303,
      headers: {
        Location: canonicalMarkdownUrl(pathname),
      },
    });
  }

  const response = await next();

  if (!response) {
    return response;
  }

  const contentType = response.headers.get('content-type') || '';
  const isMarkdown = pathname.endsWith('.md') || contentType.includes('text/markdown');
  const isHtml = contentType.includes('text/html');
  const isLlmsRoute = pathname === '/llms.txt' || pathname === '/llms-full.txt'
    || pathname === '/.well-known/llms.txt' || pathname === '/.well-known/llms-full.txt';

  if (isMarkdown || isHtml || isLlmsRoute) {
    appendLlmsHeaders(response.headers);
  }

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
