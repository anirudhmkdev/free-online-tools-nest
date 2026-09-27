# AdSense quality remediation and tool triage plan

Prepared: 2026-09-27. The owner subsequently approved corrective implementation. See [implementation and remaining work](content-remediation-verification.md). Retirements, indexing/advertising changes and deployment remain separate decisions; Text Humanizer is now a retirement proposal rather than a rebuild.

## Recommendation

Repair demonstrably incorrect tools and misleading claims before reducing the catalogue. Concentrate the site on useful student, document and writing tasks while retaining reliable utilities that have a distinct purpose. Do not set a target number of pages to delete or words to add.

The strongest current retirement candidate is the existing Text Humanizer implementation. The clearest repair priorities are Grammar Checker, YAML to JSON and Text Analyzer. Several SEO tools are consolidation candidates; small utilities are not inherently low-value.

The accompanying [83-tool triage](tool-quality-triage.md) covers every English tool and records existing advertising/sitemap flags. It is an inventory-based prioritization, not a claim that all tools passed functional testing. No private Search Console, traffic, usage or backlink evidence was reviewed for retirement decisions.

## Evidence and boundaries

- The supplied AdSense screenshot reports low-value content and ads.txt not found, last updated September 6. It does not establish that Google reviewed the later Phase 2/3 production versions. Obtain the expanded current notice and most recent review date before attributing a rejection to today's site.
- The preceding live checks found `/ads.txt` returning HTTP 200 with `google.com, pub-7189536685341014, DIRECT, f08c47fec0942fa0`, matching the public loader ID. Account ownership still needs comparison with the publisher ID inside AdSense. A successful public request is not proof of Google's actual crawler access.
- Current planning inventory: 83 tools; existing project baseline 191 generated pages, 89 sitemap URLs and 117 pages with the AdSense loader. Six Phase 2 tools and nine Phase 3 pages remain ad-ineligible.
- Local source inspected at `a81cc981a26ae144a7442d5702577e65c78a3fba` on `codex/accessibility-hardening`. Source findings are identified separately from live tests; do not assume every local UI change is deployed.
- Preserve the unrelated `skills-lock.json` modification. Keep `.private/`, `.agents/`, browser output and Search Console exports untracked. No dependency or AdSense configuration change is part of the initial repair batch.

