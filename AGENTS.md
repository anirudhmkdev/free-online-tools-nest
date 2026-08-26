# Free Online Tools Nest — Project Knowledge Base

> This file is a comprehensive knowledge base designed to give any AI model full context about this project without needing to explore the codebase. It saves tokens by consolidating architecture, data models, patterns, completed work, and known issues in one place.
> **Last audited**: 2026-07-07
> **Commit**: `ec86444` (main; Phase 4 sitemap expansion to 65 URLs)
> **GitHub**: https://github.com/AnirudhMKumar/free-online-tools-nest

---

## 1. Project Overview

**What it is**: A collection of 77 free, browser-based utility tools (text, code, math, SEO, PDF, design, converters, calculators). Tool inputs are processed client-side with no signups. Selected substantive pages may load clearly separated Google advertising. Includes a companion Chrome extension for quick tool access.

**Domain**: `https://freeonlinetoolsnest.com`  
**GitHub**: `https://github.com/AnirudhMKumar/free-online-tools-nest`  
**Deployed on**: Cloudflare Pages (auto-deploy from `main` branch)  
**Build**: 169 static pages, ~20s build time, 0 errors
**Codebase**: ~229 project files under `src/`, `public/`, and `extension/`; ~37k lines — Astro + React 19 + Tailwind CSS v4

---

## 2. Tech Stack

| Layer | Technology | Version / Notes |
|-------|-----------|----------------|
| **Framework** | Astro | v6.4.6, static output |
| **UI Framework** | React 19 | v19.2.7, `client:load` for interactive tools |
| **CSS** | Tailwind CSS v4 | via `@tailwindcss/vite`, custom design tokens |
| **Build** | Vite (Astro built-in) | esbuild for JSX |
| **Sitemap** | `@astrojs/sitemap` | Auto-generated; no synthetic build-time `lastmod` |
| **i18n** | Custom (no library) | English canonical + Spanish/Hindi pilot routes under `/es/` and `/hi/` |
| **PDF** | `pdf-lib` + `pdfjs-dist` | Client-side PDF processing |
| **QR** | `qrcode` | Client-side QR generation |
| **Markdown** | `marked` + custom sanitizer | Client-side MD→HTML rendering with sanitized preview output |
| **Hosting** | Cloudflare Pages | Custom domain + security headers |
| **Linting** | ESLint (`eslint-plugin-astro` + `typescript-eslint`) | Astro, JS, TS, and TSX coverage; currently warnings only |
| **Testing** | Vitest | v4.1.9, node environment, 12 unit tests |
| **Type Checking** | `astro check` (TypeScript strict) | 0 errors; 21 existing hints for unused locals/imports |
| **Node** | >=22.12.0 | Engine requirement |

### Why Astro + React?

- Astro generates fully static HTML (no server runtime needed)
- React `client:load` islands provide interactivity for tool UIs
- Zero JavaScript on pages that don't need it (SEO pages, category pages, blog)

---

## 3. Project Structure

```
freeonlinetoolsnest.com/
├── public/                       # Static assets (served as-is)
│   ├── _headers                  # Cloudflare Pages security headers
│   ├── robots.txt                # Search engine crawl rules
│   ├── favicon.svg / .ico        # Favicons
│   ├── og-default.png            # Default OG image
│   ├── og/                       # Per-category OG images
│   ├── apple-touch-icon.png
│   ├── site.webmanifest
│   └── web-app-manifest-*.png
├── extension/                    # Chrome extension (Manifest v3)
│   ├── manifest.json
│   ├── popup.html                # Popup with search + category filter
│   ├── popup.js                  # 38 tools listed, category filtering
│   └── icons/
│       └── icon.svg
├── src/
│   ├── assets/                   # Static images used in components
│   ├── components/               # Shared UI components
│   │   ├── tools/                # 77 React tool components (one per tool)
│   │   ├── FAQSection.astro      # Accordion FAQ + JSON-LD
│   │   ├── SEOHead.astro         # Meta/OG/hreflang/JSON-LD head component
│   │   ├── Nav.astro             # Sticky nav + mobile hamburger
│   │   ├── Footer.astro          # 4-column footer + newsletter signup
│   │   ├── Hero.astro            # Homepage hero
│   │   ├── ToolCard.astro        # Premium tool card component
│   │   ├── CategoryPage.astro    # Shared shell for category pages
│   │   ├── CategoryCard.astro    # Category card component
│   │   ├── Breadcrumbs.astro     # Breadcrumb nav
│   │   ├── ShareBar.astro        # Share buttons
│   │   ├── FavoriteButton.tsx    # Client-side favorites (localStorage)
│   │   ├── FavoritesPage.tsx     # Favorites listing page
│   │   ├── CmdKSearch.tsx        # Command-K search modal
│   │   └── ErrorBanner.tsx       # Error display component
│   ├── content/                  # Astro content collections
│   │   └── blog/                 # Blog posts (.md files, 3 total)
│   ├── content.config.ts         # Content collection schema
│   ├── data/
│       │   └── tools.ts              # THE central file: categories + 77 tools + helpers
│   ├── helpers/
│   │   ├── utils.ts              # formatBytes(), escapeHtml(), sanitizeHtml(), search status helpers
│   │   └── utils.test.ts         # 12 unit tests (Vitest)
│   ├── hooks/
│   │   └── useCopyToClipboard.ts # Shared clipboard copy hook with feedback state
│   ├── i18n/
│   │   ├── ui.ts                 # Locale registry + shared base UI strings
│   │   ├── overrides.ts          # Spanish/Hindi UI and static-page copy overrides`n│   │   └── utils.ts              # Locale routing, alternates, and translations
│   ├── layouts/
│   │   ├── Layout.astro          # Base layout (HTML shell, SEOHead, Nav, Footer, favicon links, PWA manifest, dark mode flash prevention)
│   │   ├── ToolLayout.astro      # Tool page layout (breadcrumbs, sidebar, FAQ, JSON-LD)
│   │   └── BlogLayout.astro      # Blog post layout
│   ├── pages/
│   │   ├── blog/                 # Blog index + [slug] dynamic route (3 posts)
│   │   ├── categories/           # 7 category listing pages
│   │   ├── tools/                # 77 tool pages + index
│   │   ├── 404.astro             # Custom 404 (English hardcoded)
│   │   ├── 500.astro             # Custom 500 (English hardcoded)
│   │   ├── about.astro           # English about page (was redirect stub → real content)
│   │   ├── contact.astro         # English contact page (was redirect stub → real content)
│   │   ├── faq.astro             # English FAQ page (was redirect stub → real content)
│   │   ├── privacy-policy.astro  # English privacy policy
│   │   ├── terms-and-conditions.astro # English terms
│   │   ├── [locale]/             # Spanish/Hindi localized static pages, categories, and 20 tool pages
│   │   ├── favorites/            # Favorites page
│   │   └── index.astro           # Real English homepage (was redirect to /en/)
│   ├── styles.css                # Tailwind v4 config + custom CSS
│   └── types/
│       └── index.ts              # TypeScript interfaces (Tool, Category, etc.)
├── astro.config.mjs              # Astro config (sitemap, tailwind, static output)
├── DESIGN.md                     # Vercel-inspired design system reference (736 lines)
├── eslint.config.js              # ESLint flat config (Astro only, partial coverage)
├── vitest.config.ts              # Vitest configuration (node env, globals)
├── tsconfig.json                 # extends astro/tsconfigs/strict
├── package.json
├── AGENTS.md                     # ← This file
├── .gitignore                    # dist/, .astro/, node_modules/, .playwright-mcp/, .omo/, .agents/
└── .omo/                         # OpenCode session state (gitignored)
    └── plans/
        ├── backlink-directory-submissions.md   # Directory submission strategy (31 directories)
        └── show-hn-launch-draft.md             # Hacker News launch draft
