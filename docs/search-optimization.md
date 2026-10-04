# Search payload optimization — local verification

Reviewed 2026-09-26 on `codex/accessibility-hardening`, after the local accessibility hardening work. This addresses the audit's unnecessarily large global/homepage search payload. No deployment was performed.

## Implementation

`src/data/search.ts` projects the existing published catalog into search-only records during server rendering: type, name, description, icon and destination URL, plus the existing keywords for English homepage matching. It selects the existing locale's published tools/categories and only the six required search UI labels. It does not create new catalog entries or translations.

The existing search island embeds one escaped JSON index in each generated page. A server-only conditional import keeps the full catalog and translation modules out of the search client bundle. The protected base layout remains unchanged. Both the search dialog and homepage search share `src/helpers/search.ts`, which caches the parsed index for that DOM element. Search does not need an additional data fetch or third-party service, and remains available offline after the page loads. The inline JSON serializer escapes `<`, including script-closing sequences.

Homepage keyword matching, ordering and five-result limit are preserved. The dialog retains its name/description matching, ordering and ten-result limit. Spanish and Hindi each retain exactly 20 published tools and five searchable categories; English retains 83 tools and seven categories. The preceding modal keyboard/focus and reduced-motion hardening remains in place.

## Measured payload changes

Measured with the same local production preview, Chromium viewport 390 × 900, browser caching disabled and client islands hydrated. Values are **decoded bytes**, not compressed production transfer sizes. JavaScript totals include first-party `_astro` JavaScript loaded by each page. The comparison excludes CSS, fonts and third-party scripts. The baseline includes the earlier local hardening changes.

| Route | JS before | JS after | JS reduction | HTML before | HTML after | HTML + JS reduction |
|---|---:|---:|---:|---:|---:|---:|
| `/` | 518,340 | 202,823 | 60.9% | 47,174 | 73,923 | 51.1% |
| `/document-tools/` | 514,939 | 199,510 | 61.3% | 45,800 | 72,549 | 51.5% |
| `/es/` | 514,939 | 199,510 | 61.3% | 50,216 | 55,011 | 55.0% |
| `/tools/image-to-pdf/` | 541,997 | 226,568 | 58.2% | 56,964 | 83,713 | 48.2% |

The search-component chunk fell from 89,390 to 4,881 bytes. The former 231,520-byte tool-data chunk is no longer requested by these sampled pages; the shared client search helper is 600 bytes. HTML grows because the compact index is embedded once per page. This avoids a separate fetch and still provides a substantial net reduction on cold page loads. It trades some repeated HTML data on subsequent navigations for smaller client code; no warm-cache bandwidth improvement is claimed.

These numbers demonstrate a payload reduction, not a measured field Core Web Vitals improvement or a Lighthouse score. Existing React runtime cost remains. No premature lazy-loading of the primary homepage search was introduced.

## Verification

- **146 unit tests passed in 10 files**, including seven new search tests covering published locale URLs/categories, the compact record contract, localized labels/descriptions, all existing English keyword queries, ordering/limits, empty and Unicode queries, and safe inline JSON serialization.
- **24 browser assertions passed**: a single shared index, English and localized inventories, absence of editorial fields, homepage keyboard navigation and keyword-only matching, dialog focus containment/restoration and active-option semantics, mobile-menu entry, loaded-page offline search, long Unicode queries, and layout at 320/768/1440 pixels.
- Search also passed a Chromium simulation using **1.5 Mbps download, 150ms latency and 4× CPU slowdown**. This is a functional stress check, not a physical low-end device measurement or a timing benchmark.
- No uncaught application/hydration errors occurred during the browser batch. Dark-theme search screenshots were reviewed at phone and desktop widths.
- Astro check: **0 errors, 0 warnings, 21 existing hints**. Lint of all optimization files: **0 errors or warnings**.
- Build and offline publishing validation passed: **191 pages, 89 sitemap URLs**. Generated AdSense-loader membership remains **117 pages**, with existing frozen membership validation passing.
- Routes, indexing, canonical policy, protected source/content fixtures, dependencies, advertising configuration and ads.txt were preserved. No private Search Console data was used.

An initial test incorrectly expected all seven English categories in each localized search. That expectation was corrected to the existing five-category pilot; no localized catalog was expanded. An initial base-layout edit was rejected by the publishing gate and removed. The final implementation does not relax the gate or rewrite its fixtures.

Local measurement scripts/results and screenshots are ignored under `output/playwright/`: `optimize-measure.js`, `optimize-before.txt`, `optimize-after.txt`, `optimize-browser.js`, and `optimize-browser-results.txt`. Physical mobile devices, Safari/Firefox, screen readers and field performance remain untested.

The work remains local alongside the preceding hardening changes; the unrelated `skills-lock.json` modification is excluded from this task. No commit, push, merge, deployment or AdSense review was requested or performed. The next visual consistency pass is `$impeccable polish`.
