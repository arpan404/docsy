type AssistantContextItem = {
  slug?: unknown;
  title?: unknown;
  description?: unknown;
  headings?: unknown;
  score?: unknown;
  excerpt?: unknown;
  markdownUrl?: unknown;
  markdown?: unknown;
};

type AssistantPayload = {
  query?: unknown;
  context?: unknown;
};

const LLM_ANSWER_SOURCE_LIMIT = 4;
const OPENAI_COMPATIBLE_ENDPOINT = process.env.DOCSY_ASSISTANT_LLM_ENDPOINT
  || 'https://api.openai.com/v1/chat/completions';
const OPENAI_COMPATIBLE_MODEL = process.env.DOCSY_ASSISTANT_LLM_MODEL || 'gpt-4o-mini';
const OPENAI_COMPATIBLE_API_KEY = process.env.DOCSY_ASSISTANT_LLM_API_KEY
  || process.env.OPENAI_API_KEY
  || '';
const OPENAI_REQUEST_TIMEOUT_MS = toInt(process.env.DOCSY_ASSISTANT_LLM_TIMEOUT_MS);

export async function POST({ request }: { request: Request }) {
  const body = (await request.json().catch(() => ({}))) as AssistantPayload;
  const query = typeof body.query === 'string' ? body.query.trim() : '';
  const context = normalizeContext(Array.isArray(body.context) ? body.context : []);

  const providerAnswer = await askAssistantProvider({
    query,
    context,
  });

  if (providerAnswer) {
    return jsonResponse({
      answer: providerAnswer,
      sources: context.slice(0, LLM_ANSWER_SOURCE_LIMIT).map(toSource),
    });
  }

  const localAnswer = buildFallbackAnswer(query, context);
  return jsonResponse({
    answer: localAnswer,
    sources: context.slice(0, LLM_ANSWER_SOURCE_LIMIT).map(toSource),
  });
}

function jsonResponse(payload: { answer: string; sources: Array<{ slug: string; title: string; } | undefined> }) {
  return new Response(JSON.stringify(payload), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}

function toSource(item: AssistantContextItem): { slug: string; title: string } {
  const slug = typeof item.slug === 'string' ? item.slug : '';
  const title = typeof item.title === 'string' ? item.title : '';
  return { slug, title };
}

function normalizeContext(items: unknown[]): AssistantContextItem[] {
  const normalized: AssistantContextItem[] = [];
  for (const item of items) {
    if (!item || typeof item !== 'object') continue;
    normalized.push(item as AssistantContextItem);
  }
  return normalized;
}

function buildFallbackAnswer(query: string, context: AssistantContextItem[]): string {
  if (!query) {
    return 'I could not find enough information in these docs to answer that.';
  }
  if (context.length === 0) {
    return 'No indexed documentation context was provided.';
  }
  return `I found ${context.length} relevant docs sections for "${query}".`;
}

async function askAssistantProvider(input: {
  query: string;
  context: AssistantContextItem[];
}): Promise<string | null> {
  if (!OPENAI_COMPATIBLE_API_KEY && !canCallWithoutAuth()) {
    return null;
  }
  if (!input.query) return null;

  if (!OPENAI_COMPATIBLE_ENDPOINT) return null;

  const summaryLines = input.context
    .slice(0, 8)
    .map((entry, index) => {
      const heading = `#${index + 1} ${toSource(entry).slug || 'untitled'} — ${toSource(entry).title || 'Untitled'}`;
      const excerpt = typeof entry.excerpt === 'string' ? entry.excerpt : '';
      const snippet = typeof entry.markdown === 'string' ? entry.markdown : '';
      return [heading, excerpt, snippet ? `snippet: ${snippet.slice(0, 500)}` : '']
        .filter(Boolean)
        .join('\n');
    })
    .join('\n\n');

  const userPrompt = `Answer the user query using only the docs context below.
For sources, cite by section slug where possible and mention only what is in the context.

Query: ${input.query || '(empty)'}

Context:
${summaryLines || 'No context entries.'}
`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (OPENAI_COMPATIBLE_API_KEY) {
    headers.Authorization = `Bearer ${OPENAI_COMPATIBLE_API_KEY}`;
  }

  try {
    const response = await fetchWithTimeout(
      OPENAI_COMPATIBLE_ENDPOINT,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: OPENAI_COMPATIBLE_MODEL,
          messages: [
            {
              role: 'system',
              content: 'You are a concise technical documentation assistant.',
            },
            {
              role: 'user',
              content: userPrompt,
            },
          ],
        }),
      },
      OPENAI_REQUEST_TIMEOUT_MS,
    );

    if (!response.ok) return null;
    const payload = await response.json().catch(() => null) as Record<string, unknown> | null;
    if (!payload) return null;

    const openAiAnswer = (
      payload.choices as Array<{ message?: { content?: unknown } }>
    )?.[0]?.message?.content;
    if (typeof openAiAnswer === 'string' && openAiAnswer.trim()) {
      return openAiAnswer.trim();
    }

    const directAnswer = payload.answer;
    if (typeof directAnswer === 'string' && directAnswer.trim()) {
      return directAnswer.trim();
    }
  } catch {
    // ignore provider failures and degrade to local answer
  }

  return null;
}

function canCallWithoutAuth(): boolean {
  return OPENAI_COMPATIBLE_ENDPOINT.includes('/v1/chat/completions');
}

async function fetchWithTimeout(input: string, init: RequestInit, timeoutMs?: number): Promise<Response> {
  if (!timeoutMs) return fetch(input, init);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

function toInt(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export const PUT = POST;