```

---

## 4. Data Model (Central File: `src/data/tools.ts`)

### Tool Interface

```typescript
interface Tool {
  slug: string;           // URL slug (e.g., "image-compressor")
  name: string;           // Display name
  description: string;    // Short description (meta + card)
  longDescription: string; // Full description on tool page
  categorySlug: string;   // References Category.slug
  icon: string;           // Emoji icon
  featured: boolean;      // Show on homepage?
  keywords: string[];     // SEO keywords (rendered as tags + implicit ranking)
  metaTitle?: string;     // Custom <title> (falls back to auto-generated)
  metaDescription?: string; // Custom <description> (falls back to description)
  usageSteps?: UsageStep[]; // 3-step "How to use" guide
  faq?: FAQPair[];        // 2 FAQ items per tool
  additionalContent?: ContentSection[]; // Extra long-form SEO sections (11 tools use this)
}

interface UsageStep {
  title: string;
  content: string;        // 2-3 sentences, includes long-tail keyword naturally
}

interface FAQPair {
  question: string;
  answer: string;         // 2-3 sentences
}

interface ContentSection {
  heading: string;
  content: string;        // Long-form paragraph
}
```

### Category Interface

```typescript
interface Category {
  slug: string;
  name: string;
  description: string;
  icon: string;           // Emoji
  color: string;          // Gradient hex color
  metaTitle?: string;
  metaDescription?: string;
  seoContent?: string;    // Paragraph for category pages
}
```

### SITE Constant (at bottom of tools.ts)

```typescript
export const SITE = {
  name: "Free Online Tools Nest",
  domain: "freeonlinetoolsnest.com",
  url: "https://freeonlinetoolsnest.com",
  description: "77 free web tools for text, code, math, and more. No signup required, and tool inputs are processed locally in your browser.",
  tagline: "Free web tools and frontier utilities for text, code, and math.",
};
```

### Categories (7)

| Slug | Name | Icon | # Tools |
|------|------|------|---------|
| `text-tools` | Text Tools | ✏️ | 15 |
| `developer-tools` | Developer Tools | ⚡ | 16 |
| `calculators` | Calculators | 🔢 | 10 |
| `converters` | Converters | 🔄 | 16 |
| `pdf-tools` | PDF Tools | 📄 | 5 |
| `seo-tools` | SEO Tools | 🔍 | 11 |
| `design-tools` | Design Tools | 🎨 | 4 |

### Helper Functions (all in tools.ts)

- `getToolsByCategory(categorySlug)` → Tool[]
- `getFeaturedTools()` → Tool[]
- `getToolBySlug(slug)` → Tool | undefined
- `getCategoryBySlug(slug)` → Category | undefined
- `getRelatedTools(currentSlug, limit=4)` → Tool[]
- `getAllToolSlugs()` → string[]

---

## 5. Complete Tool Inventory (77 Tools)

### Text Tools (15)
character-counter, word-counter, case-converter, text-analyzer, text-diff, text-summarizer, text-humanizer, grammar-checker, palindrome-checker, reverse-text, lorem-ipsum-generator, slug-generator, plagiarism-checker, readability-score, word-cloud-generator

### Developer Tools (16)
json-formatter, url-encoder-decoder, base64-encoder-decoder, html-formatter, regex-tester, password-generator, hash-generator, uuid-generator, password-strength-checker, css-minifier, html-entity-converter, binary-converter, jwt-decoder, sql-formatter, html-to-markdown, json-to-xml

### Calculators (10)
percentage-calculator, age-calculator, bmi-calculator, tip-calculator, date-difference-calculator, number-to-words, loan-calculator, discount-calculator, mortgage-calculator, random-number-generator

### Converters (16)
qr-code-generator, color-converter, markdown-to-html, csv-to-json, image-compressor, image-cropper, image-resizer, image-format-converter, image-filter, image-to-base64, unit-converter, json-to-csv, yaml-to-json, temperature-converter, lbs-to-kg-converter, epoch-converter

### PDF Tools (5)
pdf-merger, pdf-splitter, pdf-compressor, pdf-to-text, pdf-to-images

### SEO Tools (11)
meta-tag-generator, sitemap-generator, robots-txt-generator, keyword-density-checker, canonical-tag-generator, seo-length-checker, open-graph-preview-generator, alt-text-checker, serp-preview-generator, heading-structure-checker, schema-markup-generator

### Design Tools (4)
color-contrast-checker, color-palette-generator, gradient-generator, css-border-radius-generator

---

## 6. Page Architecture

### Tool Page Pattern

Every tool page follows this exact pattern — each is its own **individual static `.astro` file** (no dynamic `[slug].astro` route). All 77 files in `src/pages/tools/` share identical 19-line boilerplate, differing only in the slug string and imported component name:

```astro
---
import ToolLayout from "../../layouts/ToolLayout.astro";
import WordCounter from "../../components/tools/WordCounter";
import { getToolBySlug, getCategoryBySlug } from "../../data/tools";

