# Content remediation: implementation and verification

Date: 2026-09-27. Branch: `codex/content-quality-remediation`. Base: `9467adfae6b31bbc98cfe62c47b18683ceb9ff38` (`origin/main` at branch creation).

## Scope completed

This corrective batch repairs demonstrated defects and claim mismatches. It does not remove routes, consolidate tools, change advertising, publish a release or establish AdSense readiness.

- **YAML to JSON:** replaced the lossy parser with a documented, restricted block subset. Scalar lists and mappings retain their values; unsupported syntax, duplicate keys, unsafe numeric values and excessive input fail clearly. No new dependency. Full YAML support is expressly not claimed.
- **Grammar Checker:** extracted pure rules, removed known false-positive spelling substitutions, and replaced “clean text” assurances with limited-rule language. English, Spanish and Hindi landing-page copy now states the English-only scope and manual editing behavior.
- **Text Summarizer:** selects sentence occurrences by index, respects the requested count despite duplicate text, preserves source order, clears stale results and reports unsupported/empty input. It is explicitly extractive and English-oriented.
- **Text Analyzer, Word Counter and Character Counter:** corrected claims about nonexistent readability/frequency/line metrics and copy controls. Counting/timing assumptions and UTF-16 limitations are visible.
- **Base64, JSON Formatter, Regex Tester and Word Cloud:** corrected unsupported file, output, preview or customization claims found during source/interface comparison. No new advertised features were invented.
- **SEO Length Checker and SERP Preview:** removed exact-display and truncation guarantees; estimates are clearly identified. Schema generator copy no longer claims comprehensive validation.
- **PDF Compressor:** replaced fictitious quality percentages with actual plain/object-stream save modes; shows larger output honestly, rejects encryption instead of bypassing it, invalidates stale results on mode change, and cleans up output URLs. It does not claim image downsampling or guaranteed savings.
- **Percentage Calculator:** added pure arithmetic tests, finite-input and zero-denominator errors, a visible formula and stale-result clearing. Copy now reflects its actual three modes; negative starting values use the absolute denominator explicitly.
- **SQL Formatter:** protects quoted values/identifiers and comments from keyword replacement. Unsupported quoting is rejected rather than silently corrupted. Formatting is not presented as query validation.
- **Two existing articles:** replaced broad marketing, absolute privacy/security/offline claims and unsupported personal-use assertions with practical task selection and ten checkable examples. Existing article routes and recorded original publication dates remain unchanged.
- **Localized shared instructions:** copying/downloading is now conditional on an actual available control. The 20-tool Spanish/Hindi availability remains unchanged.
- **Quality and publishing evidence:** added scoped review evidence for the five primary corrected tool records, preserved legacy ad membership and original protection fixtures, and recorded exact permitted before/after content changes in a separate manifest.

## Local validation

| Check | Result |
| --- | --- |
| `npm run test` | 187 tests pass across 14 files |
| `npm run lint` | 0 errors; 16 existing unused-variable warnings |
| `npm run check` | 0 errors, 0 warnings; 16 unused-code hints |
| `npm run build` | Pass; 191 generated pages and 89 sitemap URLs |
| `node scripts/audit-publisher-pages.mjs` | All 117 exact legacy loader members present and structural checks pass |
| `git diff --check` | Pass |
| Original Phase 1, post-Phase-2 and Phase 3 organic-protection fixtures | Unmodified |
| Dependency manifests, ads.txt, advertising layout/SEO components, headers and redirects | Unmodified |

The new logic tests cover YAML list loss, rejection cases and prototype keys; repeated summary sentences; grammar false positives; PDF page preservation/encryption rejection; percentage feasibility; SQL literal preservation; and prevention of indexing/canonical changes through the content exception manifest. They do not mirror CSS or layout implementation.

The manifest changes 53 protected page expectations and five protected source expectations. Many page changes are derived related-tool cards or the corrected shared localized instructions. It stores the original value, replacement value and rationale for each changed field. Canonicals and robots cannot be changed through this mechanism. Original fixture files remain historical evidence rather than being regenerated.

## Browser evidence

Chromium checks used synthetic data and the local site. Final PDF, SQL and percentage checks ran against the built static preview. The initial PDF dev-server attempt failed because Vite served an outdated optimized dependency; the static build successfully rewrote and downloaded the PDF. No production tool changes were deployed.

The primary regression run passed 22 checks, including list preservation and stale-result clearing; alias rejection; grammar repetition and honest empty results; bounded summaries; article examples; Spanish/Hindi grammar scope; and no horizontal overflow at a 390-pixel viewport. The later static run passed 11 checks, including PDF mode behavior and download, SQL preservation/errors, percentage formula/errors and related page availability.

Representative tasks were exercised across all 30 English tool implementations currently eligible for ads. This is basic functional coverage, **not verification of every advertised feature or edge case**. Localized routes share these implementations; their generated pages received structural checks, with direct language-scope checks for Grammar Checker. Tests did not claim universal language support.

