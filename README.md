# Free Online Tools Nest

**77 free, client-side browser tools — no tool-input uploads and no signups. Selected content pages may carry clearly separated advertising.**

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
- **UI**: React 18 + TypeScript (`client:load` islands for interactive tools)
- **Styling**: Tailwind CSS v4
- **PDF**: pdf-lib + pdfjs-dist (fully client-side)
- **Hosting**: Cloudflare Pages
- **Analytics**: Google Analytics (gtag.js)

## Quick Start

```bash
npm install
npm run dev     # local dev at localhost:4321
npm run build   # static build → dist/
npm run test    # 7 unit tests (Vitest)
```

## License

MIT
