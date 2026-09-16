# Student-first pivot — Phase 1 review

Date: 2026-09-16. Branch: `pivot/student-first-v1`. Pre-pivot baseline: `16427aa`.

Phase 1 is complete locally. Nothing has been pushed, merged or deployed. Phase 2 has not started. This work is not authorization or a recommendation to request another AdSense review.

## Product and implementation

The English homepage now leads with “Free tools for study, assignments and everyday documents” and promotes only existing functionality. Navigation uses **Study & Assignment Tools**, Document Tools, Writing Tools, Guides and More Tools. The first four links point to real homepage sections; More Tools opens the existing directory. No placeholder hubs, grade/attendance promises or workflow landing pages were introduced.

The 13 promoted tools are Word Counter, Character Counter, Grammar Checker, Percentage Calculator, PDF Merger, PDF Compressor, PDF Splitter, PDF to Text, PDF to Images, Image Compressor, Image Resizer, Image Cropper and QR Code Generator. Developer, SEO, design, mortgage, loan, BMI, tip and miscellaneous utilities remain accessible through the complete directory, categories and search. Their indexing is unchanged.

The homepage uses concise task links, three existing practical guides, local-processing explanations and links to the existing standards/about pages. Privacy copy distinguishes local tool processing from separate font, analytics and advertising requests. Grammar checking and PDF compression/extraction limitations are stated where tools are promoted.

The mobile menu uses a native modal dialog, explicit keyboard focus wrapping, Escape dismissal and restored trigger focus. Search and theme controls remain available. The footer now prioritizes useful tools and removes the nonfunctional newsletter form that only stored a subscription locally.

ToolLayout retains all existing quality dossiers and technical sections. Visible SEO keyword tags are removed. Recorded review dates and relevant existing guide links are displayed; no review dates were invented. Category schema now identifies the team as an organization and omits unsupported fixed publication/modification dates. The arbitrary 2030 offer expiry was removed. Error-page canonicals now identify their existing `.html` routes instead of the homepage; their noindex directives are unchanged.

## Publishing and migration

| Measure | Before | Phase 1 |
| --- | ---: | ---: |
| Generated routes | 176 | 176 |
| English routes | 108 | 108 |
| Spanish routes | 34 | 34 |
| Hindi routes | 34 | 34 |
| Indexable directives | 173 | 173 |
| Noindex directives | 3 | 3 |
| Sitemap URLs | 74 | 74 |
| Pages with existing AdSense loader | 117 | 117 |
| Tools | 77 | 77 |
| Blog posts | 11 | 11 |
| New routes / redirects / guides / workflows | — | 0 / 0 / 0 / 0 |

“Indexable” describes generated robots metadata, not confirmed inclusion in Google's index. The sitemap remains exactly 50 tool pages, 7 category pages, 11 posts and 6 structural pages. All localized pages remain outside it. `/404.html`, `/500.html` and `/favorites/` retain noindex. No category was automatically noindexed because it was de-emphasized.

`src/data/page-policies.json` is the explicit publishing record for each route: audience, intent, hub, tier, indexable, sitemapEligible, canonicalPath, adEligible, lastReviewed, relatedGuides, relatedWorkflows and reviewStatus. `page-policy.ts` exposes server-side accessors. `astro.config.mjs` no longer contains slug allowlists. Legacy classifications preserve the current set while evidence is collected; they are not automatic noindex decisions.

The separate `pre-pivot-routes.json` fixture records the actual baseline. It is used only by regression validation, not to choose runtime sitemap membership. A future approved phase must deliberately update that fixture when routes or indexing change; do not silently regenerate it during builds.

The local publishing gate requires every sitemap-eligible page to exist in the output, be indexable and self-canonical, and have neither a route redirect/rewrite elsewhere nor a meta-refresh redirect. Unknown generated routes require metadata. The validator also checks exact sitemap membership, baseline robots/redirect/loader preservation, internal relative links and anchors, canonical tags, reciprocal hreflang targets, JSON-LD syntax, metadata presence/new duplicates, GA4 identity and ads.txt. Existing duplicate descriptions for the Spanish homepage/tools pair and Hindi homepage/tools pair are grandfathered unchanged; new duplicates fail. Structured-data syntax checks do not guarantee Google rich-result eligibility.