const tool = getToolBySlug("word-counter")!;
const category = getCategoryBySlug(tool.categorySlug)!;
---

<ToolLayout
  title={tool.name}
  description={tool.description}
  toolSlug={tool.slug}
  categorySlug={tool.categorySlug}
  categoryName={category.name}
  longDescription={tool.longDescription}
  keywords={tool.keywords}
>
  <WordCounter client:load />
</ToolLayout>
```

### ToolLayout Renders (in order)

1. **Breadcrumbs**: Tools > Category > Tool Name (auto-generates BreadcrumbList JSON-LD)
2. **JSON-LD**: WebApplication structured data (passed to Layout → SEOHead)
3. **OG Image**: `/og/{categorySlug}.png` (per-category)
4. **H1 + longDescription**: Page header
5. **Tool component** (slot): The interactive React tool
6. **FavoriteButton** + **ShareBar**: Engagement widgets
7. **Keyword tags**: Displayed as styled pills
8. **How to Use section**: 3 numbered steps (from `tool.usageSteps`)
9. **Additional content**: Extra long-form SEO sections (from `tool.additionalContent`, 11 tools use this)
10. **Related tools sidebar**: 4 tools from same category (sticky on desktop)
11. **FAQSection**: Accordion FAQ with FAQPage JSON-LD (injected independently, not via SEOHead)

### JSON-LD by Page Type

| Page Type | Schema Types | Injection Points |
|-----------|-------------|------------------|
| **Tool page** | WebApplication + FAQPage + BreadcrumbList | ToolLayout→SEOHead + FAQSection + Breadcrumbs |
| **Homepage** | Organization + WebSite/SearchAction + FAQPage | index.astro→SEOHead + FAQSection |
| **Blog post** | BlogPosting | blog/[...slug].astro→SEOHead |
| **Tools directory** | CollectionPage | tools/index.astro→SEOHead |
| **404 / 500** | None | — |

### Homepage

- `/` → English homepage with Hero, Featured Tools grid, Category cards, Blog list, FAQ, JSON-LD
- `/es/` and `/hi/` → localized pilot homepages for Spanish and Hindi

---

## 7. SEO Infrastructure (Already Implemented)

### Per-Page SEO
- **Custom metaTitle/metaDescription** on every tool (overrides auto-generated defaults)
- **Canonical URLs** on every page
- **OG tags** (title, description, image, type, locale, site_name) — `og:locale` is locale-aware for `en`, `es`, and `hi`
- **Twitter Card** (summary_large_image)
- **Hreflang tags** are enabled for reciprocal `en`, `es`, `hi`, and `x-default` alternates where localized routes exist

### Structured Data (JSON-LD)
- **WebApplication** on every tool page
- **BreadcrumbList** on every tool page
- **FAQPage** on every tool page (auto-generated from FAQ data)
- **SiteNavigationElement** on homepage
- **Organization** on homepage
- **WebSite** + **SearchAction** on homepage (site search)

### Technical SEO
- **Sitemap**: Auto-generated by `@astrojs/sitemap` with custom filter — only 30 Tier 1 URLs (homepage, structural pages, 7 categories, 3 blog posts, 15 high-value tools with `additionalContent` or high-traffic potential). Synthetic build-time `lastmod` removed so unchanged pages are not marked fresh on every deploy. Excludes `/es/`, `/hi/`, `/favorites/`, and all other low-priority tool pages to concentrate crawl budget. See §12 for full rationale.
- **robots.txt**: Proper crawl directives
- **_headers**: Security headers + noindex for preview domains
- **OG images**: Per-category OG images in `public/og/`
- **Favicon**: Multi-format setup in `<head>` (`favicon-96x96.png` with `sizes="48x48 96x96"`, `favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, `site.webmanifest` with PWA icons). PNG link includes explicit 48×48 size declaration for Google Search result favicon support.
- **Trailing slashes**: Enabled (`trailingSlash: "always"`)
- **Directory format**: `build.format: "directory"` (clean URLs)

### Content SEO
- Every tool has: description, longDescription, keywords, metaTitle, metaDescription
- Every tool has: 3 usage steps + 2 FAQ items with long-tail keyword phrases
- 3 blog posts live
- Category pages have strengthened seoContent paragraphs and share a reusable `CategoryPage.astro` shell

---

## 8. i18n System

