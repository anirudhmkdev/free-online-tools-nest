# Tool action measurement and later retirement review

Discovery and publishing are separate. `src/data/tool-discovery.ts` holds the approved 25 primary slugs; the other 58 remain accessible through native More tools disclosures, search, categories, Favorites and their existing URLs. This stage preserves every route and indexing decision. It does not establish that secondary tools are unnecessary.

All 83 tool components use `useToolTelemetry`. The shared session is held in memory for the current document, including island remounts. A meaningful edit or explicit operation emits `tool_start`; a valid produced result emits `tool_success`. Each emits at most once per page visit. Only success is observed use. Zero findings or a false checker result can be successful; a valid rewritten PDF can be larger than its input. Initial outputs, sample loading, resets, blank/invalid inputs, failures and stale or aborted operations do not establish success.

Events are gated to `freeonlinetoolsnest.com` and `www.freeonlinetoolsnest.com`. They use the existing optional GA4 sender and never interrupt processing when it is unavailable or throws. No new storage or input upload is introduced. The custom fields are exactly `tool_slug`, `tool_locale`, `tool_action`, `discovery_tier` and `measurement_version`. Actions come from a fixed vocabulary; no entered text, output, filename, file properties, entered URL or error text enters the event API. Measurement version is `1`. GA4 also collects its existing automatic page context under the site's current configuration.

The client sends eligible events; blocked analytics, consent state, connectivity and reporting delays can prevent recorded observations. These events are not a correctness certification, unique-person count or proof of completion of a wider workflow.

## Review after 90 completed days

Record the actual deployment timestamp privately after deployment is separately authorized. Verify version 1 events on production first. The review starts after 90 complete days following that timestamp, not the local implementation or editorial-review date. Do not schedule from an assumed release date. Keep all exports, queries, detailed counts and history under ignored `.private/`.

For every tool, create a row with slug, discovery tier, available locales, first production availability, reporting window, production page views, starts, successes, search clicks/impressions, internal and external links, quality findings, maintenance costs, workflow dependencies and exposure changes. Export tool events with the fixed version and hostname filters; compare language-combined tool slugs while preserving locale detail. Keep Search Console and GA4 windows and aggregation limitations explicit. Record missing or unavailable evidence separately from zero.

Zero observations support a retirement review only after coverage and exposure are assessed. Secondary placement reduces exposure; new tools have shorter histories. Preserve PDF to Text while its workflows depend on it, and keep newer student and Image to PDF tools available during measurement. Consider Text Humanizer's quality concerns separately from demand. An unavailable metric is not a zero-use result.

Any later removal requires a specific migration list: old URL and language variants, evidence, dependencies, replacement with demonstrated task parity or intentional 410/404 treatment, internal-link changes, canonical/hreflang changes, sitemap changes, Favorites/search handling and post-release verification. Necessary redirects and canonical alternates remain until separately reviewed. Do not mass-noindex or delete based only on Search Console exclusions.

## Supporting article review

The six retained guides received local editorial review on 2026-10-04. CSV and JSON examples state exact expected output and invalid-input limits. JWT uses a harmless unsigned sample and separates decoding from trust. Privacy instructions cover all request types and clearly distinguish source review from deployed network assurance. Contrast examples use unrounded comparisons. PDF structural-rewrite examples record fixture-specific byte sizes and acknowledge that parsing is not a visual equivalence test. Relevant tool pages link to these guides.

Publication timestamps remain as originally recorded. Editorial review dates are visible review metadata and are not emitted as fabricated publication/modification timestamps or JSON-LD `lastReviewed`. No indexing requests were made.