## AdSense and ads.txt — separate evidence

Ownership verification independent of the existing loader could not be confirmed. The loader remains on exactly the same 117 pages, using `ca-pub-7189536685341014`. No `google-adsense-account` meta tag was generated. No new ad placements or ad-unit optimization was introduced. GA4 `G-KW0NXYM3MN` is unchanged; no new analytics events or tool-input collection was added.

**Local/build result:** `npm run build` verifies `dist/ads.txt` without making network requests. It must contain exactly the existing record, with only an optional final line ending:

```text
google.com, pub-7189536685341014, DIRECT, f08c47fec0942fa0
```

Tests reject a missing file, HTML, wrong publisher, extra records and conflicting content. No duplicate ads.txt file was created.

**Live pre-implementation observation:** on 2026-09-16, read-only requests to the current production HTTPS root and www `/ads.txt` returned HTTP 200, `text/plain` and that publisher line; HTTP redirected to HTTPS successfully. This is evidence about the existing deployment, not the unshipped branch. It does not prove that AdSense has refreshed its stored status, or that an independent ownership-verification method is configured.

**Separate post-deployment action, when a deployment is authorized:** check HTTPS root, HTTP root and HTTPS www `/ads.txt` again. Verify the actual publisher text, HTTP 200 after sensible HTTPS redirection, no HTML/error/authentication/challenge and no JavaScript requirement. Do not put this network check into the build. Low-value-content review and ads.txt retrieval are distinct issues. Do not request resubmission until substantive student tools, workflows and useful supporting content exist and the result has been manually reviewed.

## Verification

| Check | Result |
| --- | --- |
| `npm ci` | Passed after stopping the local preview to release a Windows dependency-file lock |
| `npm run test` | 46 tests passed across 4 files |
| `npm run build` | 176 pages; all offline publishing checks passed; exact 74-URL sitemap |
| `npm run check` | 0 errors, 0 warnings; 21 existing unused-code hints |
| `npm run lint` | 0 errors; 21 existing unused-code warnings |
| `git diff --check` | Passed |
| Responsive homepage | No horizontal overflow at widths 320, 390, 768, 1024 and 1440 |
| Light/dark display | Desktop/light and mobile/light/dark screenshots inspected |
| Keyboard | Homepage search ArrowDown/Enter navigation; mobile dialog focus entry/wrap, Escape and return focus; global search opens with focused input and finds PDF Merger; mobile Document Tools link closes the menu and reaches the correct anchor |
| Locale smoke check | Spanish homepage renders with `lang="es"` and its existing translated heading |
| Word Counter | Five-word sample returned 5 words, 35 characters, 31 non-space characters; no canary text in 9 captured request URLs/bodies during the interaction |
| Percentage Calculator | 15% of 80 returned 12 |
| PDF Merger | 1-page and 2-page fixtures downloaded as a valid 3-page PDF, independently parsed with pdf-lib |
| Image Compressor | Local screenshot input produced a successful JPEG download; no mobile horizontal overflow |

The input-network check is a bounded smoke test, not an exhaustive privacy audit. Tool logic and dependencies were not changed. Browser artifacts are local and ignored under `output/playwright/` and `.playwright-cli/`; they are not published. The existing content tests no longer use an arbitrary character minimum for guides; they check metadata and useful tool links. Example correctness and editorial usefulness still require human review.

The dependency installer reported 14 audit findings (3 moderate, 10 high, 1 critical) in the unchanged dependency tree. Dependency remediation is not part of this Phase 1 patch; no automatic or breaking audit fix was applied.

## Review boundaries and remaining work

