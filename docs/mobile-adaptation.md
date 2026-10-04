# Mobile and touch adaptation

Reviewed locally on 2026-09-26 using the Impeccable adapt workflow, on top of the pending accessibility and search optimization changes.

## Changes

- Save and social/system Share controls now have at least 44px targets. Share controls wrap when space is limited.
- Course, semester, subject and custom-grade removal buttons have at least 44px targets. GPA inclusion and marks-threshold checkbox labels provide larger clickable areas.
- Custom GPA mappings stack label and point inputs on small screens and retain two columns from the existing small-screen breakpoint upward.
- PDF Merger displays the complete filename above its actions, including long unbroken names. Up/down controls are separate 44px buttons; remove, add and merge actions also meet the target size. The file summary wraps instead of crowding narrow screens.
- Target sizes apply on large screens too, supporting touch laptops without relying on viewport-based device detection.

No mathematical logic, routes, page policies, dependencies, advertising configuration or legacy indexing changed. The unrelated skills-lock.json modification was not edited.

## Local verification

- Existing unit suite: 146 tests across 10 files passed.
- Astro/TypeScript: zero errors and warnings; 21 existing hints.
- ESLint for the six adaptation components: passed without warnings.
- Offline production build and publishing validator passed: 191 pages, 89 sitemap URLs, unchanged advertising-loader membership of 117 pages.
- Browser verification: 55 assertions plus four confirmation checks passed. Tests exercised synthesized Chromium touch taps, keyboard grade-row actions, course inclusion, row removal, favorites, PDF reordering and a download from two valid local PDFs. System sharing used a stub; no messages were sent.
- SGPA, CGPA and marks examples still display 8.22, 8.55 and 83.33% respectively.
- Layouts fit at 320x800, 768x1024, 844x390 landscape and 1440x900. A 640px viewport with CSS zoom at 200% also fit. Checks covered custom GPA mappings, semester inputs, marks thresholds, long PDF filenames and shared actions on Spanish/Hindi tool pages. No uncaught application errors occurred.
- Fresh mobile and dark desktop screenshots were captured under ignored output/playwright. Test harnesses and synthetic document fixtures also remain there.

## Evidence limits

Touch evidence comes from Chromium with hasTouch enabled, not a physical device. CSS zoom is a layout stress test, not a substitute for browser/OS text-size settings. Physical iOS/Android devices, Safari, Firefox, native share sheets and the full 83-tool inventory were not tested in this scoped pass. No custom sliders or drag gestures were changed. No performance or Core Web Vitals improvement is claimed.

Changes remain local and uncommitted; nothing was pushed or deployed. A subsequent polish pass can review the final visual details.
