# Phase 2 — Student Tools verification

Implementation and local review date: **2026-09-16**. Branch: `codex/student-tools-phase-2`, created from main `23148941ce4b9fdbd405b66b831e75ee3fd13cf7` after the Phase 1 merge. No Phase 2 push, merge, deployment, Phase 3 work or AdSense review was performed.

## Delivered routes

Each route has an individual Astro page, a React client island, registry metadata, a quality dossier, a verified example, documented limitations and a recorded review date.

| Route | Page file under `src/pages/tools/` | Component under `src/components/tools/` |
|---|---|---|
| `/tools/attendance-calculator/` | `attendance-calculator.astro` | `AttendanceCalculator.tsx` |
| `/tools/sgpa-calculator/` | `sgpa-calculator.astro` | `SgpaCalculator.tsx` |
| `/tools/cgpa-calculator/` | `cgpa-calculator.astro` | `CgpaCalculator.tsx` |
| `/tools/marks-percentage-calculator/` | `marks-percentage-calculator.astro` | `MarksPercentageCalculator.tsx` |
| `/tools/required-marks-calculator/` | `required-marks-calculator.astro` | `RequiredMarksCalculator.tsx` |
| `/tools/image-to-pdf/` | `image-to-pdf.astro` | `ImageToPdf.tsx` |

All six have `indexable: true`, `sitemapEligible: true`, `canonicalPath` equal to the route, `adEligible: false`, `tier: core`, `reviewStatus: reviewed`, `lastReviewed: 2026-09-16`, and empty related-guide/workflow arrays. The five calculators use `hub: study-assignment` and audience `students`; Image to PDF uses `hub: documents` and audience `students and document submitters`. Each has its own task-specific `primaryIntent`, title and description. They were initially implemented as noindex and outside the sitemap; eligibility was enabled after unit and browser checks.

## Mathematics and verified numerical cases

Logic is separate from the interfaces in `src/helpers/student-calculators.ts`; its test file verifies arithmetic, validation and boundary behavior. Each UI exposes a substituted calculation and clears a stale result when inputs change.

### Attendance

For attended count A, conducted count T and target fraction q:

- Current attendance is `100 × A / T` when T > 0. At T = 0 it is undefined, displayed as “Not established yet.”
- For 0 < q < 1 and T > 0, consecutive catch-up classes are `max(0, ceil((qT − A)/(1 − q)))`.
- When already meeting a positive target, additional missable classes are `floor(A/q − T)`; otherwise zero.
- At target 0%, catch-up is zero and there is no mathematical absence constraint. This is not permission to miss classes.
- At T = 0 and target > 0%, one attended class establishes 100%. If no future classes remain, the positive target cannot be established.
- At target 100% and T > 0: A = T means zero catch-up; A < T means exact 100% cannot be attained in a finite number of future classes.
- With R remaining classes, maximum final attendance is `100(A+R)/(T+R)` if the denominator is positive. Catch-up exceeding R is explicitly impossible within that schedule.

| Input | Expected result |
|---|---|
| A=30, T=50, target=75% | 60% current; 30 attended classes required; 60/80=75% |
| A=45, T=50, target=75% | Zero catch-up; 10 further absences permissible mathematically |
| A=T=0, target=0% | Undefined current attendance; zero catch-up |
| A=T=0, target=75% or 100% | Undefined current attendance; one attended class establishes attendance |
| A=T=10, target=100% | Zero catch-up; zero additional absences |
| A=9, T=10, target=100% | Unattainable in finite future classes |
| A=30, T=50, target=75%, R=20 | Maximum 50/70=71.428571…%; impossible this schedule |
| A=7499, T=10000, target=75% | Four catch-up classes; no threshold decision based on rounded display |

Counts must be whole numbers from zero through one billion, A ≤ T, and target must be 0–100% with at most two decimal places. Integer basis-point arithmetic controls ceil/floor decisions. A property test checks minimal catch-up and maximal absence for all counts through T=30 at four target percentages. Hours, excused absences and university eligibility rules are not inferred.

### SGPA and CGPA

