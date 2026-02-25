# Docsy vs Mintlify Parity Matrix (Phase 2)

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

## Config Compatibility (`mint.json`)

| Capability | Status | Notes |
|---|---|---|
| Core fields (`name`, `theme`, `description`) | ✅ Full | Parsed and used in layout/nav |
| Navigation groups/pages | ✅ Full | Sidebar + flat nav generated |
| Nested groups | ✅ Full | Navigation tree supports recursion |
| Tabs (`name/url` normalization) | ✅ Full | Normalized to `tab/href` |
| Anchors (`name/url` normalization) | ✅ Full | Normalized to `anchor/href` |
| Topbar links (`url` -> `href`) | ✅ Full | Added normalization + rendering |
| Topbar dropdown links | ✅ Full | Added normalization + dropdown rendering in top nav |
| Topbar CTA (`url` -> `href`) | ✅ Full | Added normalization |
| Footer socials (`footerSocials`) | ✅ Full | Normalized and rendered |
| Redirects | ✅ Full | Mapped to Astro redirects (301/302) |
| SEO metatags/indexing | ✅ Full | Rendered in head/base layout |
| Analytics keys | 🟡 Partial | GA4 implemented, others not fully wired end-to-end |
| API playground config display mode | ✅ Full | `interactive/simple/none` respected in API layout |

## MDX & Components

| Capability | Status | Notes |
|---|---|---|
| MDX content compilation with Astro | ✅ Full | Uses Astro content collections + render |
| Mintlify component aliases (`Columns`, `ParamField`) | ✅ Full | Aliases exported in MDX component index |
| Core component suite parity | 🟡 Partial | Large subset implemented; edge behavior parity pending |
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

## Testing & Quality Gates

| Capability | Status | Notes |
|---|---|---|
| Unit tests for config/navigation/search/i18n | ✅ Full | Existing suite expanded |
| Mintlify fixture compatibility test | ✅ Full | Added fixture-based normalization test |
| Packaging correctness checks (`.mjs`) | ✅ Full | Added tests + build config alignment |
| Typecheck (`tsc --noEmit`) | ✅ Full | Clean under strict mode |

## Remaining Work for Full "Drop-in" Parity

1. Complete analytics parity for all providers and verify event behavior.
2. Expand component-level parity tests against canonical Mintlify examples.
3. Add end-to-end fixture tests from representative real-world Mintlify repos.
4. Document explicit unsupported/behavior-different cases in README.
