# Text Humanizer retirement proposal

Prepared 2026-09-27 at the owner's request. This is a concrete proposal, not an implemented removal.

## Decision

Retire `/tools/text-humanizer/` with a genuine HTTP 404 response. No equivalent replacement has been established. Do not redirect to Grammar Checker, Text Similarity Checker, a category or the homepage. Keep the current route until this migration is explicitly approved.

Reason: live casual-mode conversion changed `I will not attend.` into `Here's the thing: i willn't attend.`. The implementation uses broad phrase substitutions and filler insertion rather than reliable rewriting. The owner selected a retirement proposal rather than a narrow rebuild. This is not a claim that every rewriting tool is unsuitable or that Google named this page in its rejection.

## Exact intended changes after approval

1. Remove `src/pages/tools/text-humanizer.astro` and `src/components/tools/TextHumanizer.tsx`.
2. Remove its single registry record in `src/data/tools.ts` and its policy entry in `src/data/page-policies.json`.
3. Audit generated directory/category/search/related-tool links, and remove stale references. These are largely derived from the registry. Verify any hard-coded counts before changing them; Spanish/Hindi still have 20 localized tools each.
4. Check `FavoritesPage.tsx` with a previously saved slug. A retired favorite must be ignored or labelled unavailable, never link users to a supposed replacement tool. Do not delete users' unrelated saved favorites.
5. Add a retirement manifest and targeted build-test expectations. Preserve the original Phase 1, post-Phase-2 and Phase 3 protection fixtures as historical evidence. Do not rewrite those fixtures to erase the old route.
6. Remove the URL from the generated sitemap through the policy change. Keep the remaining URLs' indexing, canonicals and advertising membership unchanged.
7. Use the existing custom 404 handling after the static route is removed. Do not add a 200 rewrite, a homepage redirect or a JavaScript redirect. Verify the actual Cloudflare response code in an authorized preview and, separately, after an authorized production deployment. A local preview alone is insufficient proof of hosting behavior.

## Expected inventory change

| Measure | Before | After |
| --- | ---: | ---: |
| Tools | 83 | 82 |
| Generated pages | 191 | 190 |
| English pages | 123 | 122 |
| Spanish / Hindi pages | 34 / 34 | 34 / 34 |
| Indexable page directives | 188 | 187 |
| Existing noindex pages | 3 | 3 |
| Sitemap URLs | 89 | 88 |
| AdSense-loader members | 117 | 117 |

Text Humanizer already has `adEligible: false`. All six student tools and nine Phase 3 pages remain ad-ineligible. No AdSense configuration or verification-method change is needed.

## Evidence still needed before execution

- Privately examine whatever page-level demand, backlinks and referrals are available. No such performance evidence has been reviewed in this task. Missing data is not zero demand.
- Confirm this exact removal and its intentional route/indexing delta with the owner.
- Test saved favorites, search results, related links and the complete generated route set; test the hosting response rather than relying on route deletion alone.

If demand warrants a replacement later, design that product independently and reassess the old URL's intent. Do not launch a placeholder to keep the URL alive.

Google treats a persistent 404/410 as removed content; permanent redirects serve genuine replacement destinations. [HTTP status guidance](https://developers.google.com/crawling/docs/troubleshooting/http-status-codes), [redirect guidance](https://developers.google.com/search/docs/crawling-indexing/301-redirects).