Course mode uses `Σ(credits × grade points) / Σ(included credits)`. Credits must be positive for included courses. An included zero-point grade contributes its credits; excluded rows contribute neither credits nor points. Scale maximum is entered by the user, and all included points must fall between zero and that maximum.

Semester CGPA uses `Σ(SGPA × weight) / Σ(weights)`. No method is preselected. Semester credits and custom weights require every weight; equal weighting assigns one only after the explicit equal-weighting choice. The selected method appears in the result. Individual-course CGPA reuses the course-weighted implementation.

| Input | Expected result |
|---|---|
| Course credits/points (4,9), (3,8), (2,7), maximum 10 | 74/9=8.222222…; display 8.22 |
| Credits/points (3,4), (3,3), maximum 4 | 3.5 |
| Custom A=8, B=6; credits 3 and 1 | 7.5 |
| Included (4,8), (4,0) | 4.0; failed/zero-point course is not silently omitted |
| Semester SGPA 8 with 20 credits; 9 with 24 credits | 376/44=8.545454…; display 8.55 |
| Same SGPAs, explicitly equal weighting | 8.5 |
| Same SGPAs, custom weights 1 and 3 | 8.75 |
| Missing method or a missing/zero required weight | Clear validation error |

Custom mappings reject empty/whitespace labels, duplicate labels, normalized case-equivalent labels such as A/a, unmapped course grades, non-finite points and points outside the entered scale. No university preset, grade conversion, GPA-to-percentage formula, repeated-course forgiveness or pass rule is supplied. Users choose counted attempts and consult their institution's policy. Semester aggregation is approximate if source SGPAs have already been rounded; intermediate course calculations are not rounded, and display rounding is explained.

### Marks percentage

Formula: `100 × Σ(obtained marks) / Σ(maximum marks)`. It is not an unweighted average of subject percentages. Each maximum must be positive and obtained marks must be between zero and that maximum.

- 80/100 and 45/50 produce 125/150 = **83.333333…%**, displayed as 83.33%.
- Zero, 75/100 and 100/100 produce **0%, 75%, 100%**.
- Optional custom thresholds A≥90, B≥75, C≥0 give B at 75% and C at 74.99%.
- Custom threshold labels and cutoffs must be unique, bounded to 0–100, and include a 0% threshold. No grade is shown by default.
- Empty rows, non-finite values, zero maxima, negative marks and obtained marks over the maximum are rejected.

### Required marks

For completed-work average C, remaining weight fraction w and target overall percentage G:

`required percentage = (G − C(1−w)) / w`.

At w=0, the completed average determines whether the target is secured or impossible. At w=1, C is unused. Requirements ≤0 are clamped to zero; requirements >100% are impossible. With maximum M and allowed increment s, `raw marks = required percentage × M / 100`, then `minimum marks = ceil(raw marks / s) × s`. Increment arithmetic uses rational numbers to avoid adding an extra mark at a floating-point boundary. An increment that takes the required mark beyond M is impossible.

| Input | Expected result |
|---|---|
| C=65%, weight=40%, G=70%, M=80, s=1 | 77.5% required; 62/80; 70% overall |
| C=64%, weight=40%, G=70%, M=75, s=1 | 59.25 raw marks → 60/75; 70.4% overall |
| C=50%, weight=40%, G=90% | 150% required; impossible |
| C=90%, weight=20%, G=60% | Zero required; 72 percentage points already secured |
| Weight=100%, G=30%, M=1, s=0.1 | Exactly 0.3 marks, not 0.4 |
| Weight=100%, G=100%, M=75, s=2 | Impossible under the chosen increment (next value is 76) |

Inputs must be finite, percentages 0–100, optional maximum/increment positive and increment ≤ maximum. Extreme arithmetic beyond supported precision produces an error rather than NaN. The tool does not model moderation, extra credit, separate component pass requirements or non-linear grading rules.

## Image to PDF: privacy and output evidence