### Current State
English remains canonical at root URLs. Spanish (`/es/`) and Hindi (`/hi/`) are relaunched as a quality-controlled localization pilot, not a full machine-translation dump.

### Locale Routing
- Root English pages stay unchanged (`/`, `/tools/`, `/categories/`, `/tools/json-formatter/`).
- Spanish and Hindi pages live under subdirectories (`/es/`, `/hi/`).
- Localized route generation is static and limited to published locale content.
- `public/_redirects` no longer redirects `/es/*` or `/hi/*`; unrelaunched locales (`/pt/*`, `/fr/*`, `/de/*`, `/ja/*`, `/ar/*`, `/en/*`) still redirect to root equivalents.

### Locale Data
- `src/i18n/ui.ts` defines language metadata and shared base strings.
- `src/i18n/overrides.ts` provides Spanish/Hindi UI and static-page copy.
- `src/i18n/utils.ts` handles locale detection, localized paths, default alternates, and translations.
- `src/data/tools.ts` stays the English canonical tool source.
- `src/data/localized.ts` contains Spanish/Hindi category translations and 20 published localized tool records.

### SEO Signals
- `<html lang>`, `og:locale`, and `content-language` are locale-aware.
- Localized pages use self-canonical URLs.
- English, Spanish, and Hindi pages use reciprocal `hreflang` alternates plus `x-default` when a localized equivalent exists.
- Untranslated localized tool pages are not generated.

### Published Localized Tool Pilot
20 tools are localized for both Spanish and Hindi: image-compressor, json-formatter, pdf-compressor, pdf-merger, word-counter, qr-code-generator, jwt-decoder, epoch-converter, word-cloud-generator, grammar-checker, csv-to-json, json-to-csv, unit-converter, color-contrast-checker, character-counter, image-resizer, image-cropper, markdown-to-html, password-generator, regex-tester.

### Still English-Only
- Blog posts are English-only.
- Favorites, 404, and 500 remain English-only.
- The remaining 57 tool pages are English-only until translated and added to `LOCALIZED_TOOL_SLUGS`.

---

## 9. Component Details

### Key Components

| Component | Type | Purpose |
|-----------|------|---------|
| **SEOHead.astro** | Astro | Injects `<title>`, meta, OG, Twitter, canonical, hreflang, content-language, JSON-LD |
| **Nav.astro** | Astro | Sticky header with logo, category links, dark mode toggle, CmdK search trigger, hamburger on mobile |
| **Footer.astro** | Astro | 4-column: Tools (first 6), Categories (all 7), Company (About/Blog/Contact/Faq), Legal (Privacy/Terms) + newsletter signup section |
| **FAQSection.astro** | Astro | Accordion FAQ + auto-generates FAQPage JSON-LD |
| **ToolLayout.astro** | Astro | Wraps every tool page with all SEO, breadcrumbs, sidebar, FAQ |
| **ToolCard.astro** | Astro | Premium card for tool listings (stable icon tile, category badge, arrow affordance, focus state) |
| **CategoryCard.astro** | Astro | Polished category card with count badge, accent treatment, and top-tool previews |
| **FavoriteButton.tsx** | React | Toggle favorite, stored in localStorage, works offline |
| **FavoritesPage.tsx** | React | Lists favorited tools from localStorage |
| **CmdKSearch.tsx** | React | ⌘K search modal — fuzzy-search across all 77 tools |
| **ShareBar.astro** | Astro | Share buttons (copy link, social) |
| **Breadcrumbs.astro** | Astro | Breadcrumb navigation with JSON-LD |
| **Hero.astro** | Astro | Homepage launchpad hero with prominent search, quick links, and restrained gradient/grid atmosphere |
| **ErrorBanner.tsx** | React | Error display component for tool UIs |

### Helper Hook

| File | Type | Purpose |
|------|------|---------|
| **useCopyToClipboard.ts** | React Hook | `useCopyToClipboard()` → `[copied, handleCopy]` — copies text to clipboard, `copied` resets after 2s |

### 77 React Tool Components (in `src/components/tools/`)

Each is a self-contained React client component with its own state and logic. They use:
- Browser APIs (Canvas, FileReader, URL, etc.)
- Client-side libraries (pdf-lib, pdfjs-dist, qrcode, marked)
- No server communication — all data stays in the browser

---

## 10. Design System

### CSS Framework
- Tailwind CSS v4 with `@theme` custom design tokens
- Custom color system: ink (text), body (secondary), mute (tertiary), canvas (background), hairline (borders)
- Dark mode via CSS custom properties (`.dark` class toggled on `<html>`)
- Fonts: Inter (sans-serif), JetBrains Mono (monospace)
- Stacked box-shadows for depth (card, card-hover, elevated, modal) plus reusable focus, dense-card, pill, and tool-surface utilities

### Design Reference Document
- `DESIGN.md` at project root — Vercel-inspired design system specification
- 736 lines covering: colors (brand, surface, text, semantic, gradient), typography (display/body/caption families, size/weight/letter-spacing specs), spacing system (4px base), elevation (5 levels of stacked shadows), component specs (buttons, cards, inputs, nav), responsive breakpoints, and do's/don'ts

### Dark Mode
- Toggle in nav bar
- Persisted in localStorage
- Implemented via CSS custom properties (no Tailwind `dark:` variants needed)

---

## 11. Deployment & QA

### Cloudflare Pages
- **Project**: `freeonlinetoolsnest`
- **Branch**: `main`
- **Command**: `npm run deploy` (builds + deploys)
- **Custom domain**: `freeonlinetoolsnest.com`
- **Preview domain**: `*.freeonlinetoolsnest.pages.dev` (blocked from indexing via `_headers`)
- **Auto-deploy**: Connected to GitHub repo — every `main` push auto-deploys via Cloudflare Pages

