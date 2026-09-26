# Post-deployment measurement procedure

This is a checklist for a future, explicitly authorized deployment. It does not schedule monitoring, publish changes or request any advertising review.

## Keep evidence private

Store Search Console exports, query tables, traffic/ranking metrics and performance history outside the public repository, or under ignored `.private/search-console/`. Do not copy private numbers into public reports, fixtures, commit messages, issues or pull requests. The repository should contain procedures and implementation evidence only.

Keep release evidence separate from content-review dates. Record the exact deployed commit, production deployment ID, completion timestamp and timezone from the matching deployment record. A local implementation/review date is not a production release timestamp. If an exact timestamp is unavailable, leave it unknown rather than substituting an unrelated check timestamp.

## At deployment

1. Verify live status, canonical URLs, robots, internal links and sitemap membership for the released pages. Compare existing route, indexing and advertising membership against the approved baseline.
2. Check live `/ads.txt` separately. The offline build validates `dist/ads.txt` without network access; the production check must never be a build prerequisite.
3. Record the production release evidence privately and retain the exported pre-release baseline unchanged. Use reporting timezone and complete reporting dates when selecting before/after periods.
4. Confirm the existing sitemap index is accessible and inspect its Search Console status. Any submission/indexing actions require their own appropriate authorization; no mass requests or advertising review are part of this procedure.

## Monitor defined page cohorts

Track these six Phase 2 URLs individually: `/tools/attendance-calculator/`, `/tools/sgpa-calculator/`, `/tools/cgpa-calculator/`, `/tools/marks-percentage-calculator/`, `/tools/required-marks-calculator/`, `/tools/image-to-pdf/`.

Track the nine Phase 3 hubs/workflows separately from those tools and from legacy English/Spanish/Hindi pages. Preserve normal access to legacy utilities and use changes in their signals for investigation, not automatic noindexing.

For each cohort/URL, capture indexing state and selected canonical where available, impressions, clicks, CTR, average position, exposed queries, country and device. Record property, search type, filters, date range, report timezone and export date with each export. Keep Web and Image search types separate.

Use page-level totals separately from query/segment tables. Missing/anonymized query rows do not establish zero demand; never invent clicked queries. CTR is clicks divided by impressions, and unrelated row percentages/positions should not be averaged without their proper denominators and aggregation definitions.

## Review cadence and decisions

Start with a technical/indexing checkpoint, then use complete weekly windows to identify discovery problems. Review an initial complete 28-day post-release period and a comparable later period when useful. These are observation intervals, not promises of adequate volume or ranking improvements.

Compare matching pages, filters and periods. Newly released pages have no pre-release performance baseline. Use recurring observed query intent to decide whether to improve an existing page or propose supporting content later. Sparse samples call for more observation, not assumed keyword demand or an automatic Phase 4 content expansion.

Keep unrelated legacy opportunities in a private backlog for separate review. This procedure creates no automation, reminder, Phase 4 article or AdSense review request.

Reference: [Search Console performance filtering](https://support.google.com/webmasters/answer/17011165?hl=en).
