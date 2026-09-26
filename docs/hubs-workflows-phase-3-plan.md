# Phase 3 plan: hubs and real workflows

Status: approved with amendments below; implementation authorized, no push/merge/deployment. Prepared 2026-09-20.

Branch created: `codex/hubs-workflows-phase-3`, from freshly fetched `origin/main` at `d1ac0edf58dbd2ca9e7e19b2680620a0001650a5` (merged PR #2).

The user approved local implementation and verification on 2026-09-26. Push, merge, deployment, Phase 4 and advertising changes remain outside scope.

## A. Current repository audit

Fresh checks on the branch base:

| Item | Verified result |
|---|---|
| Tool inventory | 83 tools; six Phase 2 additions are English-only |
| Local build | 182 generated pages; offline publishing validation passes |
| Locale pages | 114 English, 34 Spanish, 34 Hindi |
| Indexing directives | 179 indexable, three existing noindex pages |
| Sitemap | 80 URLs |
| AdSense loader membership | Existing 117 pages; all six Phase 2 tools excluded |
| Unit tests | 118 passing tests in six files |
| Proposed routes | None of the nine exists yet |
| Workflow references | No policy currently has a related workflow |

These are fresh repository/build checks, not a new live-production crawl or a claim that Google has indexed 179 pages. The previous production verification is accepted as supplied context. Lint, type checks and browser testing will be repeated during implementation; they were not rerun for this planning-only audit.

Relevant architecture:

- `src/data/page-policies.json` owns indexing, sitemap membership, canonical path, audience, intent, semantic hub, tier, review date/status, advertising eligibility and related guides/workflows.
- `src/data/page-policy.ts` exposes the policy and sitemap filter. `astro.config.mjs` consumes it; there is no reason to introduce a second sitemap allowlist.
- `scripts/validate-built-site.mjs` validates generated output, policy, redirects, sitemap, links/anchors, reciprocal hreflang, JSON-LD syntax, integrations and local `dist/ads.txt`. The build uses no live production requests.
- The frozen `pre-pivot-routes.json` protects 176 Phase 1 routes. `phase-2-additions.json` separately allows the six tools. Preserve both files exactly.
- `Layout.astro` applies the policy, existing analytics/advertising behavior and shared navigation. `SEOHead.astro` already handles canonical URLs, robots and JSON-LD; it truncates long titles/descriptions, so review actual generated metadata for the nine new routes.
- `ToolLayout.astro` renders policy-linked blog guides but does not render `relatedWorkflows`. Extend it with a small English-only contextual block; preserve current tool breadcrumbs, introductions, calculators, FAQs and related guides.
- English navigation/footer currently use homepage toolkit anchors. Localized navigation is separately defined. Preserve the localized branch and its 20 available tools per language.
- There are 11 existing blog articles, including two image-compression articles. Do not rely on historical AGENTS.md sections claiming three articles or older route counts.

Tool behavior that constrains the writing:

- PDF Compressor uses pdf-lib load/save options. It does not downsample embedded images or accept an exact target file size. Output can remain too large or be larger than the original.
- PDF Splitter exports each comma-separated range as a separate PDF. Keeping `1-3,5` produces two files, not one four-page file; use PDF Merger afterward only if one file is required.
- Image to PDF accepts JPEG/PNG and produces an image-based PDF, without OCR. Browser reliability guardrails are application choices, not universal device limits.
- Grammar Checker uses English pattern rules and can make incorrect suggestions. Readability uses English-oriented counting/syllable heuristics. Neither is an academic assessment or a substitute for proofreading.
- Tool handoffs are manual: download the output, then select it in the next tool. These workflow pages will not transfer files, submit assignments, retain drafts or run a hidden processing pipeline.

## B–C. Exact routes, intent and unique value

All nine pages are English-only. Each route has one individual static Astro file.

| Route | File under `src/pages/` | Intended task and unique value beyond an individual tool |
|---|---|---|
| `/student-tools/` | `student-tools.astro` | Choose the right academic calculation from the information available. Explains marks versus points, semester versus cumulative results, and current versus required future results before the user enters unsuitable data. |
| `/document-tools/` | `document-tools.astro` | Choose an operation based on source format, unwanted pages, dimensions or bytes. Separates conversion, extraction, cropping, resizing and compression and explains which operations cannot solve the stated problem. |
| `/writing-tools/` | `writing-tools.astro` | Distinguish length measurement, pattern-based correction, readability and frequency analysis. Helps readers decide which outputs are useful and which require human judgment. |
| `/workflows/` | `workflows/index.astro` | Choose a complete task by starting material and desired outcome. Distinguishes assignment preparation, existing-PDF repair, photographed notes, length review and result calculation, including which steps can be skipped. |
| `/workflows/submit-an-assignment/` | `workflows/submit-an-assignment.astro` | Prepare mixed assignment material for submission. Provides source-dependent branches, writing checks where relevant, final assembly and submission verification; it does not submit to a portal. |
| `/workflows/prepare-pdf-for-upload/` | `workflows/prepare-pdf-for-upload.astro` | Start with an existing PDF and solve page selection, assembly or size problems. Explains separate-range outputs and what to do when compression cannot meet the limit. |
| `/workflows/scan-notes-to-pdf/` | `workflows/scan-notes-to-pdf.astro` | Turn existing photographs/scans into an ordered, legible PDF. Explains capture quality, orientation, optional image cleanup, image order and the absence of searchable text/OCR. |
| `/workflows/check-assignment-length/` | `workflows/check-assignment-length.astro` | Apply a user-supplied counting requirement, distinguish words from characters and review mechanics without treating a score as a grading rubric. Recount after editing. |
| `/workflows/calculate-semester-results/` | `workflows/calculate-semester-results.astro` | Start from the available evidence—marks, course credits/points, semester results or remaining assessment weight—and select a valid calculation. Prevents a fake unified university-result formula. |

The hubs answer “which operation or tool fits?” Workflows answer “how do I finish this task, with my starting material?” Tool pages remain where the actual calculation or file operation happens. No existing route is replaced or redirected.

Each page has a credible distinct purpose, so all nine can be candidates for publication. This is conditional: if a page becomes only a card list or repeats another page during implementation, leave it unpublished, or keep its local draft noindex and outside the sitemap and promotional links. A numerical target is not grounds to approve it.

## D. Hub section structures

### Student Tools

1. H1 and short scope: calculations using the user's own rules, records and targets.
2. “What are you trying to calculate?” Six short decision paths: current attendance → Attendance; semester result from credits/points → SGPA; cumulative result → CGPA; subject marks/maxima → Marks Percentage; score needed in a remaining assessment → Required Marks; ordinary percentage arithmetic → Percentage Calculator.
3. “What information do you have?” List required inputs for each path, including credits or explicitly chosen CGPA weighting. Missing grade mappings/weights means obtain the relevant rules first, not guess.
4. Four compact comparisons: Percentage versus Marks Percentage; SGPA versus CGPA; CGPA versus percentage (no universal conversion); current result versus a future target. Use stacked definition cards, not a wide table.
5. Worked choice: `72/100` and `45/50` are marks, so aggregate `117/150 = 78%`. A course list with credits and points belongs in SGPA instead. A reported CGPA alone does not supply a percentage conversion rule.
6. Next tasks: Calculate Semester Results; conditional assignment and length-preparation links. Contextual Image to PDF/Word Counter references where applicable.
7. Limits, verified example and actual review date/methodology reference.

Core tool list is exactly Attendance, SGPA, CGPA, Marks Percentage, Required Marks and Percentage Calculator. No SEO/developer tools are inserted on the basis of legacy impressions.

### Document Tools

1. H1 and task scope: choose by what you have and what needs changing.
2. Decision paths: photographs → Image to PDF; several PDFs → Merger; unwanted PDF pages → Splitter; PDF above byte limit → Compressor; selectable text needed → PDF to Text; page images needed → PDF to Images; image too large in bytes → Image Compressor; smaller pixel dimensions → Resizer; unwanted image edges → Cropper.
3. Explain dimensions versus file size, crop versus resize, and an image-based PDF versus a text-bearing PDF. Existing scans do not become searchable through PDF to Text or Image to PDF.
4. Operation order and handoffs: optional image cleanup before Image to PDF; keep pages before merge where necessary; measure final PDF after assembly; download/select files manually.
5. Worked choice: a hypothetical portal requires width at most 1200 px and bytes at most 500,000. A 2400 px-wide image needs dimension checking/resizing; a 1000 px-wide, 800,000-byte image needs a byte-size check and potentially compression. Neither condition implies that every operation is needed. Thresholds are example user requirements, not institutional claims.
6. Three workflows: Submit an Assignment, Prepare PDF for Upload, Scan Notes to PDF, with starting-material distinctions.
7. Existing further reading: `/blog/image-compression-resizing-format-conversion/`, `/blog/image-compressor-browser-only/`, and `/blog/why-pdfs-compress-differently/`. Link without editing those articles.
8. Limits and final manual checks: orientation, page order, text legibility, correct file, actual bytes and output format; dated review evidence.

The nine core tools are Image to PDF, PDF Merger, PDF Compressor, PDF Splitter, PDF to Text, PDF to Images, Image Compressor, Image Resizer and Image Cropper.

### Writing Tools

1. H1 and scope: length and basic writing review, not assignment grading.
2. Decision paths: word limit → Word Counter; character limit → Character Counter; common English patterns → Grammar Checker; reading complexity estimate → Readability Score; broader text statistics → Text Analyzer; frequent terms visually → Word Cloud Generator.
3. Four comparisons: words versus characters; grammar versus readability; statistics versus correction; frequency visualization versus correction.
4. Worked comparison: `Research needs clear evidence.` has four whitespace-separated words, 30 characters including spaces and 27 excluding spaces in the current counting convention. The task determines which number matters. Verify these exact outputs against the live tool implementation before publication.
5. Reviewing suggestions: accept or reject each grammar suggestion, treat readability as an approximate signal, and count the revised text again. No guarantee that a portal counts the same way.
6. Check Assignment Length workflow; optional Word Cloud link for inspecting repeated terms without changing that tool's existing positioning.
7. English-language limitations, short-text limitations, human review and dated evidence.

Only the six requested writing utilities appear. No text-humanizer, plagiarism, summarizer or unrelated legacy utility is added merely because it belongs to the text category.

### Workflows directory

1. Explain a workflow as a conditional sequence of separate tools. State that files are selected/downloaded manually and the pages do not submit to portals.
2. “What are you starting with?” Existing final PDF → Prepare PDF for Upload; assignment material in different formats → Submit an Assignment; photographs of notes → Scan Notes to PDF; a text draft → Check Assignment Length; academic records → Calculate Semester Results.
3. For each of exactly five reviewed workflows, show starting inputs, desired outcome, main decision and when to skip it. Do not copy tool descriptions.
4. Clarify overlapping document intents: upload preparation starts with PDFs; notes preparation starts with photos; assignment preparation also includes document assembly and relevant writing checks.
5. Worked triage: one already-correct PDF below the stated portal limit needs final verification, not conversion or merging.
6. Links to the three topical hubs for choosing one operation; dated review evidence. No placeholder future workflows.

## E. Exact workflow decisions and examples

All branches are readable static HTML with headings, lists, links and, where useful, native `details/summary`. Essential decisions stay visible. No client-side wizard, calculator duplication, account, upload endpoint or workflow state store is needed.

### 1. Submit an Assignment

1. Read the user's actual submission requirements: permitted format, page/content rules, byte limit, filename and any word/character limit. Unknown requirements → check the assignment/portal first.
2. A writing draft needs a count? Yes → Word Counter or Check Assignment Length; no → skip. If the source is an editable document, export it to PDF using its original editor; this site does not offer DOCX-to-PDF.
3. Already one valid PDF with the correct pages? Yes → skip Image to PDF and Merger and continue to final checks. If pages are wrong, use the existing-PDF preparation workflow.
4. Images? Check legibility/orientation. Crop only unwanted edges; resize/compress only when needed and recheck readability; convert ordered JPEG/PNG images with Image to PDF.
5. Several PDFs? Select them in PDF Merger in the intended order. A mix of images and PDFs means convert images first, then merge the resulting PDF with the others. A single output already containing everything skips merging.
6. Compare final bytes with the actual portal limit. Within limit → skip compression. Above limit → try PDF Compressor, download and measure again. Still too large → revisit original image dimensions/encoding or permitted content; seek an accepted submission alternative when necessary. Do not silently discard required pages or promise eventual success.
7. Open the final file, check all pages, orientation, legibility, filename and format; upload through the user's portal and confirm its receipt/preview manually.

Worked scenario: three ordered JPEG answer pages plus a one-page PDF cover sheet → Image to PDF makes three pages; Merger with the cover first makes four pages. A final file below the user's example 5,000,000-byte limit skips Compressor. PDF byte size is measured, not a fabricated expected compression result. Also verify the skip-all branch for one already-valid PDF.

### 2. Prepare PDF for Upload

1. Confirm the file is an existing readable PDF and obtain the portal's requirements. An image source belongs in Scan Notes to PDF or Submit an Assignment.
2. Unnecessary pages? No → skip Splitter. Yes → specify pages to retain. A contiguous `1-3` produces one three-page PDF; `1-3,5` produces two outputs under the current tool convention.
3. More than one PDF/output and one file required? Yes → Merger in the desired order; no → skip. Recheck page count and content.
4. Compare bytes with the portal limit. Under/equal → skip compression. Over → try Compressor; open and measure its output. If larger or still over the limit, retain the better valid original/output and revisit the source, allowed content or portal alternatives.
5. Verify filename, actual file type, page order, completeness and legibility in a PDF viewer; upload manually and confirm acceptance. Signed, interactive or otherwise complex PDFs may need the original authoring software; do not claim their features are preserved by these tools.

Worked scenario: a five-page PDF has an unwanted page 4. Split range `1-3,5` → PDFs of three pages and one page. Merge those outputs → one four-page PDF in original retained order. Compression is conditional on the measured final size. Include tests for one already-valid under-limit PDF and for no reduction.

### 3. Scan Notes to PDF

1. Start with existing photographs/scans. This workflow does not operate a scanner or camera. Unreadable or missing content → retake/rescan first.
2. JPEG/PNG? Continue. Unsupported source format → obtain a supported copy with the source device/editor; do not pretend Image to PDF accepts HEIC or supplies a conversion feature it lacks.
3. Unwanted borders? Crop if useful; otherwise skip. Excessively large images? Resize or compress if useful; preserve readable handwriting. Neither operation fixes blurred/missing content.
4. In Image to PDF, confirm orientation, reorder pages, choose supported page/layout options and create the PDF. Explain application guardrails and smaller batches when needed; do not invent universal browser limits.
5. Another PDF must be included? Use Merger; otherwise skip. If a portal size requirement exists, continue to Prepare PDF for Upload for the final byte-size decision.
6. Open every page and check order, orientation, completeness and legibility. This is an image-based PDF: no OCR and no guaranteed searchable/selectable text. PDF to Text is not an OCR workaround.

Worked scenario: three JPEG pages selected as 2, 1, 3 are rearranged to 1, 2, 3 before conversion. Expected result: three image-based PDF pages in the chosen order. No merger is needed unless a separate PDF is actually required. Validate page order visually with numbered synthetic pages.

### 4. Check Assignment Length

1. Obtain the actual rule: words, characters including/excluding spaces, and whether headings, quotations, references or footnotes count. Unknown rule → ask the institution/platform or consult its instructions; do not assume.
2. Get the relevant plain text. Editable draft → copy the intended portion. Existing text-bearing PDF → optionally PDF to Text, then check extraction/order. Image-only scan → transcribe or use an appropriate OCR tool elsewhere; this site does not supply OCR.
3. Word requirement → Word Counter. Character requirement → Character Counter with the relevant metric. Both requirements → check both. No requirement → use only measurements that help the review.
4. Optional basic English mechanics check → Grammar Checker; evaluate suggestions manually. Optional reading-complexity check → Readability Score; do not treat it as accuracy, quality or grade certification.
5. If repetition/statistics need investigation, optionally use Text Analyzer or Word Cloud Generator. These observe patterns; they do not correct the text. This branch is secondary, not a required step.
6. Edit the source draft, recount the same included sections, and cross-check in the final submission system/editor if its convention differs.

Worked scenario: use `Research needs clear evidence.` to verify four words, 30 characters with spaces, 27 without. For an explicitly hypothetical 1000-word maximum, an included-section count of 980 leaves 20 words; that is not an institutional tolerance claim. Do not invent a grammar/readability score—record actual fixture outputs when reviewed.

### 5. Calculate Semester Results

1. Determine the requested outcome and available records. Missing course weights, grading scale, grade points or conversion rules → obtain them; no guessed defaults.
2. Subject obtained/maximum marks → Marks Percentage. Example: `(72 + 45) / (100 + 50) × 100 = 78%`, not an unweighted average of subject percentages.
3. One semester's included course credits and points → SGPA. Example: `(3×8 + 4×9) / (3+4) = 60/7 ≈ 8.5714`. Grade labels require the user's supported mapping and scale.
4. Cumulative result → CGPA course mode for course records, or semester mode for semester GPA plus explicit credits/weights. Example: `(20×8 + 30×9)/50 = 8.6`; explicitly selecting equal weighting yields `(8+9)/2 = 8.5`. Neither is assumed to be a universal institutional rule. Incompatible scales require the institution's accepted normalization; do not combine them as though identical.
5. Remaining assessment target → Required Marks. Completed-work average 60%, final worth 40%, target 70% → `(70 − 60×0.60)/0.40 = 85%` needed on the final. Show the tool's impossible/already-secured/no-remaining-weight cases, rather than a guaranteed achievable target.
6. Ordinary percentage question → existing Percentage Calculator. GPA-to-percentage request → no universal rule; refer to the institution's actual rule without inventing a converter or applying a universal multiplier.
7. Attendance is a separate branch: link Attendance Calculator for attended/conducted classes and a user-entered target, explicitly not an input to a unified GPA calculation. Retain its existing 0%, 100% and no-classes edge behavior.
8. Check inclusions, scale, weighting and rounding against the relevant official rules. Results are calculations from entered data, not certified university results.

## F. Internal linking map

Use existing policy `relatedWorkflows` as the source of tool-to-workflow associations. Add a small typed content registry for hub paths, workflow titles, primary hubs and contextual relevance. Existing policy `hub` identifiers are semantic labels, not URLs: map `study-assignment` to `/student-tools/`, `documents` to `/document-tools/`, and `writing` to `/writing-tools/`. Do not relabel legacy policies in bulk.

Definitions below: S = Student Tools, D = Document Tools, W = Writing Tools; A = Submit an Assignment, P = Prepare PDF for Upload, N = Scan Notes to PDF, L = Check Assignment Length, R = Calculate Semester Results. Every workflow also links back to `/workflows/`.

| Tool route suffix under `/tools/` | Hub link | Related workflow links |
|---|---|---|
| `attendance-calculator` | S | R, explicitly its separate attendance scenario |
| `sgpa-calculator`, `cgpa-calculator`, `marks-percentage-calculator`, `required-marks-calculator`, `percentage-calculator` | S | R |
| `image-to-pdf` | D | N, A |
| `pdf-merger` | D | A, P, N |
| `pdf-compressor` | D | P, A |
| `pdf-splitter` | D | P |
| `pdf-to-text` | D | L, specifically extraction from a text-bearing PDF |
| `pdf-to-images` | D | None of these five requires this operation; do not manufacture a workflow link |
| `image-compressor`, `image-resizer`, `image-cropper` | D | N, A |
| `word-counter` | W | L, A |
| `character-counter`, `grammar-checker`, `readability-score`, `text-analyzer`, `word-cloud-generator` | W | L; statistics/cloud are optional inspection branches |

Hub/workflow links:

- S → R prominently; A and L as contextual assignment tasks. R → S as primary hub.
- D → A, P, N. Each → D as primary hub. D also links its nine core tools and the existing articles named above.
- W → L. L → W as primary hub, and D only beside the optional PDF extraction path.
- `/workflows/` → exactly A/P/N/L/R and the three topical hubs.
- A → L only when writing preparation is needed; A/N → P for final existing-PDF checks; P → N when the reader actually starts with photos. These are handoff links, not mandatory extra steps.

A compact “Use this in a workflow” block goes after the tool workspace/review information and before lengthy supporting material. It contains an explanatory sentence, only the listed workflows and one relevant hub. Do not replace tool category breadcrumbs or rewrite tool SEO copy. For Word Cloud and Image Compressor, changes are restricted to this additive block and the necessary relationship metadata.

Only reviewed, generated destinations can appear in production navigation/contextual blocks. Missing references must fail validation rather than disappear silently. No English workflow block is rendered on Spanish/Hindi tool pages; no fake translated URL or hreflang is generated.

After the destinations exist and pass review:

- English Nav: Student Tools → `/student-tools/`; Document Tools → `/document-tools/`; Writing Tools → `/writing-tools/`; add Workflows → `/workflows/`; keep Guides and More Tools access. Check desktop fit and mobile menu usability.
- English Footer: repoint the three existing toolkit links; include one Workflows directory link, not all five workflow pages. Keep existing article/category/tool access.
- English homepage: add one “Choose the right tool” link to each relevant hub and a compact task-oriented link to `/workflows/`. Preserve all existing section IDs, especially `#study-assignment-tools`, `#document-tools`, `#writing-tools` and `#practical-guides`. Keep direct access to useful tools.
- Keep the tool directory, existing categories and search inventory intact at 83 tools. Hubs/workflows are not counted as tools or stuffed into the existing tool-only search registry.

## G. Publishing metadata

For every route in the table, `canonicalPath` is the exact route in B and canonical URL is `https://freeonlinetoolsnest.com` plus that route. `adEligible: false` throughout. New content uses `lang="en"`, existing OG defaults and no localized alternates.

| Route | `hub` | `tier` | `primaryAudience` | `primaryIntent` |
|---|---|---|---|---|
| `/student-tools/` | `study-assignment` | `core` | `students` | Choose a calculator using available academic records and the requested outcome |
| `/document-tools/` | `documents` | `core` | `students-and-document-users` | Choose a document or image operation from source format and submission constraints |
| `/writing-tools/` | `writing` | `core` | `students-and-writers` | Distinguish writing length, correction, readability and statistical review |
| `/workflows/` | `reference` | `core` | `students-and-document-users` | Choose a multi-tool task from starting material and desired output |
| `/workflows/submit-an-assignment/` | `documents` | `core` | `students` | Prepare assignment material through only the relevant conversion, assembly and checking steps |
| `/workflows/prepare-pdf-for-upload/` | `documents` | `core` | `students-and-document-users` | Prepare an existing PDF for user-supplied page and upload constraints |
| `/workflows/scan-notes-to-pdf/` | `documents` | `core` | `students-and-note-takers` | Turn existing JPEG or PNG note images into an ordered legible image-based PDF |
| `/workflows/check-assignment-length/` | `writing` | `core` | `students-and-writers` | Apply the supplied counting rule and review basic writing mechanics |
| `/workflows/calculate-semester-results/` | `study-assignment` | `core` | `students` | Select a marks, GPA or future-score calculation with explicit scales and weights |

Lifecycle:

1. Local draft: `indexable: false`, `sitemapEligible: false`, `reviewStatus: "pending-evidence"`, `lastReviewed: null`, `adEligible: false`. No public promotional links to unfinished pages.
2. Reviewed candidate: after actual content, examples, source behavior, navigation and accessibility have been checked, use `reviewStatus: "reviewed"` and the actual review date. Do not stamp the planning date or build date as evidence.
3. Publishable candidate: set `indexable: true` and `sitemapEligible: true` only for a page that passes the gate. `adEligible` stays false. Publication is still subject to later explicit merge/deploy authorization.

`relatedWorkflows` is the exact contextual map in F, excluding self-links. `relatedGuides` is empty on Student/Writing/Workflows and result/length workflows unless a genuinely needed existing article is cited. Document Tools uses the three existing articles in D; PDF preparation may use `why-pdfs-compress-differently`, and notes/assignment preparation may use `image-compression-resizing-format-conversion`. No new guide is created.

Add per-route quality dossiers separate from the tool registry, recording: unique value, decisions and skip conditions, verified scenario inputs/outputs, limitations, checked tool implementations, evidence/test identifiers, review date and reviewed revision. Expose concise relevant examples/limitations and the real review date to readers; keep engineering evidence in the dossier/report.

Keep the existing legacy review-status exemptions. A contextual link addition must still pass canonical/indexing/link checks, but does not authorize noindexing a legacy page or rewriting its dossier to pretend a new full content review occurred.

## H. Structured data

- Four hubs: `CollectionPage` with an `ItemList` matching visible destinations. The workflows directory lists five actual workflow URLs, not imaginary future entries.
- Five workflows: `WebPage`, with accurate name, description, canonical URL, `inLanguage`, `isPartOf` referencing the workflows collection, with no schema review/publication/modification dates unless separately supported and authorized; review dates remain visible metadata.
- All nine: visible breadcrumbs with one corresponding `BreadcrumbList`. Reuse `Breadcrumbs.astro`; avoid injecting a duplicate breadcrumb graph through another component.
- Workflow breadcrumbs: Home → Workflows → current workflow; the primary topical hub is a separate visible contextual link. Hub breadcrumbs: Home → current hub.
- No `WebApplication` for a content page, no ratings, invented author credentials, padded FAQ schema or a forced linear `HowTo` for conditional paths. No promised rich-result appearance.
- Check JSON-LD parsing plus semantic consistency with visible content and absolute canonical URLs. No new schema dependency or global SEOHead rewrite.

References checked for this plan: [Schema.org CollectionPage](https://schema.org/CollectionPage), [WebPage](https://schema.org/WebPage), [ItemList](https://schema.org/ItemList), and [Google breadcrumb guidance](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb).

## I. Organic-signal protection

Protect the existing titles, descriptions, H1s, canonical URLs, robots, major body copy and routes of:

- `/tools/seo-length-checker/`
- `/tools/serp-preview-generator/`
- `/tools/word-cloud-generator/`
- `/tools/random-number-generator/`
- `/blog/javascript-regex-flags-groups-mistakes/`
- `/blog/image-compression-resizing-format-conversion/`
- `/blog/image-compressor-browser-only/`
- `/tools/image-compressor/`
- All existing `/es/` routes; also preserve `/hi/` routes and localization behavior.

Preserve the PDF-compression article and every other existing blog source too. The protected image articles gain incoming links without being rewritten. Word Cloud and Image Compressor can gain only the relevant additive English workflow/hub block. Shared English navigation changes are expected shell changes, not permission to alter article/tool targeting. No protected page is redirected into a hub.

Before implementation, capture protection evidence from the clean base build: route signals for all 182 pages, and protected titles/descriptions/H1s/main-content sections plus hashes of existing article sources and localized content. Compare stable page-owned content separately from the explicitly permitted navigation and contextual-link blocks. Do not snapshot generated chunk names or copyright timestamps as meaningful content.

No existing page is noindexed from this Search Console sample. High impressions near position 70 do not justify changing the site's primary positioning to SEO tools.

## J. Expected files

New application files, after approval:

- The exact nine `src/pages/` files listed in B.
- `src/layouts/ContentPageLayout.astro`: small wrapper around existing Layout/Breadcrumbs with content sections and real review information.
- `src/components/content/DecisionPaths.astro`: accessible static decision list shared only where the content benefits.
- `src/components/content/RelatedWorkflowLinks.astro`: contextual tool/workflow/hub links with English-only and reviewed-destination checks.
- `src/data/hubs.ts`: titles, paths, core tools and contextual workflow relationships for four collections.
- `src/data/workflows.ts`: five workflow identities, primary hubs, starting conditions and destination references; no duplicate calculator logic.
- `src/data/content-page-quality.ts`: nine route-specific quality dossiers and reviewed scenario evidence.
- `src/helpers/content-navigation.ts` and `src/helpers/content-navigation.test.ts`: reference resolution, visibility and relationship validation.
- `src/data/phase-3-content.test.ts`: quality, protected-content, locale and graph assertions.
- `src/data/__fixtures__/post-phase-2-routes.json`: immutable 182-page baseline captured from the verified base, supplementing rather than replacing Phase 1 evidence.
- `src/data/__fixtures__/phase-3-additions.json`: separately scoped nine approved route candidates.
- `src/data/__fixtures__/phase-3-organic-protection.json`: protected metadata/content evidence and explicit allowed additive areas.
- `docs/hubs-workflows-phase-3-verification.md`: implementation, examples, mobile checks and limitations.
- `docs/search-console-measurement.md`: generic measurement checklist only; private baseline and opportunity notes remain ignored locally.

Expected modifications:

- `src/data/page-policies.json`: nine new records and only relevant English `relatedWorkflows` updates; preserve all existing indexing/canonical/ad decisions.
- `src/data/page-policy.test.ts`: allow Phase 3 additions and meaningful workflow references. Replace the obsolete assertion that all six Phase 2 tools must forever have empty `relatedWorkflows` with exact valid relationship checks; retain their indexing/ad protections.
- `src/helpers/build-validation.test.ts`: regression cases for combined phase baselines, new-page evidence and protected output.
- `scripts/validate-built-site.mjs`: combine scoped Phase 2/3 allowed additions; enforce unchanged Phase 2 membership as well as Phase 1; extend checks for nine content pages and protected signals. Continue offline `dist/ads.txt` validation.
- `src/layouts/ToolLayout.astro`: render the compact English contextual block without changing the tool workspace, advertising prop or existing supporting content.
- `src/components/Nav.astro`, `src/components/Footer.astro`, `src/pages/index.astro`: the constrained English navigation changes in F, after publication readiness.
- `README.md`, `AGENTS.md`: current Phase 3 architecture/counts and stop conditions after verification. Leave historical sections clearly historical.

Current planning-only addition: `docs/hubs-workflows-phase-3-plan.md` (this file).

Expected unchanged: both existing fixtures; all six Phase 2 tool implementations and math/PDF helpers; tool inventory/counts and existing tool copy/dossiers; existing blog files; localized data/overrides/pages; category/tool route files; `astro.config.mjs`; `Layout.astro`; `SEOHead.astro`; `Hero.astro`; `src/styles.css` (prefer existing utilities/scoped content styles); dependencies/lockfile; `public/_headers`, `_redirects`, `robots.txt`, `ads.txt`; analytics and advertising configuration. A demonstrated necessary scope change should be explained rather than silently expanding this list.

## K. Regression and content-quality verification

1. Preserve the frozen 176-route fixture exactly; preserve the six-route Phase 2 fixture exactly. Add a separate clean Phase 2 baseline. Assert route-set equality, not just totals: no removal or replacement of any of the 182 existing routes.
2. Preserve the exact existing robots, canonicals, sitemap set and 117 AdSense-loader members. Preserve all six Phase 2 tools' indexable/sitemap-eligible/ad-ineligible status. New nine are always ad-ineligible.
3. For every new sitemap page, fail on missing output, noindex, non-self-canonical, redirect/rewrite, meta refresh, missing actual review evidence or policy/output disagreement. Inject each failure in tests. Do not relax these rules to reach 89 URLs.
4. Validate all contextual references against actual generated pages and metadata; check reverse tool→workflow and workflow→hub relationships, no self-links, no duplicates and no orphan reviewed destinations. Missing/unreviewed content must not appear in promoted navigation.
5. Match the exact core-tool inventories and decision-to-tool mappings described in D/E. Confirm all nine have specific unique-value explanations, original comparisons/decisions, relevant limits and verified examples. Human review decides whether the prose is useful; string-presence tests are supporting evidence, not proof of quality.
6. Check skip paths explicitly: one good PDF needs no conversion/merge/compression; a compliant file skips compression; images alone skip merging; unknown rules/weights do not receive invented defaults; an image-based PDF is never routed to PDF to Text as OCR.
7. Verify numerical examples through the existing mathematical helpers: 78% marks, SGPA 60/7, CGPA 8.6 weighted versus 8.5 explicitly equal, and 85% final requirement. Keep all existing invalid-input/boundary tests. No new mathematical engine is needed.
8. Verify real document handoffs with synthetic files: three images plus cover produces four pages; `1-3,5` produces two outputs that merge to four pages; reordered images preserve page order. Check output with a PDF viewer/parser. Record measured file sizes, including a no-reduction case; do not assert a made-up compression percentage.
9. Verify the four-word/30-character/27-character example in the existing tools, and recount after edits. Test plain-text extraction only on text-bearing PDFs. Review grammar/readability wording against actual outputs and limitations.
10. Assert protected titles, descriptions, H1s, page-owned content and article/localized sources remain unchanged, apart from the explicit additive relationship blocks. Existing ordinary English nav links may change; protected SEO targeting may not.
11. Assert no `/es/` or `/hi/` Phase 3 routes, no false hreflang, no English contextual block on localized tool pages, and still exactly 20 localized tools per language. Global tool count remains 83.
12. Validate generated titles/descriptions are unique after the existing truncation, one H1, working anchors, JSON-LD syntax and meaning, internal links, manual-handoff privacy copy and absence of placeholder/fake claims.
13. Run `npm run test`, `npm run lint`, `npm run check`, `npm run build`, appropriate browser checks and `git diff --check`. Treat new failures/warnings as work to resolve; document pre-existing diagnostics separately. Do not change dependencies merely to expand this phase.

## L. Mobile, accessibility and performance

Check every one of the nine destinations at 320, 375, 390, 768 and 1440 CSS pixels, in light and dark themes. Verify readable line lengths, long-link wrapping, no horizontal overflow and no wide comparison table. Decision links/controls should have comfortable approximately 44-pixel touch areas where practical; inspect spacing for inline links rather than turning prose into oversized buttons.

Keyboard checks: skip link, logical heading order, sequential focus, visible focus, every decision link, optional native disclosure toggles, mobile menu open/close and focus restoration. Check 200% zoom/reflow and that the fixed header does not cover linked section headings. Use semantic lists/headings and actual links, not clickable divs or arrow-only labels. Inspect a screen-reader/accessible-tree reading order for one hub and each workflow pattern, and check all repeated components.

All decision content and destinations must work with JavaScript disabled. Preserve existing shared search/theme/menu behavior and do not promise zero JavaScript sitewide: Layout already loads shared UI and analytics. New hubs/workflows add no React island, PDF library, image processing or new client dependency. Check network output to confirm these heavy tool modules load only on their actual tool pages. Use browser performance observations as local evidence, not a claim of field Core Web Vitals success.

## M. Counts and sitemap implications

| Metric | Verified base | If all nine pass review |
|---|---:|---:|
| Tools | 83 | 83 |
| Generated pages | 182 | 191 |
| English pages | 114 | 123 |
| Spanish / Hindi pages | 34 / 34 | 34 / 34 |
| Indexable directives | 179 | 188 |
| Existing noindex pages | 3 | 3 |
| Sitemap URLs | 80 | 89 |
| AdSense-loader pages | 117 | 117 |

Let `n` be newly generated routes and `r` be those that pass review and are enabled for indexing/sitemap. Then pages = `182+n`, indexable directives = `179+r`, sitemap URLs = `80+r`, and noindex pages = `3+(n-r)`. If a candidate is withheld completely, it contributes to neither n nor r. The preferred release contains only completed approved pages; do not deploy a thin page just to make n=9.

Maintain existing sitemap filtering and no synthetic build-time lastmod. Actual Google indexing remains separate from these directives. Google explicitly says that sitemaps help discovery but do not guarantee crawling/indexing: [sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview).

## N. Proposed implementation/commit sequence

No commits are made in this planning turn. After approval, recheck the branch base against main; account for any new upstream changes before editing.

1. `test: freeze phase 2 publishing and organic baselines` — capture verified route/content evidence; extend phase-aware regression contracts without changing production eligibility or frozen historical fixtures.
2. `feat: add static hub and workflow content structure` — typed identities/relationships, separate quality dossiers, static layout/components and reference helpers/tests. No public links to nonexistent pages.
3. `feat: add nine complete hub and workflow pages` — add all nine individual pages together with full decisions, comparisons, worked scenarios and explicit draft policies. Cross-links point only to the now-existing pages. No placeholders or advertised future functionality.
4. `test: verify workflow examples and review publishing eligibility` — execute branch/hand-off scenarios, review unique value and limitations, record actual evidence and dates, and enable index/sitemap only for passing pages. Recheck the whole combined publishing gate.
5. `feat: connect reviewed workflows to tools and navigation` — exact English tool relationship metadata/rendering, hub backlinks, homepage/Nav/Footer changes after destinations qualify. Preserve anchors, legacy copy and localized behavior.
6. `docs: record phase 3 verification and measurement plan` — full regression/mobile/accessibility checks, final dossier corrections if needed, updated project documentation, generic Search Console measurement procedure; private baseline and opportunity notes stay ignored locally. Review final diff against the original protection evidence.

Stop after implementation and local verification with the reviewed diff/results. Push, PR, merge and deployment require a later explicit instruction. No Phase 4 articles or AdSense review are included.

## O. Post-deployment Search Console measurement plan

This is a future checklist, not an automation or an action performed now. After a separately authorized Phase 3 deployment:

1. Record the deployed commit, exact production timestamp and canonical URLs. Verify all nine live routes, status/canonical/robots, internal links, actual sitemap membership and unchanged loader membership. Check live `/ads.txt` separately from the offline build; one check must never depend on the other.
2. Save a Search Console checkpoint once the reporting dates are complete: property, search type, date range, filters, export date, report timezone, indexing state and Google-selected canonical where available. Verify/submit the existing sitemap index as appropriate; do not mass-request indexing or any AdSense review.
3. Monitor the six exact Phase 2 tool URLs separately: Attendance, SGPA, CGPA, Marks Percentage, Required Marks and Image to PDF. Also maintain separate cohorts for the nine Phase 3 destinations and the protected legacy pages/locales.
4. For each URL capture indexing, impressions, clicks, CTR, average position, exposed queries, country and device. Save page-level totals and separately exported query/country/device tables; do not treat their sums as necessarily matching. Keep Web/Image search types separate.
5. Record an initial technical/indexing checkpoint, then review complete weekly windows for discovery/issues. Use a complete 28-day post-deployment period as an initial performance checkpoint and another comparable period if volume remains sparse. These are review intervals, not a promise that enough data will exist by then. No reminder/monitor is created now.
6. Compare like-for-like page/filter/date windows. New pages have no pre-release ranking baseline: record that as not applicable, not zero demand. CTR is clicks divided by impressions; do not average row CTRs or unweighted positions across unrelated segments. Sitewide average position cannot diagnose an individual student tool.
7. If repeated student-tool queries reveal a real unanswered intent, consider Phase 4 content. If a page receives relevant impressions around positions 20–40, review that existing page against its actual queries before multiplying related articles. Sparse observations mean continue measurement, not manufacture demand claims.

The supplied historical export is a valid pre-Phase-2-production baseline. September 16 was the local implementation/review date; the user confirmed production release on September 20. Detailed performance data and the separate organic-opportunity backlog are local/private and must never be committed. Track the deployed revision and verified production timestamp separately from local review dates. Repository documentation contains only this generic measurement procedure.

Approval received on 2026-09-26 for implementation and local verification only, with all five amendments below.

## Approved amendments

1. Preserve the user's confirmed September 20 production release date. Record an exact deployment timestamp only from corresponding deployment evidence; never substitute a local review date.
2. Keep detailed Search Console exports, metrics, query data and performance history in ignored `.private/search-console/`. No private numbers in tracked docs, fixtures or public page copy.
3. Compare Document Tools against PDF Tools category and Writing Tools against Text Tools category before enabling indexing: distinct intent, H1, title, description and primary content. Preserve category indexing.
4. Review dates remain internal/visible metadata only. Do not emit `lastReviewed` in JSON-LD. Omit publication/modification schema dates until actual evidence supports them.
5. Protect stable page-owned text, individual metadata and source/article content, excluding permitted navigation and related-workflow blocks. Never hash full generated HTML.