### Build Stats
- **169 pages** generated (99 English pages + 70 localized Spanish/Hindi pilot pages)
- **~20s build time**
- **0 build errors**

### Testing
- **Vitest** (v4.1.9) — 12 unit tests for `formatBytes()`, `escapeHtml()`, `sanitizeHtml()`, and safe search status text in `src/helpers/utils.test.ts`
- Run via `npm run test` (alias: `vitest run`)
- All tests pass in ~369ms

### Linting
- **ESLint** (v10.5.0) with `eslint-plugin-astro` and `typescript-eslint` — flat config covering Astro, JS, TS, and TSX files while ignoring `dist/**`, `.astro/**`, and `node_modules/**`
- Run via `npm run lint` (alias: `eslint .`)
- **Current state**: `npm run lint` passes with warnings for existing unused locals/imports in tool components; TS/TSX parsing is configured via `typescript-eslint`
- `prettier` (v3.2.5) used for code formatting

### Type Checking
- Run via `npm run check` (alias: `astro check`)
- `tsconfig.json` extends `astro/tsconfigs/strict`
- **0 errors** currently; `astro check` reports 21 existing hints for unused locals/imports in tool components

### Security Headers (via `public/_headers`)
```
# Preview domains → noindex
*.freeonlinetoolsnest.pages.dev/* → X-Robots-Tag: noindex
# Production domain → security headers only
freeonlinetoolsnest.com/* → X-Content-Type-Options: nosniff, X-Frame-Options: DENY, Referrer-Policy: strict-origin-when-cross-origin, HSTS, CSP, Permissions-Policy, COOP
```

---

## 12. Search Console Indexation Rescue

### The Problem
- **Site age**: ~2 weeks, zero backlinks, effectively zero crawl budget
- **Search Console findings (2026-07-07)**: All 95 English pages show `Last crawled: 1970-01-01` — Google has **never successfully crawled** a single page
- **Status**: "Discovered — currently not indexed" — Google knows the URLs from the sitemap but considers them lowest priority and never fetches them
- **Root cause**: Too many low-value URLs in the sitemap (169) diluting crawl budget across localized variants, favorites, all 77 tools, error pages, etc.

### The Strategy (5 Phases)

| Phase | Action | Status |
|-------|--------|--------|
| **1** | Prune sitemap to ~30 Tier 1 URLs (structural pages, categories, blog, content-rich tools only) | ✅ Done (2026-07-07) |
| **2** | Manual indexing requests via Google Search Console URL Inspection for all 30 Tier 1 URLs (prioritize by value) | ✅ Done (2026-07-07) |
| **3** | Wait 1-2 weeks for crawl patterns; resubmit sitemap; check which URLs get indexed | ✅ Done — all 30 indexed |
| **4** | Expand sitemap to ~50-65 tools (remaining featured + popular tools from all categories) | ✅ Done (2026-07-07) |
| **5** | Once Tier 1-2 is healthy, expand to full 77+ English tools and add localized pages back | ⏳ Pending |

### Why Sitemap Pruning (Phase 1)
- Google allocates crawl budget based on site authority and URL count
- With 169 URLs and zero trust, Google won't crawl 95% of pages
- By pruning to 30 best URLs, we tell Google: "these are the important ones, ignore the rest"
- Once these get indexed, trust builds and we can expand incrementally

### Tier 1-2 URLs in Current Sitemap (65 total)
```
Structural (5):   /, /about/, /tools/, /categories/, /blog/
Categories (7):   all 7 category pages
Blog posts (3):   all 3 blog posts
Tools (50):       all 11 content-rich tools (additionalContent)
                  + 4 original popular tools
                  + 35 additional tools across all 7 categories
```

### Sitemap Filter Implementation
- Located in `astro.config.mjs` → `sitemap({ filter: ... })`
- Filter function receives full URL, parses pathname, matches against allow-listed slugs
- `/es/` and `/hi/` localized pages intentionally excluded (would waste crawl budget on a 2-week-old site)
- `/favorites/` already has `noindex` meta tag
- When adding more tool pages, add slugs to the `contentRichSlugs` or `tier2Slugs` arrays
- **Do NOT re-add `/es/` or `/hi/` sitemap entries until the user explicitly requests it** (after English site is fully indexed)

---

## 13. Completed Work (History)

### Phase 1 — SEO Infrastructure
- Added JSON-LD structured data (WebApplication, BreadcrumbList, FAQPage, Organization, WebSite, SearchAction, SiteNavigationElement)
- Added hreflang tags to shared pages (about, contact, privacy, terms, faq)
- Created `robots.txt` with proper crawl directives
- Added per-category OG images (`/og/{categorySlug}.png`)
- Added `lastmod` to sitemap (later removed in Phase 13 to avoid synthetic freshness on every deploy)
- Updated `_headers` with security headers

### Phase 2 — Design Cleanup
- Removed GitHub icon from footer
- Added offerItem5/6/7 translations to about page for all 8 locales
- Created `DESIGN.md` — comprehensive Vercel-inspired design system reference

### Phase 3 — Content System
- Added `UsageStep` and `FAQPair` interfaces to data model
- Added `usageSteps: UsageStep[]` and `faq: FAQPair[]` as optional fields on Tool
- Built `ToolLayout.astro` "How to use" section (numbered steps)
- Built `FAQSection.astro` accordion component with auto-generated FAQPage JSON-LD
- Generated and inserted 3 usage steps + 2 FAQ items for all 62 tools
- Content uses long-tail keyword phrases naturally (e.g., "check color contrast WCAG online free tool")