Google's guidance emphasizes useful original content, accurate service promises and usable navigation, and suggests expanding or consolidating similar pages. It supplies no guaranteed page, word or traffic quota for approval. These findings are our evidence-based remediation priorities, not Google's page-level explanation of the rejection. [AdSense content and user experience](https://support.google.com/adsense/answer/10015918?hl=en)

## 1. Immediate repair queue

| Priority and route | Observed evidence | Proposed action | Acceptance evidence |
| --- | --- | --- | --- |
| P0 `/tools/yaml-to-json/` | Live: `items:` followed by indented `- one` and `- two` returns `{"items":{}}`. Anchors remain literal strings. Registry promises full YAML 1.2, resolved aliases, uploads and automatic conversion. | Stop silent data loss. Correct the supported subset and reject unsupported syntax explicitly. A comprehensive parser replacement is a separate dependency/design decision. Remove nonexistent UI promises immediately. | Basic list returns `{"items":["one","two"]}`. `name: &person Ada` / `copy: *person` either resolves both values to `Ada` under explicitly supported semantics or produces a clear unsupported-feature error with no misleading output. Test nested structures, malformed indentation, quoted colons, inline comments, duplicate keys and resource limits. |
| P0 `/tools/grammar-checker/` | Live: detects repetition in `This is is a draft.`; `She go to school every day.` is declared clean. Promised accept/dismiss controls are absent. | Describe the actual limited rule checks. Replace clean-text assurances with “No issues found by these checks.” Remove claims of comprehensive grammar correction, unsupported sentence analysis and nonexistent controls. Improve rules only with tests. | Repetition detected. Unsupported grammar is never presented as certified correct. Every documented action exists. English, Spanish and Hindi landing-page promises match the tool's actual supported input language. |
| P0 `/tools/text-humanizer/` | Live casual conversion of `I will not attend.` gives `Here's the thing: i willn't attend.` | Prefer retiring this implementation unless a bounded, tested rewriting use case justifies a rebuild. If retained, preserve meaning, capitalization and negation; remove automatic filler and unsupported transformation claims. | Negation preserved; no malformed contractions, invented facts or arbitrary prefacing. Test names, quotations, URLs, punctuation and each tone. A safe output could leave the original unchanged. |
| P1 `/tools/text-analyzer/` | Live interface provides counts, timing estimates and case conversion. Registry/FAQ and live title promise readability; source lacks promised readability and word-frequency calculations. | Correct title, steps, FAQ and any dossier claims now. Decide later whether the combined count-and-format workflow is distinct enough to keep. Link to the actual Readability Score tool instead of pretending to compute its results. | `Cats run. Cats sleep.` gives 4 words and 2 sentences; timing assumptions visible. No unsupported readability/frequency promise remains. |
| P1 `/tools/text-summarizer/` | Source uses word-frequency sentence selection. Selection by sentence text can return multiple identical occurrences despite a smaller requested sentence count. | Repair selection by sentence identity/index. Explain extractive English-oriented heuristics and meaning/context limitations. Retain only if tests show a useful, distinct workflow. | Repeated identical input sentences never cause output to exceed the requested count. Output consists of original sentences in source order. Empty input, abbreviations, unsupported languages and punctuation-only text handled honestly. |
| P1 `/tools/seo-length-checker/` | Copy guarantees full snippet display after indicators turn green; limits and pixel widths are heuristics. | Remove display/ranking guarantees. Label character guidance and estimated previews as approximate. Consider merging into Meta Tag Generator later. | Long/wide characters and narrow characters demonstrate estimation limits; page never promises how Google will display or rewrite a result. |

For each repair, check all six claim surfaces: tool interface, title/description, long description, usage steps, FAQs and quality dossier. Check related guides, hub/workflow recommendations and localized records for copied promises as well.

## 2. Weak supporting pages

| Route or page group | Assessment | Proposed action |
| --- | --- | --- |
| `/blog/free-online-tools-guide-2026/` | Source still says 77 tools and makes absolute security/privacy and performance claims, including “no risk” of data breaches. Broad promotional content adds limited help beyond the directory. | Rewrite in place around concrete, tested decisions or nominate for retirement after checking demand and links. Remove absolute security, offline and speed guarantees. Do not fabricate usage experience or benchmarks. |
| `/blog/10-free-online-tools-2026/` | Generic roundup includes first-person daily-use framing and feature/performance claims needing verification. | Verify each recommendation with an actual task and observed result. Confirm authorship with the maintainer or remove first-person assertions. If no distinct value remains beyond the directory, retire with an approved route decision. |
| Remaining nine task-specific blog posts | Specific topics provide a better basis for useful guidance; not all were fully retested in this assessment. | Retain pending example, source and tool-link checks. Preserve the difference between choosing compression/resizing/format conversion and understanding browser compression. Merge only if their actual task intent duplicates. |
| Four hubs versus seven category inventories | Different purposes were intentionally established: decision guidance versus inventories. | Keep. Recheck that each decision guide contains useful selection criteria and that recommended tools actually deliver them. Do not change legacy category indexing. |
| Five workflows | Useful only while every recommended step works. | Keep; execute each workflow end to end with synthetic inputs, especially writing workflows affected by repairs. Update broken recommendations in place. |
| About, Contact, Editorial Standards, Privacy, Terms and FAQ | Utility/trust pages; short length is not evidence they should be removed. | Check real ownership/contact information, support paths and truthful processing disclosures. Use only maintainer-supplied identity or credentials. Distinguish local input processing from analytics/advertising network activity. |
| Spanish/Hindi pages | 20 localized tools per language; neither full catalogue availability nor comprehensive input-language support may be assumed. | Audit translated promises and actual functionality. Correct equivalent false claims alongside English changes. Do not bulk-remove languages or change their existing indexing. |
| Favorites and error pages | Functional pages with existing noindex treatment. | Keep existing behavior. No “content expansion” needed for an error screen. |

## 3. Consolidation and retirement candidates

These are conditional product decisions, not authorized removals. Being absent from the sitemap does not mean a page is noindex or unused.

| Candidate | Preferred destination or outcome | Condition before any removal |
| --- | --- | --- |
| Text Humanizer | Retire current implementation or rebuild narrowly; no equivalent redirect target established. | Confirm demand/links, assess a feasible useful replacement and approve the exact URL outcome. Do not redirect to Grammar Checker merely because both handle writing. |
| SEO Length Checker, SERP Preview Generator, Open Graph Preview Generator | Potentially consolidate into existing `/tools/meta-tag-generator/`. | Compare actual controls, previews, exports and mobile use. Destination must support every retained task before source routes redirect. Distinct search intent may justify keeping a route. |
| Canonical Tag Generator | Potentially integrate with Meta Tag Generator. | Preserve its hreflang controls and validate generated tags; not feature-equivalent today merely because both output a canonical tag. |
| Lbs to Kg Converter | Potentially use `/tools/unit-converter/` with a functioning lb-to-kg preset. | Preserve precision, direction switching and accessible direct entry. 100 lb must yield 45.359237 kg before display rounding. No redirect to an unrelated default mode. |
| Temperature Converter | Keep unless consolidated interface is equally useful. | Preserve Celsius/Fahrenheit/Kelvin outputs, formulas and absolute-zero handling. Dedicated intent may justify a separate page. |
| Text Analyzer | Retain with corrected scope, or consolidate only after its combined workflow is reproduced. | Word Counter alone is not a full substitute for the current case conversion controls. Do not remove the separate Readability Score page without independent reason. |
| Text Summarizer | Repair first; retire if its bounded results remain unreliable or undifferentiated. | No obvious equivalent destination. An extractive tool can be useful if presented accurately. |
| Palindrome Checker, Reverse Text, Image Filter, CSS Border Radius Generator | Optional maintenance pruning candidates. | These have legitimate small use cases; defects or lack of demand have not been established. Keep if useful to users. Never label them proven causes of rejection. |

Retain developer utilities such as UUID, hash, Base64, JSON/CSV, QR and slug tools by default. Simplicity and being outside the student focus are insufficient grounds for deletion. Keep all six student tools and core document/writing tools, subject to normal verification.

Before approving any retirement, privately review available Search Console page/query trends, backlinks, referrals and privacy-safe aggregate use over a meaningful period, accounting for new-page age. Missing data means unknown demand, not zero demand. Compare maintenance cost, accuracy, uniqueness and replacement quality. Do not collect tool inputs for analytics.

## 4. Implementation order after approval

### Batch A — baseline and claim repairs

1. Start an isolated `codex/content-quality-remediation` branch from verified latest `main`; compare any unmerged UI work before reuse. Record deployed commit/time and keep screenshots/account data private.
2. Compare the public publisher ID with AdSense, record the current detailed notice and review date, then use the separate ads.txt update check if appropriate. Do not invent verification tags or request a content review. [Google's ads.txt update procedure](https://support.google.com/adsense/answer/12171612?hl=en#check-for-updates)
3. Add focused failing logic tests for the confirmed defects, then correct YAML data loss and writing-tool behavior/copy. Complete each tested repair as a separate reviewable commit. Do not build a comprehensive YAML parser from scratch under a “copy fix.”
4. Correct the two promotional articles and unsupported privacy, offline, speed and SEO claims. Verify rather than pad content.
5. Audit all 117 current loader-member pages, grouped by shared tool implementation but with page-specific and localized copy checks. Give Grammar Checker and Text Analyzer first priority. Do not treat dossier presence or a recorded date as proof of quality.

Expected files for this batch, limited to demonstrated needs:

- `src/components/tools/GrammarChecker.tsx`, `TextHumanizer.tsx`, `TextAnalyzer.tsx`, `TextSummarizer.tsx`, `YamlToJson.tsx`, `SeoLengthChecker.tsx`.
- `src/data/tools.ts`, `src/data/tool-quality.ts`, and affected records in `src/data/localized.ts`.
- Pure logic helpers and corresponding tests under `src/helpers/` for repaired YAML parsing and sentence selection; final extraction boundaries determined during implementation.
- `src/content/blog/free-online-tools-guide-2026.md` and `src/content/blog/10-free-online-tools-2026.md`.
- Relevant records in `src/data/hubs.ts`, `src/data/workflows.ts`, `src/data/content-page-quality.ts` only if a recommendation or evidence entry changes.
- `src/data/page-policies.json` only for supported review metadata/intent updates in this batch; preserve indexing, sitemap and advertising flags.
- `scripts/validate-built-site.mjs` and targeted tests only where an explicitly approved correction requires a scoped expectation. Preserve original fixtures, including `pre-pivot-routes.json`, `post-phase-2-routes.json` and `phase-3-organic-protection.json`. Add a separate reviewed content-change manifest rather than replacing frozen evidence or weakening validation globally.

### Batch B — verify and strengthen retained tools

For each retained tool: document one real user task, check every advertised feature, add reproducible input/output examples and failure examples, explain limitations and processing behavior, record what was actually reviewed and when. Mathematical tools show formulas and rounding. Parser/generator tools state their supported syntax. PDF/image tools explain scanned/encrypted/unsupported input and application guardrails.

Prioritize reliability over more pages. Review BMI and loan/mortgage assumptions with appropriate authoritative sources before making health or financial claims. Inspect whether PDF compression and grammar/similarity tools promise capabilities their algorithms cannot provide. These are audit targets, not additional confirmed failures.

Create meaningful unit tests for pure logic, then browser tests of documented actions, malformed input, error recovery, keyboard use and mobile layout. Reuse synthetic fixtures; never use private student documents or uploaded credentials.

### Batch C — optional consolidation, separately approved

Produce a concrete migration table for selected URLs: current route, retained features, destination, status code, locale implications, old/new sitemap membership and advertising implications. Implement replacements before retiring sources.

Use permanent 301/308 redirects for genuine equivalent replacements. Where no equivalent exists, use a real 404/410 response after approved retirement, not a homepage redirect or an error message served as HTTP 200. Test actual hosting behavior, not just local redirects. Update internal links, search, directory counts, favorites handling, sitemap, canonical/hreflang and relevant metadata. [Google's redirect guidance](https://developers.google.com/search/docs/crawling-indexing/301-redirects)

Potential files: selected individual routes under `src/pages/tools/`, matching components, `public/_redirects`, `src/data/tools.ts`, `src/data/page-policies.json`, affected localized/navigation/search registries and an explicit migration manifest with tests. Determine exact deletions only after selecting candidates and checking feature parity. Never bulk-delete pages based on this triage.

Removed pages returning 404/410 are eventually removed from Google's index; returning an error message with HTTP 200 can produce a soft 404. Noindex is not a substitute for repairing misleading functionality or advertising-policy compliance. [Google's HTTP status guidance](https://developers.google.com/crawling/docs/troubleshooting/http-status-codes)

This batch changes the frozen route/indexing baseline and therefore needs explicit scope approval. If an approved retired route currently loads AdSense, its loader-membership delta also needs explicit approval; do not silently preserve a stale count or change advertising policy. All six student tools and nine Phase 3 pages remain `adEligible: false`.

### Batch D — verification and separately authorized release

- Run `npm run test`, `npm run lint`, `npm run check`, `npm run build` (including offline generated-site validation).
- Until an approved migration, preserve 191 pages, 89 sitemap URLs, current indexing and the exact 117 loader members. Validate IDs/membership, not counts alone. New or modified sitemap-eligible pages must be indexable, self-canonical, non-redirecting and successfully generated.
- Test changed tools and every linked workflow on desktop/mobile. Review actual outputs manually; automated passing checks cannot prove editorial quality.
- Build must validate local `dist/ads.txt` without a network dependency. After an authorized deployment, separately verify live `/ads.txt`, status/headers, affected routes and representative tool results. Record production commit/time.
- Publish only after a separate release authorization. Consider an AdSense review only after the verified fixes are live, current account status is understood and the whole result has had a human review. Requesting review remains a separate owner decision; approval cannot be guaranteed.

## Decision requested after this plan

Approve the corrective batches first. Decide Text Humanizer's rebuild versus retirement explicitly. Defer URL removal and SEO-tool consolidation until the feature comparison and private demand review produce a specific migration proposal. No AdSense configuration changes are proposed.
