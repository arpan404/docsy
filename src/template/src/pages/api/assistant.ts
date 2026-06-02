export async function POST({ request }: { request: Request }) {
  const body = await request.json().catch(() => ({}));
  const query = typeof body?.query === 'string' ? body.query : '';
  const context = Array.isArray(body?.context) ? body.context : [];

  const summary = context.length === 0
    ? 'No indexed documentation context was provided.'
    : `I found ${context.length} relevant docs sections for "${query}".`;

  return new Response(
    JSON.stringify({
      answer: `${summary} Ask for another topic and I can search the docs again.`,
      sources: context.slice(0, 4).map((entry: { slug: string; title: string }) => ({
        slug: entry.slug,
        title: entry.title,
      })),
    }),
    {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    },
  );
}

export const PUT = POST;