- Search Console landing-page/query/indexing evidence was unavailable in this session. The attempted connected project data lookup returned “Insufficient plan.” No traffic, ranking, backlink or actual-indexing claims were inferred from that. Obtain owner-provided Search Console evidence before any later noindex decision.
- Thirty existing English dossiers carry their recorded 2026-08-26 review date. That historical date was not replaced with today's date merely because the layout changed. Other routes remain pending evidence, and no localized review dates were invented.
- The Spanish/Hindi pilot routes and hreflang pairs were preserved. The local audit confirms generated structure, not full linguistic quality. A later editorial review must assess translation completeness, examples and localized intent before proposing indexing changes.
- Some existing tool copy still needs a substantive accuracy review; for example, PDF Merger instructions describe drag reordering while the current interface uses move buttons. Those existing descriptions were retained rather than mass-rewritten during the foundation phase.
- For newly authored or substantively revised content, reviewers should record the intended audience/problem, a working unique function, a verified example, method/formula where applicable, limitations, privacy behavior, meaningful links, distinct title/description, canonical/indexing decisions and actual review evidence. Content length is not a quality proxy.
- Later phases require separate authorization: six substantive student tools, hubs/workflows, supporting guides and broader trust/monetization review. This branch does not establish readiness for another AdSense review.

## Changed-file map

Implementation commits: `eeec82c` publishing metadata; `bb74753` offline build validation; `c220eb4` homepage/navigation; `0d286c0` tool evidence and schema cleanup; `3fb0aa7` validation hardening. Documentation is committed separately.

- Publishing: `src/data/page-policies.json`, `page-policy.ts`, `page-policy.test.ts`, `__fixtures__/pre-pivot-routes.json`, `astro.config.mjs`, `src/layouts/Layout.astro`, error-page canonicals.
- Offline validation: `scripts/validate-built-site.mjs`, `src/helpers/build-validation.test.ts`, `package.json`, the existing `src/data/content-quality.test.ts`.
- Product presentation: `src/pages/index.astro`, `Hero.astro`, `Nav.astro`, `Footer.astro`, `src/data/tools.ts` site description/tagline only.
- Tool and schema cleanup: `ToolLayout.astro`, `CategoryPage.astro`.
- Handoff/QA hygiene: `README.md`, `AGENTS.md`, this report, `.gitignore`, `eslint.config.js`.

Publishing metadata is intentionally separate from the browser search/tool registry, so no new policy fields were needed in the client-facing Tool interface. Existing tool implementations, routes, locale content, redirects, robots.txt, security headers, ads.txt and dependency versions remain unchanged.

## Complete route migration table

Every route below is retained at the same address. No redirects were added. Index/noindex and sitemap columns show **before → after**. All routes use self-canonicals after the two error-page corrections described above. Ad-loader membership is unchanged per route and enforced by the frozen regression fixture.