### Phase 4 — Blog & Link Building
- Wrote 2 new blog posts (published, built, deployed):
  1. "How Our Image Compressor Works 100% in Your Browser" (technical deep-dive)
  2. "10 Free Online Tools Every Developer and Content Creator Should Bookmark in 2026" (listicle)
- Created directory submission plan (`.omo/plans/backlink-directory-submissions.md`) — 31 directories
- Created Hacker News Show HN launch draft (`.omo/plans/show-hn-launch-draft.md`)

### Phase 5 — QA Infrastructure & Polish
- **Newsletter signup form** added to footer (client-side, localStorage-based mock submission)
- **404/500 error pages localized** using `useTranslations("en")` with `err.*` translation keys
- **AsSeenOn.astro removed** — fake social proof section deleted entirely
- **Empty `src/tools/` directory deleted**
- **`src/hooks/useCopyToClipboard.ts`** created — shared clipboard hook with 2s feedback state
- **Unit testing infrastructure** added: Vitest configured, 7 tests for `formatBytes()` and `escapeHtml()`
- **ESLint configured** with `eslint-plugin-astro` (later expanded with `typescript-eslint` for TS/TSX coverage)
- **TypeScript strict mode** enabled via `astro/tsconfigs/strict`
- **Build** confirmed at 130 pages, 0 errors, ~9s
- **Tests** confirmed at 7/7 passing
- **Deploy** to Cloudflare Pages successful
- **Commit and push** — all changes committed to `main`

### Phase 6 — Chrome Extension (ancillary)
- Built companion browser extension (Manifest v3)
- Popup with search + category filters for 38 tools
- Links directly to tool pages on the main site

### Phase 7 — SEO Keyword Update (all 62 tools)
- Created `seo-keyword-plan.md` with 62 target long-tail keywords (one per tool, user-curated for low difficulty)
- Updated every tool in `tools.ts` with: new `metaTitle` (under 60 chars), `metaDescription` (under 160 chars, action-oriented with keyword), reordered `keywords[]` (target keyword first + 4-5 semantic variants), 3 `usageSteps` (natural keyword inclusion), 2 `faq` items (keyword variant in question, 2-3 sentence answers)
- No changes to: slug, name, description, longDescription, categorySlug, icon, featured
- Used brace-matching merge script to safely replace 62 tool objects without regex corruption
- `tools.ts` grew from 2537 → 2892 lines
- **Verification**: 0 LSP errors, 62 tools present, build 131 pages 0 errors, tests 7/7 passing

### Phase 8 — Favicon Investigation & Google Search Fix
- Investigated why favicon doesn't display in Google search results despite being properly wired in `Layout.astro`
- Launched 3 parallel background agents to cross-reference Google Search Central docs, current head tags, and favicon image files
- **Key finding**: Google reads favicon from homepage `<link rel="icon">` tags, NOT from sitemap. Requirement: ≥48×48px PNG/GIF/ICO (SVG not supported for search results). Site must be indexed first; Google caches favicons (changes take days-weeks)
- Updated `Layout.astro` favicon link: `sizes="96x96"` → `sizes="48x48 96x96"` for explicit Google compatibility
- Confirmed: `favicon-96x96.png` (96×96, 6153 bytes) meets Google's minimum; `favicon.ico` (15086 bytes) has 48×48 frame; `_headers` and `robots.txt` don't block favicon files

### Phase 9 — Remove All Non-English Locales (English-Only Conversion)
- Stripped `src/i18n/ui.ts` from ~1800 lines (8 languages) to ~255 lines (English only)
- Simplified `src/i18n/utils.ts` — removed `getLocalePaths`, `getLocalePath`
- Deleted `src/pages/[locale]/` folder (6 files, 48 generated pages removed from build)
- Converted root-level pages from `<meta http-equiv="refresh">` redirect stubs to real content: index, about, contact, faq, privacy-policy, terms-and-conditions
- Removed language switcher dropdown + JS from `Footer.astro`
- Removed hreflang block from `SEOHead.astro`; hardcoded `og:locale` to `en_US`
- Removed `localePaths`/`xDefaultPath` from `Layout.astro` Props interface
- Removed i18n config block from `astro.config.mjs`; simplified sitemap filter
- Replaced `useTranslations("en")` with direct English strings in 404.astro and 500.astro
- **Build**: 83 pages (was 131), 0 errors, tests 7/7 passing
- **Deploy**: Committed to `main`, deployed to Cloudflare Pages
- **Live verification**: Homepage, all root pages, tool page (word counter), sitemap, locale 404s — all confirmed working

### Phase 10 — Tool Expansion (62 → 77 Tools)
- Added **15 new tools** across all 7 categories: plagiarism-checker, readability-score, word-cloud-generator (text); jwt-decoder, sql-formatter, html-to-markdown, json-to-xml (developer); random-number-generator (calculators); epoch-converter (converters); serp-preview-generator, heading-structure-checker, schema-markup-generator (seo); color-palette-generator, gradient-generator, css-border-radius-generator (design)
- Conducted 11-competitor analysis to select high-impact, client-side-feasible tools
- Built 15 React components + 15 Astro page files using existing patterns (ErrorBanner, useCopyToClipboard, CSS custom properties, ToolLayout)
- Updated `SITE` constant to reflect 77 tools
- Updated AGENTS.md counts: 84→99 pages, 62→77 tools across all categories
- **Build**: 99 pages, 0 errors, ~9s. **Tests**: 7/7 passing.
- **Deploy**: Committed to `main`, deployed to Cloudflare Pages

