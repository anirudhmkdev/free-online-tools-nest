# Interaction motion

Locally verified on 2026-09-26 using Impeccable animate, alongside the pending hardening, search optimization and mobile adaptation changes.

## Intent and implementation

This pass treats the calculators as task interfaces. A freshly calculated answer briefly transitions from the existing link accent to its normal text color over 280ms. This acknowledges a submission even when the answer is unchanged. The actual final value and complete formula appear immediately; numbers never count through intermediate values. Focus remains on the result, and error handling is unchanged.

Save provides a 140ms press/release treatment confined to its heart icon. Its hit area and label stay stationary. The existing Saved label and filled heart remain the lasting confirmation; aria-pressed now exposes the toggle state.

Reduced motion removes icon scaling and shortens the color acknowledgment to 100ms. Changing the preference cancels active result feedback. Editing, resubmitting or unmounting cancels the previous animation and removes its preference listener. Browsers without the Web Animations API still calculate and display results normally.

Only the answer text color and a small icon transform animate. There are no loops, timers, layout-property animations, page-load choreography or new dependencies. No frame-rate or Core Web Vitals improvement is claimed.

## Verification

- 146 unit tests across 10 files passed.
- Astro/TypeScript: zero errors, zero warnings, 21 existing hints.
- Lint passed for both changed React components; git diff whitespace checks passed.
- Offline build and publishing gates passed: 191 pages, 89 sitemap URLs, unchanged 117-page AdSense-loader membership.
- 32 browser assertions passed in Chromium: normal/reduced motion, repeated identical submissions, editing cancellation, preference changes, keyboard and touch Save controls, invalid and impossible inputs, immediate result focus, final numerical values, animation completion and fallback without the animation API.
- All five student calculator result paths were exercised. Examples included SGPA 8.22, CGPA 8.55, marks 83.33%, attendance 60%, and required marks 62/80. Editing examples recalculated to SGPA 8.67 and required marks 72/80.
- Mobile 320px and desktop 1440px layouts were checked. Dark/mobile and light/desktop screenshots captured a paused intermediate color for inspection. Completion and fallback were also checked with a simulated 4x CPU slowdown; this is functional evidence, not a smoothness benchmark.

Browser harnesses and screenshots remain under ignored output/playwright. Physical devices, Safari and Firefox were not tested. No routes, publishing metadata, dependencies, advertising configuration or legacy indexing changed. The unrelated skills-lock.json modification was left untouched. Changes remain local and uncommitted.

Suggested next pass: Impeccable polish.
