# Final UI polish

Local Impeccable polish pass, 2026-09-26. Preserves the existing design and builds on the pending hardening, search optimization, adaptation and motion changes.

## Findings addressed

- Saved used decorative pink for small text, measuring 3.46:1 on its light background. The label now uses the existing ink token; the heart and border retain pink. Measured label contrast is 16.44:1 light and 14.87:1 dark.
- Save changed width when its label became Saved. A shared spacing-scale minimum width keeps the control stable without changing the label or hit area.
- PDF Merger's red Remove label measured 4.16:1 light and 3.84:1 dark. It now follows Image to PDF's underlined link treatment, measuring 4.88:1 light and 4.73:1 dark.
- PDF file mutations remained available during merging, allowing the visible list to diverge from the in-progress download. Add, remove, reorder and file input controls are now disabled until the merge finishes or fails, with consistent disabled cursors and opacity.
- Adding files after a successful merge retained an obsolete download confirmation. Successful additions now clear it. The confirmation uses readable body text and a status role.
- PDF Merger's busy spinner now respects reduced motion; the Merging label remains visible. Enabled reorder controls have hover feedback.

## Verification

The initial rendered inspection covered custom grade mapping at 320px and 1440px, the PDF Merger one-file state at 320px, and Image to PDF's empty state at 1440px. Final screenshots cover dark mobile merging and light desktop success.

- 146 unit tests in 10 files passed.
- Astro/TypeScript: zero errors, zero warnings, 21 existing hints.
- ESLint passed for both components modified in this pass; diff whitespace checks passed.
- Offline build and publishing gates passed: 191 pages, 89 sitemap URLs, unchanged 117-page AdSense-loader membership.
- 19 Chromium browser assertions passed: stable Save width and pressed state, theme contrast, one-file disabled state, controls locked during an instrumented pending file read, reduced-motion busy state, real PDF download, status role, controls restored after success/failure, stale confirmation cleared, corrupt-PDF recovery and retry, layouts at 320/768/1440px, visible keyboard focus, keyboard unsave and no uncaught errors.

The busy-state harness delays a local file read solely to make the transient state inspectable. Actual merge and download execute normally after release. Browser fixtures, scripts and screenshots remain in ignored output/playwright. Native assistive technology, physical devices and Safari/Firefox were not tested; status-role verification does not claim a manual screen-reader test.

No routes, dependency files, publishing metadata, fixtures, advertising configuration or legacy indexing changed. The unrelated skills-lock.json change was not edited. Nothing was committed, pushed or deployed.
