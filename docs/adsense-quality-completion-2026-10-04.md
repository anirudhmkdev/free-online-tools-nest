# Content-quality repairs and release verification — 2026-10-04

The owner requested removal of Text Humanizer and substantive repairs to the working site's tools and content, alongside the approved Campus Search Desk design. This change corrects demonstrated outputs and misleading feature claims; it does not certify Google AdSense approval.

## Deployment repair

The supplied Cloudflare log built all pages from `e88d09e` but failed during homepage image processing with `MissingSharp`. Commit `86838d7` declares Sharp as a direct production dependency. A separate pristine source archive with its own fresh `npm ci`, no shared dependency junction and no previous image cache completed the image build. Cloudflare configuration was not changed.

## What changed

- Removed Text Humanizer's component, English route, registry record and publishing policy. Search, related links, counts and favorites derive from the retained registry. No translated Humanizer route existed. A missing route uses the existing genuine 404, with no unrelated redirect.
- Repaired RFC 1321 MD5; CSS strings, math spacing and escapes; exact integer base conversion; valid XML element names/null mapping; decimal-to-words rounding; loan and mortgage input validation and zero-interest calculations; discount boundaries; raw-value BMI categories; calendar-date differences; and repeated-password scoring.
- Replaced fragile HTML-to-Markdown substitutions with maintained Turndown and its GFM plugin. Detached HTML conversion preserves inline spacing, lists and tables, removes executable elements, and discards unsafe link/image schemes.
- Hardened sitemap, canonical, meta, Open Graph, robots and schema generators. Invalid URLs and required fields prevent publishable output. Sitemaps require one origin and real optional dates. Heading and image-alt checks parse detached HTML rather than matching misleading strings or comments.
- Revised 28 tool records: descriptions, metadata, three actual usage steps, checkable examples, limitations and FAQs. Removed claims about OCR, ZIP downloads, unsupported image outputs, universally lossless compression, guaranteed rankings, measured password entropy, extra UUID modes, daylight-saving accuracy and other absent capabilities.
- Rewrote the original image-compression article around the actual local Canvas pipeline, measurable output checks and realistic limitations. Retained its actual publication date. The existing ten other articles, four hubs and five workflows remain available with their task examples, conditional decisions, real links and file-handoff guidance.
- Removed the same generic comparison table from every quality dossier. Existing specific review evidence remains; newly reviewed copy is distinguished from browser or algorithm verification. Local review dates are not invented publication dates.
- Preserved the Campus layout. Corrected narrow-screen password-field sizing, hid meaningless CSS savings during errors, and made the heuristic password score's cap explicit.

## Retained tool review

The [tool inventory](retained-tool-quality-review.md) lists all 82 retained tools and the evidence level for this release. Deep content revisions cover 28 records. The whole suite verifies registry, content, calculations and publishing invariants, but this release does not claim an exhaustive native-browser exercise of every operation in all 82 tools. Existing heuristic text tools retain explicit limits rather than being presented as AI or plagiarism proof.

## Preservation

| Signal | Before | After |
| --- | ---: | ---: |
| Tools | 83 | 82 |
| Primary / secondary tools | 25 / 58 | 25 / 57 |
| Generated routes | 191 | 190 |
| English / Spanish / Hindi routes | 123 / 34 / 34 | 122 / 34 / 34 |
| Indexable / noindex directives | 188 / 3 | 187 / 3 |
| Sitemap URLs | 89 | 88 |
| Existing AdSense loader members | 117 | 117 |

Exact built-output comparison confirmed that Text Humanizer is the sole removed route and sitemap entry. Every remaining route retains its robots directive, canonical, hreflang, redirects, AdSense eligibility, exact GA4/AdSense script snippets and tool event context. All historical fixtures, Cloudflare headers/redirects, robots.txt, ads.txt, Astro configuration, SEO head, base layout and telemetry hook remain unchanged. Concurrent edits in the original checkout were preserved.

`approved-tool-retirements.json` records this one owner-authorized retirement. `quality-completion-delta.json` records scoped content changes. Original frozen fixtures remain historical evidence; they were not rewritten to conceal regressions.

## Executed verification

- Fresh dependency installation and cold image build passed independently.
- Production build and offline publishing validation passed: 190 pages, 88 sitemap URLs, ads.txt, route membership, canonicals, indexing, links, hreflang, structured-data syntax and existing integrations.
- Vitest: 35 files, 337 tests passed. New cases cover independent MD5 reference vectors, UTF-8, CSS semantics, unsafe-integer precision, XML restrictions, decimal rounding, financial boundaries, HTML conversion, sitemap validation and the exact permitted retirement.
- Astro check: zero errors, zero warnings, 14 existing unused-code hints. ESLint: zero errors, 14 existing unused-code warnings.
- Browser results checked: MD5 `abc`; decimal `9007199254740993`; CSS math/string preservation and malformed input; XML null/empty arrays and invalid names; BMI `99.84 kg / 200 cm`; twelve zero-interest payments and rejected negative extra payments; 100% discounts; `1.999` word rounding; repeated `Password1!`; GFM conversion; invalid/escaped sitemap URLs; alt attributes; multiline/comment headings; invalid meta/canonical URLs; and required schema fields.
- Synthetic local images were selected through the native chooser, reordered, converted into a two-page PDF, then removed. Removal cleared the stale download result. The in-app browser's download-event capture timed out after activating the download link; the native saved file was not independently inspected in this release.
- Responsive confirmation covered the revised password result, XML error, tool directory and article at 320, 375, 768, 1024, 1280 and 1440 CSS pixels in both themes (48 combinations). No control overlaps or page overflow were detected after fixing the password field. This focused pass does not repeat the earlier complete Campus page-family acceptance matrix, 200% zoom or reduced-motion testing.
- The final Impeccable source detector completed with zero primary findings. It retains advisory flags for existing illustrative palette literals, semantic status colors and font sizes; these were reviewed without replacing the approved Campus identity.

Private release evidence records the responsive results, preservation comparison, build logs and file-workflow limitation. The preview copy removes telemetry loaders only from disposable built artifacts; production snippets are preserved. Production verification is separate from these local results.

## AdSense status and next review

These repairs address specific quality defects and strengthen practical value. Google has not reassessed this change yet. A successful build, a visual redesign, a sitemap, a word count or additional prose cannot establish that a site's content meets AdSense's review judgment. No approval, earnings or indexing outcome is promised, and no AdSense review was submitted.

After the authorized release is live, confirm the retired URL's HTTP status, current content markers and retained tool examples. The owner can then make the separate decision to request review in AdSense. Continue improving based on actual visitor tasks and documented tool behavior rather than producing repetitive pages or unsupported endorsements.

Primary policy references: [AdSense site-content guidance](https://support.google.com/adsense/answer/10015918?hl=en), [publisher restrictions on low-value inventory](https://support.google.com/publisherpolicies/answer/11112688?hl=en), and [Google Search spam policies](https://developers.google.com/search/docs/essentials/spam-policies).