| Tool | Representative observed result |
| --- | --- |
| Word Counter | `Cats run. Cats sleep.` → 4 words, 21 characters, 2 sentences |
| Character Counter | `😀` → 2 UTF-16 code units, consistent with the new limitation |
| Case Converter | `Hello world` → `HELLO WORLD` |
| JSON Formatter | Boolean/numeric object round-trips; malformed JSON produces no output |
| URL Encoder/Decoder | `hello world?` → `hello%20world%3F` |
| Base64 Encoder/Decoder | `hello` ↔ `aGVsbG8=` |
| Percentage Calculator | 15% of 80 → 12 with formula; zero denominator produces an error |
| QR Code Generator | URL produces a 256-pixel canvas and PNG download control; camera decoding not tested |
| Color Converter | `#336699` → RGB 51,102,153 and HSL 210,50%,40% |
| Regex Tester | `\b\d{4}\b` matches 2026 in `Year 2026` |
| Markdown to HTML | Heading and bold sample produce `<h1>` and `<strong>` output |
| CSV to JSON | `name,role` / `Ada,Engineer` preserves both fields |
| Image Compressor | Public 96×96 PNG produces a 96×96 JPEG with measured output size |
| PDF Merger | Two synthetic two-page inputs download a four-page PDF; parsed output confirms count and dimensions |
| PDF Compressor | Synthetic two-page input downloads a rewritten two-page PDF; dimensions 300×400 and 612×792 retained |
| Image Cropper | Public 96×96 icon accepts 48×48 crop settings and produces PNG preview/download controls |
| Image Resizer | Public 96×96 icon resized to displayed 48×48 output |
| Password Generator | Default action produces one 16-character result; this does not certify entropy or password safety |
| Text Diff | One replaced line yields one addition, one deletion and one unchanged line |
| Text Analyzer | Four-word sample produces expected counts and timing assumptions |
| Color Contrast Checker | Black/white pair → 21.00:1; this does not certify a whole page's accessibility |
| Unit Converter | 1 meter → 100 centimeters |
| JSON to CSV | One name/role object → `name,role` then `Ada,Engineer` |
| Grammar Checker | Repeated `is` flagged; unsupported agreement error does not receive a correctness assurance |
| Readability Score | Ten simple words in five sentences → 10 words, 5 sentences, 10 heuristic syllables; reading ease display 100 |
| Word Cloud Generator | Repeated-word fixture produces canvas and PNG download control; full layout/placement quality remains a manual concern |
| JWT Decoder | Synthetic token exposes `sub: "123"`; no signature-verification claim |
| SQL Formatter | `'from here'` is preserved; unsupported dollar quoting fails explicitly |
| Schema Markup Generator | Organization input yields an Organization JSON-LD object; required-field completeness is not certified |
| Epoch Converter | Zero seconds → `1970-01-01T00:00:00.000Z` |

Four preliminary smoke failures were test-harness assumptions: two tools expose source in textareas; Readability requires at least ten words; Merger needs two files and downloads automatically. Corrected checks passed. Do not treat those preliminary results as product defects.

## Publishing invariants

- 83 tools, 191 generated pages, 89 sitemap URLs; the exact route and indexing sets remain unchanged.
- Exact 117 AdSense-loader members preserved. All six Phase 2 tools and nine Phase 3 pages remain `adEligible: false`.
- Build validation checks local `dist/ads.txt` offline. A live production check remains a separate post-deployment task.
- The isolated checkout excludes the unrelated `skills-lock.json` modification and unmerged interface work. No `.agents`, `.private`, browser output or private performance data is intended for a commit.
- No push, PR, merge, deployment, AdSense setting change or review request occurred in this batch.

## Still outstanding

1. **Text Humanizer:** owner selected a retirement proposal. Its route and flawed implementation remain unchanged pending approval of the [exact migration](text-humanizer-retirement-proposal.md). This remains a known quality issue, not a resolved defect.
2. **Full editorial/feature audit:** [all 117 loader pages](publisher-page-audit.md) are structurally covered; representative checks are not exhaustive feature validation. Continue the 83-tool triage, especially unsupported locale input, data-conversion edge cases, advanced PDF/image features and health/financial assumptions. Do not mark all tools reviewed from this batch.
3. **Supporting content and workflows:** links and publication gates pass, and the corrected writing/PDF steps were compared with their actual interfaces. This batch does not establish complete end-to-end manual acceptance of all five workflows or independently reverify every claim in the other nine articles.
4. **Owner evidence:** verify sustained genuine use and editorial ownership through appropriate private evidence. Never invent traffic thresholds, testimonials, authorship or engagement. Account status and review timing do not become a public performance report.
5. **Release and review:** obtain the separate release authorization, deploy verified changes, manually inspect production and check live ads.txt before any later owner decision about AdSense review. Approval is not guaranteed by passing technical checks.
