# Free Online Tools Nest

**Free tools for study, assignments and everyday documents, with all 77 existing browser tools still available. No signups or tool-input uploads. Selected content pages may carry clearly separated advertising.**

Tool inputs are processed in your browser and are not sent to a Free Online Tools Nest processing server. Analytics and advertising resources are documented separately.

**Site**: https://freeonlinetoolsnest.com

## Categories

| Category | Count | What |
|----------|-------|------|
| ✏️ Text Tools | 15 | Word counter, text summarizer, grammar checker, plagiarism checker, text diff, case converter, and more |
| ⚡ Developer Tools | 16 | JSON/HTML/SQL formatter, regex tester, JWT decoder, Base64 encoder, password generator, and more |
| 🔢 Calculators | 10 | Percentage, loan, mortgage, BMI, age, tip, date difference, random number generator |
| 🔄 Converters | 16 | Unit converter, QR code generator, image compressor/cropper/resizer, CSV/JSON/YAML, epoch converter |
| 📄 PDF Tools | 5 | PDF merger, splitter, compressor, PDF to text, PDF to images |
| 🔍 SEO Tools | 11 | Meta tag generator, sitemap generator, SERP preview, keyword density checker, schema markup generator |
| 🎨 Design Tools | 4 | Color contrast checker, color palette generator, gradient generator, border radius generator |

## Tech Stack

- **Framework**: [Astro](https://astro.build) (static site, zero JS on non-interactive pages)
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

## Phase 1 publishing policy

The homepage promotes Study & Assignment Tools, Document Tools, Writing Tools and existing practical guides. Its navigation uses homepage anchors until dedicated hubs are implemented. Attendance, SGPA, CGPA, new workflows and new guide routes are outside Phase 1.

`src/data/page-policies.json` records audience, intent, hub, tier, review evidence, related content, indexing, sitemap membership and existing ad loading for each generated page. `page-policy.ts` is the server-side accessor; the full policy is not added to the client search registry. Unknown pages require an explicit policy.

The Phase 1 baseline is **176 routes, 173 indexable pages, 3 noindex pages and 74 sitemap URLs**. These are generated directives, not claims about Google's index. `src/data/__fixtures__/pre-pivot-routes.json` freezes the pre-pivot route, robots, redirect, sitemap and advertising state for regression checks. De-emphasizing a category does not change its indexing. Spanish and Hindi routes retain their indexing and sitemap exclusions.

`npm run build` validates local output only. Sitemap-eligible pages must be generated, indexable, self-canonical and non-redirecting. Validation also checks internal links, anchors, hreflang, JSON-LD syntax, metadata, ads.txt and retained integrations. Keep live production checks outside the build.

The existing AdSense loader and ownership method remain unchanged because independent ownership verification has not been confirmed. Do not generate an account verification meta tag. A future deployment requires a separate live ads.txt check; Phase 1 does not authorize deployment or another AdSense review. See [the Phase 1 review report](docs/student-first-phase-1.md) for evidence and the route migration table.

## License

MIT