The existing pdf-lib dependency is loaded on demand. JPEG/PNG signatures and dimensions are checked before decoding. `createImageBitmap` applies image orientation; a local canvas re-encodes the pixels. Images are processed sequentially, fitted without stretching/cropping and centered on a white PDF page. No conversion endpoint, file upload, remote image URL, localStorage or IndexedDB is used. Thumbnails/downloads use local Blob URLs, revoked on removal, replacement, clear or unmount. Cancellation is checked between asynchronous processing steps; it cannot interrupt a synchronous browser codec operation instantly.

Application guardrails: **20 files, 15 MiB/file, 50 MiB combined input, 16 megapixels/image, 64 megapixels combined, 16,384 pixels/side**. These are conservative choices for this application, not universal browser/device limits. A resource-constrained device can still require smaller images or batches.

Verified in the local Chromium browser:

- Rejected corrupt/renamed image input, animated PNG and oversized declared dimensions.
- Added more images without losing the prior list; reordered and removed pages using labeled buttons.
- Downloaded a two-page PDF; parsed sizes were **612×792 points**, then **792×612 points**, matching an EXIF-rotated JPEG followed by a landscape JPEG in automatic orientation mode.
- Rendered and visually inspected both pages plus a transparent PNG output; transparency appeared on white. Extracted embedded JPEGs had empty EXIF data, and synthetic metadata markers were absent from the PDF bytes.
- Unit layout example: a 1200×800 image on 612×792 points with 36-point margins becomes **540×360 at (36,216)**. On a landscape Letter page it becomes **720×480 at (36,66)**.
- Rejected a 500 mm margin; editing settings cleared the old download and its Blob URL no longer resolved.
- Generated and downloaded a further PDF with browser networking disabled after the conversion code had loaded.
- Recorded seven conversion-period requests in the synthetic privacy test: five local Blob reads and two same-origin JavaScript chunk reads. No filename/content canary occurred in outgoing requests or browser storage. No file-upload request occurred. Ordinary page analytics are separate from conversion; this check is not a claim that the entire website never makes network requests.

