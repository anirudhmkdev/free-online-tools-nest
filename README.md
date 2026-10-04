# Free Online Tools Nest

**82 free browser tools for students, assignments and everyday tasks, including attendance, SGPA, CGPA, marks and Image to PDF. No signups or tool-input uploads. Selected existing content pages may carry clearly separated advertising.**

Tool inputs are processed in your browser and are not sent to a Free Online Tools Nest processing server. Analytics and advertising resources are documented separately.

**Site**: https://freeonlinetoolsnest.com

## Categories

| Category | Count | What |
|----------|-------|------|
| ✏️ Text Tools | 14 | Word counter, text summarizer, grammar checker, plagiarism checker, text diff, case converter, and more |
| ⚡ Developer Tools | 16 | JSON/HTML/SQL formatter, regex tester, JWT decoder, Base64 encoder, password generator, and more |
| 🔢 Calculators | 15 | Attendance, SGPA, CGPA, marks percentage, required marks and the ten existing calculators |
| 🔄 Converters | 16 | Unit converter, QR code generator, image compressor/cropper/resizer, CSV/JSON/YAML, epoch converter |
| 📄 PDF Tools | 6 | Image to PDF, PDF merger, splitter, compressor, PDF to text, PDF to images |
| 🔍 SEO Tools | 11 | Meta tag generator, sitemap generator, SERP preview, keyword density checker, schema markup generator |
| 🎨 Design Tools | 4 | Color contrast checker, color palette generator, gradient generator, border radius generator |

## Tech Stack

The 2026-10-04 content-quality release removes Text Humanizer and repairs tool outputs, claims and practical guidance while preserving the approved Campus design and existing integrations. See [verification and AdSense limitations](docs/adsense-quality-completion-2026-10-04.md) and the [retained tool inventory](docs/retained-tool-quality-review.md). Historical phase counts below describe those releases.

- **Framework**: [Astro](https://astro.build) (static HTML with shared UI scripts and interactive tool islands)
- **UI**: React 19 + TypeScript (`client:load` islands for interactive tools)
- **Styling**: Tailwind CSS v4
- **PDF**: pdf-lib + pdfjs-dist (fully client-side)
- **Hosting**: Cloudflare Pages
- **Analytics**: Google Analytics (gtag.js)

## Quick Start

```bash
npm ci
npm run dev     # local dev at localhost:4321
npm run build   # static build → dist/ + offline publishing validation
npm run test    # Vitest regression tests
npm run check   # Astro / TypeScript diagnostics
npm run lint
```

## Student tools and publishing policy

The homepage and English navigation connect Student Tools, Document Tools, Writing Tools and five reviewed workflows. Existing homepage anchors remain available. The six Phase 2 tools and nine Phase 3 destinations are English-only. Spanish and Hindi each retain 20 localized tools and 34 generated pages.

Student arithmetic lives in `src/helpers/student-calculators.ts`, separate from React interfaces. SGPA uses entered credits and points; CGPA requires a chosen weighting method. No university mapping, attendance threshold or GPA-to-percentage conversion is assumed. Image to PDF uses local image decoding and the existing pdf-lib dependency, with application guardrails and no file uploads.

`src/data/page-policies.json` records audience, intent, hub, tier, review evidence, related content, indexing, sitemap membership and existing ad loading for each generated page. `page-policy.ts` is the server-side accessor; the full policy is not added to the client search registry. Unknown pages require an explicit policy.

The Phase 1 baseline is **176 routes, 173 indexable pages, 3 noindex pages and 74 sitemap URLs**. These are generated directives, not claims about Google's index. `src/data/__fixtures__/pre-pivot-routes.json` freezes the pre-pivot route, robots, redirect, sitemap and advertising state for regression checks. De-emphasizing a category does not change its indexing. Spanish and Hindi routes retain their indexing and sitemap exclusions.

Phase 2 adds exactly six reviewed English routes through `src/data/__fixtures__/phase-2-additions.json`: **182 routes, 179 indexable pages, 3 noindex pages and 80 sitemap URLs**. All six additions have `adEligible: false`; the existing 117 loader pages and 30 ad-eligible tool dossiers remain unchanged. See [the Phase 2 verification report](docs/student-tools-phase-2-verification.md) for formulas, test evidence and limitations.

Phase 3 adds four decision-oriented hubs and five conditional workflows: **191 routes, 188 indexable directives, three existing noindex pages and 89 sitemap URLs**. All nine remain `adEligible: false`, with the same 117 existing loader pages. Categories remain inventories; the Document/Writing hubs have separate reviewed task-selection intent. See [Phase 3 verification](docs/hubs-workflows-phase-3-verification.md).

`npm run build` validates local output only. Sitemap-eligible pages must be generated, indexable, self-canonical and non-redirecting. Validation also checks internal links, anchors, hreflang, JSON-LD syntax, metadata, ads.txt and retained integrations. Keep live production checks outside the build.

The existing AdSense loader and ownership method remain unchanged because independent ownership verification has not been confirmed. Do not generate an account verification meta tag. A future deployment requires a separate live ads.txt check. Phase 3 implementation does not authorize pushing, merging, deployment, Phase 4 or another AdSense review. Keep private Search Console exports and performance history under ignored `.private/`, never in the public repository; use the [generic measurement procedure](docs/search-console-measurement.md). See [the Phase 1 review report](docs/student-first-phase-1.md) for historical evidence and the legacy route table.

## License

MIT