| Route | Robots | Sitemap | Hub / tier |
| --- | --- | --- | --- |
| / | index → index | yes → yes | study-assignment / core |
| /404.html | noindex → noindex | no → no | utility / utility |
| /500.html | noindex → noindex | no → no | utility / utility |
| /about/ | index → index | yes → yes | reference / legacy |
| /blog/ | index → index | yes → yes | reference / legacy |
| /blog/10-free-online-tools-2026/ | index → index | yes → yes | reference / legacy |
| /blog/csv-to-json-delimiters-quotes-headers/ | index → index | yes → yes | reference / legacy |
| /blog/decode-jwt-vs-verify-signature/ | index → index | yes → yes | reference / legacy |
| /blog/free-online-tools-guide-2026/ | index → index | yes → yes | reference / legacy |
| /blog/image-compression-resizing-format-conversion/ | index → index | yes → yes | reference / legacy |
| /blog/image-compressor-browser-only/ | index → index | yes → yes | reference / legacy |
| /blog/javascript-regex-flags-groups-mistakes/ | index → index | yes → yes | reference / legacy |
| /blog/json-formatting-validation-edge-cases/ | index → index | yes → yes | reference / legacy |
| /blog/verify-browser-tool-no-upload/ | index → index | yes → yes | reference / legacy |
| /blog/wcag-contrast-ratios-examples/ | index → index | yes → yes | reference / legacy |
| /blog/why-pdfs-compress-differently/ | index → index | yes → yes | reference / legacy |
| /categories/ | index → index | yes → yes | reference / legacy |
| /categories/calculators/ | index → index | yes → yes | reference / legacy |
| /categories/converters/ | index → index | yes → yes | reference / legacy |
| /categories/design-tools/ | index → index | yes → yes | reference / legacy |
| /categories/developer-tools/ | index → index | yes → yes | reference / legacy |
| /categories/pdf-tools/ | index → index | yes → yes | reference / legacy |
| /categories/seo-tools/ | index → index | yes → yes | reference / legacy |
| /categories/text-tools/ | index → index | yes → yes | reference / legacy |
| /contact/ | index → index | no → no | reference / legacy |
| /es/ | index → index | no → no | reference / legacy |
| /es/about/ | index → index | no → no | reference / legacy |
| /es/categories/ | index → index | no → no | reference / legacy |
| /es/categories/converters/ | index → index | no → no | reference / legacy |
| /es/categories/design-tools/ | index → index | no → no | reference / legacy |
| /es/categories/developer-tools/ | index → index | no → no | reference / legacy |
| /es/categories/pdf-tools/ | index → index | no → no | reference / legacy |
| /es/categories/text-tools/ | index → index | no → no | reference / legacy |
| /es/contact/ | index → index | no → no | reference / legacy |
| /es/faq/ | index → index | no → no | reference / legacy |
| /es/privacy-policy/ | index → index | no → no | reference / legacy |
| /es/standards/ | index → index | no → no | reference / legacy |
| /es/terms-and-conditions/ | index → index | no → no | reference / legacy |
| /es/tools/ | index → index | no → no | reference / legacy |
| /es/tools/character-counter/ | index → index | no → no | writing / core |
| /es/tools/color-contrast-checker/ | index → index | no → no | more-tools / legacy |
| /es/tools/csv-to-json/ | index → index | no → no | more-tools / legacy |
| /es/tools/epoch-converter/ | index → index | no → no | more-tools / legacy |
| /es/tools/grammar-checker/ | index → index | no → no | writing / core |
| /es/tools/image-compressor/ | index → index | no → no | documents / core |
| /es/tools/image-cropper/ | index → index | no → no | documents / core |
| /es/tools/image-resizer/ | index → index | no → no | documents / core |
| /es/tools/json-formatter/ | index → index | no → no | more-tools / legacy |
| /es/tools/json-to-csv/ | index → index | no → no | more-tools / legacy |
| /es/tools/jwt-decoder/ | index → index | no → no | more-tools / legacy |
| /es/tools/markdown-to-html/ | index → index | no → no | more-tools / legacy |
| /es/tools/password-generator/ | index → index | no → no | more-tools / legacy |
| /es/tools/pdf-compressor/ | index → index | no → no | documents / core |
| /es/tools/pdf-merger/ | index → index | no → no | documents / core |
| /es/tools/qr-code-generator/ | index → index | no → no | documents / core |
| /es/tools/regex-tester/ | index → index | no → no | more-tools / legacy |
| /es/tools/unit-converter/ | index → index | no → no | more-tools / legacy |
| /es/tools/word-cloud-generator/ | index → index | no → no | writing / legacy |
| /es/tools/word-counter/ | index → index | no → no | writing / core |
| /faq/ | index → index | no → no | reference / legacy |
| /favorites/ | noindex → noindex | no → no | utility / utility |
| /hi/ | index → index | no → no | reference / legacy |
| /hi/about/ | index → index | no → no | reference / legacy |
| /hi/categories/ | index → index | no → no | reference / legacy |
| /hi/categories/converters/ | index → index | no → no | reference / legacy |
| /hi/categories/design-tools/ | index → index | no → no | reference / legacy |
| /hi/categories/developer-tools/ | index → index | no → no | reference / legacy |
| /hi/categories/pdf-tools/ | index → index | no → no | reference / legacy |
| /hi/categories/text-tools/ | index → index | no → no | reference / legacy |
| /hi/contact/ | index → index | no → no | reference / legacy |
| /hi/faq/ | index → index | no → no | reference / legacy |
| /hi/privacy-policy/ | index → index | no → no | reference / legacy |
| /hi/standards/ | index → index | no → no | reference / legacy |
| /hi/terms-and-conditions/ | index → index | no → no | reference / legacy |
| /hi/tools/ | index → index | no → no | reference / legacy |
| /hi/tools/character-counter/ | index → index | no → no | writing / core |
| /hi/tools/color-contrast-checker/ | index → index | no → no | more-tools / legacy |
| /hi/tools/csv-to-json/ | index → index | no → no | more-tools / legacy |
| /hi/tools/epoch-converter/ | index → index | no → no | more-tools / legacy |
| /hi/tools/grammar-checker/ | index → index | no → no | writing / core |
| /hi/tools/image-compressor/ | index → index | no → no | documents / core |
| /hi/tools/image-cropper/ | index → index | no → no | documents / core |
| /hi/tools/image-resizer/ | index → index | no → no | documents / core |
| /hi/tools/json-formatter/ | index → index | no → no | more-tools / legacy |
| /hi/tools/json-to-csv/ | index → index | no → no | more-tools / legacy |
| /hi/tools/jwt-decoder/ | index → index | no → no | more-tools / legacy |
| /hi/tools/markdown-to-html/ | index → index | no → no | more-tools / legacy |
| /hi/tools/password-generator/ | index → index | no → no | more-tools / legacy |
| /hi/tools/pdf-compressor/ | index → index | no → no | documents / core |
| /hi/tools/pdf-merger/ | index → index | no → no | documents / core |
| /hi/tools/qr-code-generator/ | index → index | no → no | documents / core |
| /hi/tools/regex-tester/ | index → index | no → no | more-tools / legacy |
| /hi/tools/unit-converter/ | index → index | no → no | more-tools / legacy |
| /hi/tools/word-cloud-generator/ | index → index | no → no | writing / legacy |
| /hi/tools/word-counter/ | index → index | no → no | writing / core |
| /privacy-policy/ | index → index | no → no | reference / legacy |
| /standards/ | index → index | yes → yes | reference / legacy |
| /terms-and-conditions/ | index → index | no → no | reference / legacy |
| /tools/ | index → index | yes → yes | reference / legacy |
| /tools/age-calculator/ | index → index | yes → yes | more-tools / legacy |
| /tools/alt-text-checker/ | index → index | no → no | more-tools / legacy |
| /tools/base64-encoder-decoder/ | index → index | yes → yes | more-tools / legacy |
| /tools/binary-converter/ | index → index | no → no | more-tools / legacy |
| /tools/bmi-calculator/ | index → index | yes → yes | more-tools / legacy |
| /tools/canonical-tag-generator/ | index → index | no → no | more-tools / legacy |
| /tools/case-converter/ | index → index | yes → yes | writing / legacy |
| /tools/character-counter/ | index → index | yes → yes | writing / core |
| /tools/color-contrast-checker/ | index → index | yes → yes | more-tools / legacy |
| /tools/color-converter/ | index → index | yes → yes | more-tools / legacy |
| /tools/color-palette-generator/ | index → index | yes → yes | more-tools / legacy |
| /tools/css-border-radius-generator/ | index → index | no → no | more-tools / legacy |
| /tools/css-minifier/ | index → index | yes → yes | more-tools / legacy |
| /tools/csv-to-json/ | index → index | yes → yes | more-tools / legacy |
| /tools/date-difference-calculator/ | index → index | no → no | more-tools / legacy |
| /tools/discount-calculator/ | index → index | yes → yes | more-tools / legacy |
| /tools/epoch-converter/ | index → index | yes → yes | more-tools / legacy |
| /tools/gradient-generator/ | index → index | yes → yes | more-tools / legacy |
| /tools/grammar-checker/ | index → index | yes → yes | writing / core |
| /tools/hash-generator/ | index → index | no → no | more-tools / legacy |
| /tools/heading-structure-checker/ | index → index | no → no | more-tools / legacy |
| /tools/html-entity-converter/ | index → index | no → no | more-tools / legacy |
| /tools/html-formatter/ | index → index | yes → yes | more-tools / legacy |
| /tools/html-to-markdown/ | index → index | yes → yes | more-tools / legacy |
| /tools/image-compressor/ | index → index | yes → yes | documents / core |
| /tools/image-cropper/ | index → index | yes → yes | documents / core |
| /tools/image-filter/ | index → index | no → no | more-tools / legacy |
| /tools/image-format-converter/ | index → index | no → no | more-tools / legacy |
| /tools/image-resizer/ | index → index | yes → yes | documents / core |
| /tools/image-to-base64/ | index → index | no → no | more-tools / legacy |
| /tools/json-formatter/ | index → index | yes → yes | more-tools / legacy |
| /tools/json-to-csv/ | index → index | yes → yes | more-tools / legacy |
| /tools/json-to-xml/ | index → index | no → no | more-tools / legacy |
| /tools/jwt-decoder/ | index → index | yes → yes | more-tools / legacy |
| /tools/keyword-density-checker/ | index → index | yes → yes | more-tools / legacy |
| /tools/lbs-to-kg-converter/ | index → index | no → no | more-tools / legacy |
| /tools/loan-calculator/ | index → index | yes → yes | more-tools / legacy |
| /tools/lorem-ipsum-generator/ | index → index | yes → yes | writing / legacy |
| /tools/markdown-to-html/ | index → index | yes → yes | more-tools / legacy |
| /tools/meta-tag-generator/ | index → index | yes → yes | more-tools / legacy |
| /tools/mortgage-calculator/ | index → index | no → no | more-tools / legacy |
| /tools/number-to-words/ | index → index | no → no | more-tools / legacy |
| /tools/open-graph-preview-generator/ | index → index | no → no | more-tools / legacy |
| /tools/palindrome-checker/ | index → index | no → no | writing / legacy |
| /tools/password-generator/ | index → index | yes → yes | more-tools / legacy |
| /tools/password-strength-checker/ | index → index | no → no | more-tools / legacy |
| /tools/pdf-compressor/ | index → index | yes → yes | documents / core |
| /tools/pdf-merger/ | index → index | yes → yes | documents / core |
| /tools/pdf-splitter/ | index → index | yes → yes | documents / core |
| /tools/pdf-to-images/ | index → index | no → no | documents / core |
| /tools/pdf-to-text/ | index → index | yes → yes | documents / core |
| /tools/percentage-calculator/ | index → index | yes → yes | study-assignment / core |
| /tools/plagiarism-checker/ | index → index | yes → yes | writing / legacy |
| /tools/qr-code-generator/ | index → index | yes → yes | documents / core |
| /tools/random-number-generator/ | index → index | no → no | more-tools / legacy |
| /tools/readability-score/ | index → index | yes → yes | writing / legacy |
| /tools/regex-tester/ | index → index | yes → yes | more-tools / legacy |
| /tools/reverse-text/ | index → index | no → no | writing / legacy |
| /tools/robots-txt-generator/ | index → index | no → no | more-tools / legacy |
| /tools/schema-markup-generator/ | index → index | yes → yes | more-tools / legacy |
| /tools/seo-length-checker/ | index → index | no → no | more-tools / legacy |
| /tools/serp-preview-generator/ | index → index | yes → yes | more-tools / legacy |
| /tools/sitemap-generator/ | index → index | yes → yes | more-tools / legacy |
| /tools/slug-generator/ | index → index | no → no | writing / legacy |
| /tools/sql-formatter/ | index → index | yes → yes | more-tools / legacy |
| /tools/temperature-converter/ | index → index | yes → yes | more-tools / legacy |
| /tools/text-analyzer/ | index → index | yes → yes | writing / legacy |
| /tools/text-diff/ | index → index | yes → yes | writing / legacy |
| /tools/text-humanizer/ | index → index | yes → yes | writing / legacy |
| /tools/text-summarizer/ | index → index | no → no | writing / legacy |
| /tools/tip-calculator/ | index → index | no → no | more-tools / legacy |
| /tools/unit-converter/ | index → index | yes → yes | more-tools / legacy |
| /tools/url-encoder-decoder/ | index → index | yes → yes | more-tools / legacy |
| /tools/uuid-generator/ | index → index | yes → yes | more-tools / legacy |
| /tools/word-cloud-generator/ | index → index | yes → yes | writing / legacy |
| /tools/word-counter/ | index → index | yes → yes | writing / core |
| /tools/yaml-to-json/ | index → index | no → no | more-tools / legacy |