Output is image-only: no OCR/searchable text, tagging, encryption or guaranteed compression. HEIC, WebP, SVG, GIF and animated PNG are unsupported. Re-encoding can change JPEG quality/color appearance. Testing used desktop Chromium with responsive emulation; this is not a claim of testing every physical device, browser engine or image encoding. API references consulted: [pdf-lib PDFDocument](https://pdf-lib.js.org/docs/api/classes/pdfdocument) and [createImageBitmap](https://developer.mozilla.org/en-US/docs/Web/API/Window/createImageBitmap).

## Publishing, navigation and locale preservation

| Metric | Phase 1 baseline | Phase 2 verified output |
|---|---:|---:|
| Tool records | 77 | 83 |
| Generated routes | 176 | 182 |
| English pages | 108 | 114 |
| Spanish / Hindi pages | 34 / 34 | 34 / 34 |
| Localized tools per language | 20 | 20 |
| Indexable directives | 173 | 179 |
| Noindex directives | 3 | 3 |
| Sitemap entries | 74 | 80 |
| Pages loading existing AdSense script | 117 | 117 |
| Ad-eligible tool dossiers | 30 | 30 |

The frozen baseline fixture was not changed. Every old route, robots decision, sitemap member and advertising-loader decision is checked against it. The six new routes have no localized hreflang alternatives. The build verifies they are actually generated, indexable, self-canonical and non-redirecting before allowing sitemap membership. It also rejects unapproved additions and indexable additions without dated review evidence.

The homepage label is now **Student Tools**, retains `#study-assignment-tools`, and links only to implemented tools. Image to PDF is promoted in the existing document section. English hero, footer, navigation, search and category counts were updated after tool verification. Spanish/Hindi homepages and directories still report 20 available localized tools; browser checks found no links advertising the six new tools as translated. The legacy percentage calculator and all other URLs remain available. No hubs, guides, workflows or new categories were created.

AdSense configuration, account-verification method, public ads.txt, headers, redirects, robots.txt, GA4, dependency manifest and lockfile are unchanged from main. `dist/ads.txt` passed local validation. No live Phase 2 production check was performed because nothing was deployed. Live `/ads.txt` remains a separate post-deployment check if deployment is later authorized. These are publishing directives, not evidence that Google has indexed the new URLs. No AdSense resubmission is recommended or authorized.

## Final checks and evidence

- `npm ci`: successful from unchanged lockfile. It reports the existing **14 dependency audit findings (3 moderate, 10 high, 1 critical)**; dependency remediation is outside this change and no forced upgrades were made.
- `npm run test`: **116 passing tests in six files**. Includes arithmetic, PDF layout/guards/output, publishing-policy failure cases and unchanged legacy/localized contracts.
- `npm run check`: **0 errors, 0 warnings, 21 existing hints**.
- `npm run lint`: **0 errors, 21 existing unused-variable/import warnings**.
- `npm run build`: **182 generated pages and 80 sitemap URLs**, offline validator passed. Build does not call production or depend on external verification services.
- Browser calculator script: **23 recorded result checks**, plus blank-input, over-maximum, missing-weight and stale-result assertions; no page errors.
- All six tool layouts checked at **320, 375 and 1440 px**: no horizontal overflow and all calculator/input fields labeled. Light/dark screenshots inspected; a keyboard-only attendance calculation passed.
- Final homepage search reached Attendance by keyboard; the mobile menu reached the preserved Student Tools anchor and closed correctly. Homepage widths 320/375/1440 passed.
- Final browser metadata checks confirmed six self-canonical indexable pages with **no AdSense loader** and no nonexistent locale alternates.
- `git diff --check` passed. Invariant-file comparisons against main passed.

Local test scripts, logs, screenshots and synthetic downloads are in the ignored `output/playwright/` directory, including `calculator-qa.js`, `image-pdf-qa.log`, `mobile-qa.log`, `final-site-qa.log`, `phase2-image-output.pdf`, `phase2-transparent-offline.pdf`, `phase2-page-1.png`, `phase2-page-2.png`, `phase2-transparent.png` and `phase2-home-desktop.png`. They contain synthetic test input only. The committed unit tests are the reproducible regression suite.

## Change inventory and commit sequence

1. Scoped addition fixture and build/policy regression rules; preserved advertising eligibility independently of new dossiers.
2. Pure student arithmetic, edge-case tests and shared result/form controls.
3. Attendance component, route, metadata and dossier.
4. SGPA/CGPA components, custom grade editor, routes, metadata and dossiers.
5. Marks Percentage/Required Marks components, routes, metadata and dossiers.
6. Browser-only Image to PDF component, helper, tests, route, metadata and dossier.
7. Verification evidence, reviewed dates and index/sitemap eligibility with `adEligible: false`.
8. Homepage/navigation promotion and truthful English/localized wording.
9. Final documentation and verification report.

Besides the six pages/components listed above, new files are `src/components/tools/shared/{CalculationResult,GradeScaleEditor}.tsx`, `src/helpers/{student-calculators,image-to-pdf}.{ts,test.ts}`, `src/data/__fixtures__/phase-2-additions.json`, and this report. Modified files are `scripts/validate-built-site.mjs`, `src/helpers/build-validation.test.ts`, `src/data/{tools.ts,tool-quality.ts,page-policies.json,page-policy.test.ts,content-quality.test.ts}`, `src/components/{Hero,Nav,Footer}.astro`, `src/pages/{index.astro,categories/index.astro}`, `src/i18n/ui.ts`, `README.md` and `AGENTS.md`.

## Pre-merge diff review follow-up

The user subsequently authorized pushing this branch, opening a PR, waiting for CI and merging. PR: https://github.com/anirudhmkdev/free-online-tools-nest/pull/2.

Diff review found that a custom 58% grade threshold could incorrectly reject 29/50 because its floating-point percentage is slightly below 58. The failing regression was reproduced. Threshold decisions now compare exact rational totals from the entered decimal marks, independently of display rounding; an actually lower score is not promoted by an epsilon. Two regression tests cover integer threshold boundaries and decimal totals. The updated suite contains 118 tests.

The repository's configured remote check is Cloudflare Pages; no GitHub Actions workflow exists. Existing Phase 2 implementation evidence above records the pre-push state. No subsequent phase or AdSense review is authorized by the merge request.
