# Docsy

Docsy is an open-source documentation framework built on Astro. It is designed as a Mintlify-compatible alternative for teams that want to keep their documentation stack inspectable, portable, and self-hostable.

## Status

Docsy targets drop-in compatibility with Mintlify-style projects:

- Configuration files: `mint.json`, `docs.json`, `docsy.json`, and `docsy.config.json`
- Markdown and MDX content through Astro content collections
- Mintlify-style navigation groups, pages, tabs, anchors, versions, topbar links, topbar CTA, footer socials, redirects, SEO metadata, and indexing
- A large Mintlify component surface, including aliases such as `Columns` and `ParamField`
- OpenAPI docs with endpoint resolution, multiple specs, API playground defaults, playground display modes, and language examples
- Search, i18n navigation, built-in UI translations, and navigation-backed search indexing
- Analytics provider configuration through Mintlify `integrations` or Docsy `analytics`
- Page feedback, contextual menu actions, a local or bring-your-own assistant, and AI-readable exports

The detailed compatibility status is tracked in [PARITY_MATRIX.md](./PARITY_MATRIX.md).

## Quickstart

```bash
npm install
npm run build
npx docsy init ./docs
cd docs
npx docsy dev
```

Build the static site with:

```bash
npx docsy build
```

During local development in this repository, use:

```bash
npm run build
npm test -- --run
```

## Mintlify Compatibility

Docsy reads Mintlify-style config and normalizes common field differences into its internal schema. For example, modern `docs.json` navigation objects with `groups`, `pages`, `tabs`, `anchors`, and `versions` are normalized into Docsy navigation; `url` values on tabs, anchors, topbar links, and CTA buttons are normalized to `href`; root-level `openapi` is mapped into `api.openapi`; and Mintlify `integrations` analytics keys are mapped into Docsy analytics providers.

Supported documentation features include:

- Recursive navigation groups, root pages, dropdowns, grouped tabs, versioned navigation with a selector dropdown and tags, anchors, and language-specific navigation overrides
- Markdown/MDX pages and API reference pages from OpenAPI `operationId`, `method path`, or path matching
- API playground request forms seeded from path, query, header, and body schema defaults
- Theme colors, fonts, logos, favicon, appearance mode, banner, footer columns, and social links
- Redirects, sitemap-ready static output, OpenGraph/Twitter metadata, and custom SEO metatags
- Analytics snippets and `docs.*` interaction events for navigation, search, feedback, contextual menu, assistant, code copy, API playground, accordions, and expandables
- Per-page markdown exports at `/{slug}.md`, `/llms.txt`, `/llms-full.txt`, and `.well-known` LLM aliases

## Components

Docsy exports Mintlify-style MDX components from `docsy/components`. The implemented surface covers the common docs building blocks and aliases used by Mintlify projects, including cards, columns, callouts, accordions, code snippets, parameter fields, API fields, frames, steps, tabs, expandable sections, panels, prompts, views, tiles, color swatches, request/response examples, Mermaid diagrams, and `Visibility`.

Core component behavior is validated with rendered fixture coverage for broad Mintlify use-cases. Remaining differences are documented below, where applicable.

## Assistant and AI Exports

Docsy includes a local assistant panel that searches the generated docs index, fetches per-page markdown, cites source pages, supports suggested questions, and can hand off to a configured API endpoint. The API handoff can be a simple string endpoint or an object with endpoint, method, public headers, timeout, and RAG context limits. A starter `/api/assistant` handler is included in both the init template and runtime template output.

The endpoint supports an optional OpenAI-compatible upstream model call when these environment variables are set:

- `DOCSY_ASSISTANT_LLM_API_KEY` (or `OPENAI_API_KEY`)
- `DOCSY_ASSISTANT_LLM_ENDPOINT` (defaults to `https://api.openai.com/v1/chat/completions`)
- `DOCSY_ASSISTANT_LLM_MODEL` (defaults to `gpt-4o-mini`)
- `DOCSY_ASSISTANT_LLM_TIMEOUT_MS`

If no upstream credentials are available, the endpoint returns a deterministic local answer based on the ranked context.

AI-readable routes are generated statically:

- `/{slug}.md`
- `/llms.txt`
- `/llms-full.txt`
- `/.well-known/llms.txt`
- `/.well-known/llms-full.txt`
- `/assistant-context.json`

For server-side RAG, point `assistant.api` at your own endpoint and ingest `/assistant-context.json`, `/llms.txt`, `/llms-full.txt`, or the per-page `.md` routes. The browser posts a JSON payload containing `query`, `path`, `url`, `title`, `contextRoute`, and a ranked `context` array with `slug`, `title`, `description`, `headings`, `score`, `excerpt`, `markdownUrl`, and optional `markdown`.

## Known Differences

These differences are explicit and expected until the parity matrix says otherwise:

- Fixture coverage: real-world Mintlify compatibility tests use a sampled corpus, not every public Mintlify project.
- Static hosting note: when running without middleware, header-based `.md` negotiation uses `_redirects` on Netlify-compatible hosts, and Vercel equivalent rewrites are provided in `public/vercel.json`. LLMS discovery headers are also included via `public/_headers` and `public/vercel.json`.

## Quality Gates

The compatibility suite covers config normalization, navigation, i18n, search, analytics snippets and events, rendered HTML snapshots, real-world fixture builds, OpenAPI/API playground behavior, and packaging correctness.

Run the full check locally with:

```bash
npx tsc --noEmit
npm test -- --run
npm run build
```
