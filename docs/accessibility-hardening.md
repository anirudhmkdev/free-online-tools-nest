# Accessibility hardening — local verification

Reviewed 2026-09-26 on `codex/accessibility-hardening`, following the Impeccable technical audit. This change addresses the audited upload, contrast, search-modal and cancellation findings. It also respects reduced motion in the modified search panel. It does not implement the separate search-payload optimization or general touch-target expansion recommendations.

## Changes

- Eleven legacy image/PDF upload surfaces now expose a labeled native file input across the existing upload area, with a visible surrounding keyboard-focus outline. Existing drag/drop handlers and processing logic remain in place. Affected tools: Image Compressor, Image Cropper, Image Filter, Image Format Converter, Image Resizer, Image to Base64, PDF Compressor, PDF Merger, PDF Splitter, PDF to Images and PDF to Text.
- PDF Merger now retains a file input in its selected-files state, so the existing Add More button can open a picker after initial selection.
- Global search uses a native modal dialog. Background content is inert, Tab stays within the dialog, dismissal restores the invoking control, and keyboard results are connected through combobox/listbox semantics. There is a localized close button, a wrapping empty-result message and a reduced-motion entrance alternative. Closing search invoked over an already-open mobile menu restores focus within that menu.
- Readable muted text uses `#707070` in light mode and `#999999` in dark mode. Light links use `#0066dd`. Muted/link text exceeds 4.5:1 on all three shared surface colors: the lowest measured pairs are 4.54:1 in light mode and 4.73:1 in dark mode. These measurements concern these token pairs, not every possible element/background combination on the site.
- Image-to-PDF cancellation restores focus after the busy state clears, to Create PDF when files remain or file selection otherwise. Existing images and status feedback remain available. A synchronous controller guard prevents overlapping selection/generation operations.

## Verification

| Check | Result |
|---|---|
| Unit suite | 139 tests passed across 9 files |
| Astro type check | 0 errors, 0 warnings; 21 existing hints |
| Full lint | 0 errors; 76 existing warnings, including local ignored skill scripts |
| Final changed interaction-component lint | 0 errors or warnings |
| Build and offline publishing validation | 191 pages, 89 sitemap URLs; passed |
| Generated AdSense-loader membership | 117 pages; frozen membership validation passed |
| Browser regression batch | 35 assertions passed |
| Focused final browser confirmation | 6 assertions passed |

Browser checks used Chromium against the local production build. They covered forward/reverse Tab, background inertness, Escape and close-button restoration, header/mobile-menu entry points, repeated opening/closing, nested modal focus, backdrop dismissal, result navigation, English/Spanish/Hindi close labels, long Unicode/RTL/CJK search strings, empty-result Enter, loaded search while offline, reduced motion, upload focus on all eleven tools, PDF Merger selection recovery, invalid Image-to-PDF input, cancellation with twenty retained images, and shared contrast pairs. Search fit at 320, 768 and 1440 CSS pixels. Screenshots were reviewed at those widths and for the PDF error state in light/dark themes.

Dedicated native-picker checks confirmed Enter opens Image Cropper's picker and loads a synthetic image, and PDF Merger's Add More opens a picker by keyboard and retains both selected PDFs. A Chromium forced-colors simulation retained the upload focus outline. These are browser/emulation checks, not physical-device or screen-reader certification.

Local scripts, synthetic inputs, screenshots and outputs are ignored under `output/playwright/`, including `harden-browser-results.txt` and `harden-final-confirm-results.txt`. No new dependencies were installed into the project. The existing mathematical unit tests were retained; the changed behavior was verified in a real browser rather than through source-string tests.

## Verification notes and limits

- An initial build correctly rejected additions to frozen translation files. Those additions were removed; the three new close labels are additive component-local strings. Publishing fixtures and legacy translation sources were not relaxed or rewritten.
- Initial browser-harness corrections accounted for the existing focus-outline transition, the CLI's separate native-file-dialog handling, and minified three-digit CSS colors. These were test-harness issues, not silently treated as passing application checks. The final assertion batches passed.
- The Impeccable engine was unavailable during the preceding audit. No clean detector result is claimed. This work used its written hardening workflow, source review and browser verification.
- Safari, Firefox, physical touch devices, screen readers and field performance remain untested. Offline coverage means search after the page has loaded, not a new offline-install capability.
- Routes, canonical/indexing policy, legacy protected content, dependencies, AdSense configuration and ads.txt remain unchanged. The existing six Phase 2 tools and nine Phase 3 pages retain their advertising policy. Private Search Console data was not used. The unrelated `skills-lock.json` change is outside this work.

Implementation and verification are local only. No commit, push, PR, merge, deployment or AdSense-review request was performed. A subsequent `$impeccable polish` pass can check final consistency; the separate performance and touch-target recommendations remain available for their respective workflows.
