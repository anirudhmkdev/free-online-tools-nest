# Demand-based discovery cleanup — local verification

Implemented and locally verified 2026-10-04 in the existing checkout on `codex/accessibility-hardening`, based on `a81cc981a26ae144a7442d5702577e65c78a3fba`. The subsequent commit and branch push were authorized separately. The results below describe the initial verification before the separately authorized main merge. See [main-integration-verification.md](main-integration-verification.md) for combined verification with newer main quality repairs. No deployment command, indexing request or advertising change was performed during local verification. Pre-existing changes to `skills-lock.json` and the two untracked quality-planning documents were retained outside the implementation commit.

## Result and scope

The separate slug-only registry `src/data/tool-discovery.ts` selects exactly 25 primary tools. The remaining 58 tools stay in the catalogue and keep their URLs. Homepage, directory and category views use server-rendered native More tools disclosures. All tools remain searchable; empty searches show primary entries and entered searches include the full catalogue. Secondary matches open the disclosure; clearing restores its prior state. Favorites and workflow destinations are retained. Existing Spanish/Hindi availability remains 20 tools per language, partitioned into 14 primary and six secondary; no translations or routes were fabricated.

| Collection | Primary slugs |
| --- | --- |
| Writing | word-counter, character-counter, lorem-ipsum-generator, grammar-checker, readability-score, word-cloud-generator |
| Code and formats | json-formatter, html-formatter, regex-tester, markdown-to-html, sql-formatter |
| SEO | robots-txt-generator, seo-length-checker, canonical-tag-generator, alt-text-checker, serp-preview-generator |
| Images and PDF | image-compressor, image-resizer, pdf-merger, pdf-compressor |
| Calculators | age-calculator, random-number-generator |
| Other utilities | epoch-converter, qr-code-generator, color-contrast-checker |

The `#study-assignment-tools`, document and writing anchors remain valid, including native access to the student section inside More tools without JavaScript. The original directory `tools-grid` ID is retained. Reduced prominence is not removal or noindex.

## Correctness and measurement

All 83 tool components call the shared semantic telemetry hook. Completion is established in live result effects, validated button handlers or awaited file-generation branches. The controller deduplicates starts and successes for the document visit and gates transmission to production hostnames. Fixed event fields, analytics failure isolation and future measurement procedure are documented in [tool-action-measurement.md](tool-action-measurement.md).

Promoted-tool repairs include month-end age arithmetic with a stated clamped-anniversary convention; HTML entity escaping, preformatted/raw text and inline spacing; SQL quoted values and comments; unrounded contrast thresholds; English readability input guards and raw formulas; strict Epoch calendar fields; and unbiased bounded integer generation with complete unique requests. The live timestamp's hydration suppression is limited to that changing numeric node. PDF save modes now describe structural rewriting rather than fictitious percentage or quality settings. Image, PDF, grammar and snippet copy states actual limits. Primary PDF rewriting/merging rejects unsupported encrypted documents instead of ignoring encryption.

Validity repairs also reject malformed CSV quotes/headers/rows, invalid JWT JSON, invalid JSON conversion inputs, invalid PDF split ranges, and invalid SEO/schema field values. PDF-to-text distinguishes image-only documents without OCR; summary selection respects requested occurrences. These are scoped repairs needed for trustworthy completion signals, not an exhaustive certification of every secondary algorithm. Historical secondary quality concerns, including MD5, CSS minification, YAML and Text Humanizer, remain for separate quality review.

All six retained supporting articles received editorial examples/limitations and dated local review evidence. Corresponding English tool pages link to them. The shared article header shows a review date only when the policy has dated reviewed evidence. Original publication dates and JSON-LD publication/modification dates were retained; no review date was presented as a production release timestamp.

## Executed checks

| Check | Result |
| --- | --- |
| Complete Vitest suite | 24 files, 261 tests passed |
| ESLint | Passed; 18 existing unused-variable/import warnings |
| Astro/TypeScript | Passed; zero errors, 18 unused-variable/import hints |
| Complete `npm run build` | Passed; 191 generated pages, offline validation passed |
| Frozen route/sitemap/integration checks | 191 routes, 89 sitemap URLs, exactly the original 117 AdSense-loader members |
| Indexing/canonical/redirect/link/hreflang/JSON-LD/ads.txt | Offline validator passed |
| Frozen fixture changes | None; both route fixtures and organic-protection evidence remain unchanged |
| Discovery browser cases | 25 passed: counts, full search, localized subsets, keyboard, anchors, mobile overflow and native no-JavaScript access |
| Random-generator browser cases | Six passed: invalid decimals/unique requests/count limits, recovery, complete unique output and mobile layout |
| Semantic browser operations | 18 passed: counter, formatters, calculator, generator, checkers, PDF/image/QR generation, invalid inputs, reset/aborted processing, repeat deduplication, payload fields, locale, unavailable analytics and local-host exclusion |
| Default-output browser probes | All 83 English tool pages checked for zero mount/default events and runtime errors |
| Git whitespace check | Passed |

The semantic browser checks use locally built output with production hostnames intercepted to localhost. All external requests are blocked. They demonstrate local integration and gating without sending events to production GA4. They do not establish that production reporting, consent settings or deployment delivery work. User Analytics/Search Console tabs were not modified during implementation verification.

The first integrated run exposed outdated search/guide-link test expectations and one unnecessary TypeScript directive, which were corrected. Browser harness selectors were narrowed to actual tool controls. A final browser attempt overlapped build output replacement and was rerun after the build completed. Earlier failed attempts are not recorded as passed checks.

## Protection of approved changes

`src/data/demand-cleanup-content-delta.json` separately records the final approved content/source hashes and reasons for this stage. The original Phase 1/2/3 fixtures were not rewritten. The validator continues to enforce canonical/indexing and exact advertising membership, and rejects indexing/canonical overrides in content deltas. Regression tests verify that unapproved later content/source changes still fail protection. The delta covers discovery copy, truthful primary-tool corrections, related tool descriptions, guide links and the conditional editorial header.

Detailed historical analytics, private baseline, fixtures, browser scripts/results/screenshots, final logs and the empty 83-row retirement matrix are under ignored `.private/`. Tracked files contain procedures and local implementation evidence only. Ignored private evidence and external skill files are excluded from lint/type-check inputs; application code remains checked.

## Loading assessment and limits

Three isolated Chrome contexts per page/viewport measured the static local preview with no CPU/network throttle and external fonts, advertising and analytics blocked. These are local first-party measurements, not field Core Web Vitals or a production speed comparison.

| Page | HTML bytes / gzip bytes | Desktop median LCP | 390 px median LCP |
| --- | ---: | ---: | ---: |
| Homepage | 108,112 / 20,998 | 204 ms | 188 ms |
| Directory | 153,692 / 25,811 | 332 ms | 200 ms |

All sampled layout-shift values were zero, no long tasks were observed in the sampled load window, and no horizontal overflow appeared. All secondary entries remain in server-rendered HTML and search data. Hiding catalogue clutter does not itself reduce download bytes, and no before/after speed improvement is claimed. Production loading and real-user interaction performance remain separate post-deployment checks.

The 90 completed days of observation start only after a separately authorized deployment and recorded production event validation. No release timestamp or retirement date has been invented. Subsequent removal requires the specific evidence and migration list described in the measurement procedure.
