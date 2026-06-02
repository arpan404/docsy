# Docsy vs Mintlify Parity Matrix (Phase 3)

This matrix tracks compatibility status for Docsy as an open-source Mintlify alternative.

## Legend

- ✅ Full: Implemented and validated in runtime/tests
- 🟡 Partial: Implemented but not complete parity with Mintlify behavior
- ❌ Missing: Not implemented yet

## CLI & Project Lifecycle

| Capability | Status | Notes |
|---|---|---|
| `npx docsy` default dev server | ✅ Full | Implemented via `docsy dev` default command |
| `docsy build` production build | ✅ Full | Generates Astro-based output using tsup + Astro build |
| `docsy init` starter scaffold | ✅ Full | Creates Mintlify-like docs scaffold with `mint.json` |
| Vercel deploy readiness | ✅ Full | Static Astro output and Vercel dependency support |

## Config Compatibility (`mint.json` / `docs.json`)

| Capability | Status | Notes |
|---|---|---|
| Core fields (`name`, `theme`, `description`) | ✅ Full | Parsed and used in layout/nav |
| Navigation groups/pages | ✅ Full | Sidebar + flat nav generated |
| Modern `navigation.groups` / `navigation.pages` object | ✅ Full | Normalized from current `docs.json` object shape into sidebar groups, root pages, flat nav, search, and markdown exports |
| Nested groups | ✅ Full | Navigation tree supports recursion |
| Tabs (`name/url` normalization) | ✅ Full | Normalized to `tab/href`; grouped tab pages resolve to the first nested page for top-nav links |
| Versions (`navigation.versions`) | ✅ Full | Supports default version selection, optional version tags, and a top-nav version selector dropdown linking each version to its first nested page |
| Anchors (`name/url` normalization) | ✅ Full | Normalized to `anchor/href`, including anchors nested under modern `navigation` |
| Topbar links (`url` -> `href`) | ✅ Full | Added normalization + rendering |
| Topbar dropdown links | ✅ Full | Added normalization + dropdown rendering in top nav |
| Topbar CTA (`url` -> `href`) | ✅ Full | Added normalization |
| Footer socials (`footerSocials`) | ✅ Full | Normalized and rendered |
| Page feedback | ✅ Full | Supports `feedback.thumbsRating`, `raiseIssue`, and `suggestEdit`; derives GitHub issue/edit URLs from config and emits feedback analytics events |
| Contextual menu | 🟡 Partial | Supports `contextual.options`, `display: "header" | "toc"`, built-in copy/view/assistant/AI/MCP actions, custom href objects, Markdown context fetching, and contextual analytics; exact third-party deep-link behavior may differ by tool |
| Redirects | ✅ Full | Mapped to Astro redirects (301/302) |
| SEO metatags/indexing | ✅ Full | Rendered in head/base layout |
| Analytics keys | ✅ Full | Supports Mintlify `integrations` analytics shape plus legacy `analytics` keys for GA4, GTM, PostHog, Amplitude, Mixpanel, Plausible, Fathom, Clarity, Heap, Hotjar, LogRocket, Segment, Pirsch, and Adobe Launch |
| Analytics event dispatch | 🟡 Partial | Emits Mintlify-style `docs.*` events for page views, nav/CTA clicks, search, feedback thumbs/issues/edits, contextual menu actions, assistant open/query/response/error, code copy, API playground requests, accordions, and expandables |
| Assistant config | 🟡 Partial | Supports `assistant: true`, string or object API handoff, public headers, timeout, local docs search, cited source links, suggested questions, support fallback, RAG context limits, and `/assistant-context.json`; does not bundle hosted LLM infrastructure |
| API playground config display mode | ✅ Full | `interactive/simple/none` respected in API layout |

## MDX & Components

| Capability | Status | Notes |
|---|---|---|
| Markdown + MDX content compilation with Astro | ✅ Full | Uses Astro content collections + render, preserving original `.md`/`.mdx` source paths for feedback/edit links |
| Mintlify component aliases (`Columns`, `ParamField`) | ✅ Full | Aliases exported in MDX component index |
| Current documented component surface | 🟡 Partial | Adds Panel, Prompt, View, Tile, Color/Color.Item/Color.Row, RequestExample, and ResponseExample with rendered fixture coverage; exact hosted side-panel and global view-dropdown behavior is still best-effort |
| `Visibility` component | ✅ Full | Human HTML renders human/default content; AI-readable markdown exports keep agent-only content and remove human-only blocks |
| Core component suite parity | 🟡 Partial | Documented component names are exported and render, with edge behavior parity pending |
| Mermaid component | ✅ Full | Client-side rendering with fallback |

## API Docs & OpenAPI

| Capability | Status | Notes |
|---|---|---|
| OpenAPI parsing | ✅ Full | Parser + virtual module integration |
| Endpoint resolution by operationId/method-path/path | ✅ Full | Added in API layout |
| Playground defaults from OpenAPI params/body | ✅ Full | Path/query/header/body defaults supported |
| Multiple OpenAPI specs | ✅ Full | Aggregated in virtual module |

## Search & I18n

| Capability | Status | Notes |
|---|---|---|
| Navigation-backed search index | ✅ Full | Single + multi-language search index |
| i18n navigation by language | ✅ Full | Default + language-prefixed routes |
| Built-in UI translations | ✅ Full | Multiple language string maps included |

## AI-Readable Exports

| Capability | Status | Notes |
|---|---|---|
| Per-page `.md` routes | ✅ Full | Generates static `/{slug}.md` for every docs page from source MDX |
| `/llms.txt` | ✅ Full | Generates an ordered, navigation-aware docs index with markdown links and descriptions |
| `/llms-full.txt` | ✅ Full | Generates concatenated markdown for all docs pages |
| `.well-known` LLM aliases | ✅ Full | Mirrors `/llms.txt` and `/llms-full.txt` at `/.well-known/llms.txt` and `/.well-known/llms-full.txt` |
| `/assistant-context.json` | ✅ Full | Generates a structured JSON corpus with page metadata, markdown URLs, and markdown content for external assistant/RAG ingestion |
| `Visibility` export filtering | ✅ Full | Removes `for="humans"` content and preserves `for="agents"` content in markdown exports |
| AI discovery response headers | 🟡 Partial | Added `Link` and `X-Llms-Txt` headers on LLMS routes plus LLMS discovery links in page `<head>`; static output still needs deployment-level support for global per-page headers |
| Accept-header markdown negotiation | ❌ Missing | Static `.md` routes are supported; content negotiation on canonical HTML URLs is not implemented |

## Testing & Quality Gates

| Capability | Status | Notes |
|---|---|---|
| Unit tests for config/navigation/search/i18n | ✅ Full | Existing suite expanded |
| Mintlify fixture compatibility test | ✅ Full | Added fixture-based normalization test |
| Rendered HTML conformance snapshots | ✅ Full | Builds fixture projects and snapshots emitted topnav/sidebar/API-playground HTML |
| Real-world repo conformance fixtures | ✅ Full | Checked-in snapshots from public Mintlify repos plus ingestion script |
| README compatibility documentation | ✅ Full | Documents supported Mintlify-compatible surface area and explicit known differences |
| Packaging correctness checks (`.mjs`) | ✅ Full | Added tests + build config alignment |
| Typecheck (`tsc --noEmit`) | ✅ Full | Clean under strict mode |

## Remaining Work for Full "Drop-in" Parity

1. Add deeper assistant answer quality tests and packaged serverless assistant examples.
2. Expand component-level parity tests against canonical Mintlify examples.
3. Expand real-world fixture corpus (currently sampled repos) and track incompatible schema deltas.