### Phase 11 — Pre-HN Launch Preparation
- **GA tag audit**: Confirmed all 5 key URLs have correct `G-KW0NXYM3MN` tag with `is:inline` and proper comment; GA4 `collect` returns 204
- **Umami analytics removed**: Script tag in `Layout.astro` was throwing `POST https://gateway.umami.is/api/send → 404` console errors; removed entirely (redundant with GA4)
- **Blog post fix**: Updated "60+ utilities" → "77 free tools" in blog post description and heading
- **GitHub repo created**: `https://github.com/AnirudhMKumar/free-online-tools-nest` — README, MIT license, `.gitignore` (`.omo/`, `.agents/`)
- **GitHub link added to footer**: `src/components/Footer.astro` — direct link with icon
- **Cloudflare Pages auto-deploy**: Connected GitHub repo to Cloudflare Pages (build: `npm run build`, output: `dist/`, branch: `main`)
- **Pre-HN site audit**: Checked homepage, JSON formatter, image compressor, PDF merger, blog, 404, dark mode, mobile/desktop rendering, sitemap, footer links — all clean
- **HN comment draft updated**: `.omo/plans/show-hn-launch-draft.md` — updated tool count (77), added GitHub repo URL
- **Codebase audit**: Complete AGENTS.md rewrite with full architecture discovery through background explore agents

### Phase 12 — Security, Accessibility, and Tooling Hardening
- Sanitized Markdown preview output using `sanitizeHtml()` before `dangerouslySetInnerHTML`.
- Replaced unsafe homepage search result HTML rendering with DOM-safe rendering and added regression coverage for search status text.
- Added production-grade CSP, Permissions-Policy, COOP, HSTS, and preview-domain noindex headers in `public/_headers`.
- Added guardrails and UX hardening around heavy local-file tools where practical while keeping all processing client-side.
- Expanded `src/helpers/utils.test.ts` from 7 to 12 tests, covering HTML escaping, sanitization, and safe search status behavior.
- Fixed ESLint configuration so TS/TSX files parse through `typescript-eslint`; `npm run lint` now passes with warnings instead of parser failures.

### Phase 13 — SEO/GEO Strengthening
- Created and committed `seo-keyword-research-2026-07-03.md` as the SEO decision record.
- Remapped high-opportunity primary keywords for tools such as CSV to JSON, JSON to CSV, Unit Converter, Color Contrast Checker, PDF Compressor, Image Resizer, Text Humanizer, and Plagiarism Checker/Text Similarity Checker.
- Expanded long-form `additionalContent` for 11 high-priority tools, including Image Compressor, JSON Formatter, PDF Compressor, PDF Merger, Word Counter, QR Code Generator, JWT Decoder, Epoch Converter, Word Cloud Generator, Grammar Checker, and Markdown to HTML.
- Strengthened category SEO copy and homepage/internal links around major tool clusters.
- Updated `robots.txt` to explicitly allow major AI/search crawlers for visibility in AI search while keeping normal crawlers allowed.
- Removed synthetic build-time `lastmod` from `@astrojs/sitemap` so unchanged URLs are not marked as freshly updated on every deploy.

### Phase 14 — Premium UI/UX Polish
- Reworked the homepage into a utility-first launchpad with stronger search prominence, tier-one quick links, denser tool discovery, and visible categories above the fold.
- Added reusable visual polish through shared styles for dense cards, focus states, pill filters, metadata badges, section rhythm, and tool surfaces.
- Upgraded `ToolCard`, `CategoryCard`, `/tools/`, category pages, and `ToolLayout` so shared surfaces feel more consistent and premium.
- Added `CategoryPage.astro` as the reusable category shell for all 7 category pages.
- Refined nav/header search, mobile menu spacing, footer density, related tools, action rows, and focus/hover behavior.
- Improved the hero background from a heavier marketing gradient to a calmer command-center gradient/grid atmosphere that preserves the brand while making search and tools the focus.

### Phase 15 — Legal Policy Cleanup
- Updated Privacy Policy and Terms & Conditions to remove placeholder `{name}` text and align claims with the real site behavior.
- Disclosed Google Analytics/Tag Manager, Google Fonts, LaunchBuff badge assets, localStorage usage, client-side processing, and email contact flow.
- Added clearer professional-advice, user-content, acceptable-use, and limitation-of-liability language while keeping the documents readable.

### Phase 16 — Internationalization Pilot + Bing Indexing Recovery
- Relaunched Spanish (`/es/`) and Hindi (`/hi/`) as static subdirectory locales while keeping English canonical at root URLs.
- Added locale metadata, self-canonical localized pages, reciprocal `hreflang` alternates, locale-aware `og:locale`, and `content-language` signals.
- Added localized homepage, tools directory, category index, all 7 category pages, static company/legal pages, and 20 high-opportunity localized tool pages per locale.
- Added `src/data/localized.ts` so localized tool pages are generated only when reviewed translated data exists; untranslated locale tool URLs are not built.
- Updated `public/_redirects` so `/es/*` and `/hi/*` no longer redirect away, while unrelaunched locale prefixes still collapse to canonical root equivalents.
- Added IndexNow support with a hosted key file and `npm run indexnow:submit` for Bing/Yandex-style URL notification after deployment.

### Phase 17 — Sitemap Pruning & Indexation Rescue (2026-07-07)
- Discovered via Search Console that all 95 English pages had `Last crawled: 1970-01-01` (never crawled, "Discovered currently not indexed")
- Diagnosed root cause: 169 URLs in sitemap diluting crawl budget for a 2-week-old site with zero backlinks
- Built 5-phase indexation rescue strategy (see full §12 above)
- Phase 1 executed: pruned sitemap from 169 to 30 Tier 1 URLs via `filter` in `astro.config.mjs`
- Pushed to `main` → Cloudflare Pages auto-deployed
- Phase 2 (manual indexing requests via Search Console) executed — all 30 URLs requested
- Phase 3 (wait and verify) complete — all 30 Tier 1 URLs successfully indexed
- Phase 4 (expand sitemap) executed — sitemap expanded from 30 to 65 URLs (50 tools + 15 structural/category/blog pages)

---

## 14. Known Issues & Gaps

### Content Gaps
- [ ] Only 20 of 77 tools are localized for Spanish/Hindi; the remaining 57 tools need reviewed translations before publication
- [ ] Launch copy exists for Reddit/Hacker News, but sustained social promotion and backlink outreach are still early
- [ ] Chrome extension only lists 38 of 77 tools (not all)

### Technical Gaps
- [ ] ESLint still reports existing unused-local/import warnings in several tool components; parser coverage is now fixed
- [ ] **`src/types/index.ts` is dead code** — defines a subset of Tool interface (missing `usageSteps`, `faq`, `additionalContent`), never imported anywhere. All consumers import from `src/data/tools.ts` directly
- [ ] Password tools are currently categorized under developer-tools; consider a future security/privacy category only if the taxonomy grows
- [ ] Image compressor uses Canvas API — can't match server-side compression ratios (noted in blog post)
- [ ] `astro check` currently has 21 existing hints for unused locals/imports in tool components
- [ ] No integration or E2E tests (only 12 unit tests)

### SEO Gaps
- [x] ~~All 95 English pages found "Discovered currently not indexed", never crawled (1970-01-01 last crawl)~~ → Mitigation in progress via §12 5-phase strategy
- [ ] Site is new — no backlinks, low domain authority
- [ ] Blog posts and launch copy exist, but broad promotion/backlink work is still early
- [ ] No social media presence linked from site (Twitter handle in OG tags may be placeholder)
- [ ] No formal Core Web Vitals/Lighthouse optimization pass has been completed yet

### Design Gaps
- [ ] Dark mode is broadly supported, but individual tool interiors still need deeper mobile/dark QA across all 77 tools
- [ ] Mobile responsiveness not thoroughly tested across all 77 tools
- [ ] Some heavy PDF/image tools still need richer progress/loading states beyond shared shell polish

### i18n Gaps
- [ ] Only 20 of 77 tools are localized for Spanish/Hindi; the other 57 tool pages remain English-only
- [ ] Blog posts are English-only
- [ ] Favorites, 404, and 500 pages remain English-only

---

## 15. Files an AI Should Read First

For maximum context with minimum tokens, read in this order:

1. **`src/data/tools.ts`** — Central file: all categories, all 77 tools, SITE config, helper functions
2. **`src/layouts/ToolLayout.astro`** — Tool page layout (shows every rendered section)
3. **`src/components/FAQSection.astro`** — FAQ with JSON-LD (reused on every tool page)
4. **`src/components/SEOHead.astro`** — All meta/OG/JSON-LD injection
5. **`astro.config.mjs`** — Build config, sitemap, plugins
6. **`src/i18n/ui.ts` + `src/i18n/utils.ts` + `src/data/localized.ts`** — Locale metadata, route helpers, and localized tool/category data
7. **`src/styles.css`** — Design tokens and dark mode
8. **`src/types/index.ts`** — TypeScript interfaces (but tools.ts has its own superset; this file is dead code — never imported)
9. **`package.json`** — Dependencies and scripts
10. **`public/_headers`** — Security and indexing headers
11. **`DESIGN.md`** — Vercel-inspired design system reference (if working on UI/UX)
12. **`src/hooks/useCopyToClipboard.ts`** — Shared clipboard hook (if building new interactive tools)

---

## 16. Quick Reference

### Common Commands
```bash
npm run dev          # Local dev server (port 4321)
npm run build        # Static build → dist/
npm run preview      # Preview build locally
npm run deploy       # Build + deploy to Cloudflare Pages
npm run test         # Run Vitest unit tests (12 tests)
npm run lint         # Lint Astro, JS, TS, and TSX with ESLint
npm run check        # TypeScript check with astro check
```

### Adding a New Tool
1. Add a React component in `src/components/tools/YourTool.tsx`
2. Add entry to `TOOLS` array in `src/data/tools.ts` (slug, name, description, etc.)
3. Add usageSteps (3) and faq (2) to the tool entry
4. Create `src/pages/tools/your-tool.astro` (19-line boilerplate)
5. Run `npm run check`, `npm run build`, `npm run test`, and `npm run lint` to verify

### Key URLs (Production)
```
Homepage:        https://freeonlinetoolsnest.com/
All tools:       https://freeonlinetoolsnest.com/tools/
Blog:            https://freeonlinetoolsnest.com/blog/
Sitemap:         https://freeonlinetoolsnest.com/sitemap-index.xml
Any tool page:   https://freeonlinetoolsnest.com/tools/{slug}/
```

### Build Output (169 pages)
```
English: 77 tool pages + 1 tools index + 1 categories index + 7 category pages + 4 blog pages + homepage + favorites + 5 root content pages + 2 error pages = 99
Localized pilot: Spanish and Hindi each generate 1 homepage + 1 tools index + 20 tool pages + 1 categories index + 7 category pages + 5 static pages = 35 each
= 169 total
```

### Page Count Breakdown (verified by build)
| Section | Count | Details |
|---------|-------|---------|
| Tools | 120 | 77 English tool pages + English tools index + 40 localized tool pages + 2 localized tools indexes |
| Categories | 24 | 8 English category pages + 16 localized category pages |
| Blog | 4 | Index + 3 posts |
| Homepage | 3 | English root homepage + `/es/` + `/hi/` |
| Static content pages | 15 | English, Spanish, and Hindi versions of about, contact, faq, privacy-policy, terms-and-conditions |
| Error pages | 2 | 404, 500 |
| Favorites | 1 | `/favorites/index.html` |
| **Total** | **169** | |
