# Tool usability pilot

Reviewed locally on 2026-09-26. Branch: `codex/tool-usability-pilot`, based on approved Phase 3 commit `9acecffca2a685f2f3bef0fb159ab8a5d674dcda`.

Phase 3 PR #3 was still open when this branch was created. This is separate local work; the existing PR was not updated, merged or deployed.

## Changes

- Shared calculator number fields expose required, range and step constraints. Basic input errors appear beside their fields with `aria-invalid` and linked descriptions; the error summary links back to each affected field. Editing, loading an example and removing rows clear stale field messages. Domain-specific validation remains in the existing mathematical helpers.
- Empty optional attendance/assessment-maximum fields and disabled/excluded fields remain valid omissions. Attendance uses whole-number input controls for class counts and the existing two-decimal target constraint. No formula, threshold, weighting or university rule was changed.
- Calculator errors and results receive keyboard focus. Focus targets are explicitly revealed below the fixed navigation. Results retain their numerical answer, visible formula breakdown and limitations, including impossible-target results.
- Image to PDF presents selection, ordering and settings as a visible sequence. It retains native file selection and exposes larger previews, page numbers, controls at least 44 px high, and a useful empty state. Reordering and removal preserve useful focus; download readiness focuses the download action.
- File errors retain previously selected images, remove stale processing messages and explain recovery. Repeating the same settings error returns focus to its message. Cancellation and existing application guardrails remain available. File contents remain in the browser.

## Verification

- `npm run test`: 139 tests passed across nine files, including existing student mathematics and image/PDF helper cases.
- `npm run build`: 191 generated pages and 89 sitemap URLs. Offline publishing, exact legacy membership, canonical, link, structured-data, ads.txt and stable-content/source checks passed.
- `npm run check`: zero errors, zero warnings, 21 existing hints.
- ESLint on all four edited source files: passed without warnings.
- Calculator browser cases: blank-field errors and links, example recovery on all five calculators, result focus, repeated domain errors, attendance zero-class and 0%/100% boundaries, explicit equal CGPA weighting, rejection of an unselected weighting method, excluded empty courses, and optional/unused required-marks inputs.
- Browser example results remained 60% attendance, SGPA 8.22, credit-weighted CGPA 8.55, marks percentage 83.33%, and required marks 62/80. These use the existing example buttons, not institutional assumptions.
- Responsive checks covered Attendance, CGPA and Image to PDF at 320, 390, 768 and 1440 CSS px in both themes, with no horizontal overflow. Final PDF output also passed simulated 200% zoom/reflow. Reorder/remove controls measured at least 44 by 44 px.
- Real synthetic-image handoff: selected pages 2,1,3, reordered using keyboard-accessible controls, downloaded a 49,393-byte three-page PDF, then inspected the page count and rendered pages 1,2,3 independently.
- Invalid-image selection preserved the existing three-image selection. Removing an image invalidated the prior download. Clearing images returned focus to file selection. Cancelling a 20-image selection produced the cancellation state without retaining partial new images.
- No image filenames or image payload markers appeared in the 21 observed external requests during the final file flow. The processing helpers and their privacy behavior were unchanged; this observation is not a blanket assertion about every site request.
- Two interaction issues found during verification were corrected: repeated PDF errors did not restore focus, and automatic calculator focus could leave a field beneath the fixed header. A focused regression check then passed nine focus/visibility cases, including repeated results and PDF errors.

Local scripts, screenshots, logs and synthetic files are ignored under `output/playwright/ux-*`. Initial browser harness selectors were corrected to wait for the tool island rather than the hidden search island and to capture the workspace rather than all panels. These were test-harness failures, not application failures.

Verification used Chromium with emulated viewport sizes and keyboard interaction. Physical touch devices, Safari/Firefox and full screen-reader testing were not performed. No accessibility certification or measured performance improvement is claimed.

## Impeccable and scope

Applied the installed Impeccable guidance for Operate interfaces, clarification, hardening, adaptation and bounded refinement, preserving the existing visual identity. Its context launcher could not install the missing engine in the available cache, so existing project context and written guidance were used directly. No automated Impeccable detector result or formal scored critique is claimed.

The four source changes are `CalculationResult.tsx`, `AttendanceCalculator.tsx`, `RequiredMarksCalculator.tsx` and `ImageToPdf.tsx`. No dependency, mathematical/file-processing helper, route, indexing policy, advertising configuration, tool-quality record, localization or protected fixture was changed. Existing AdSense-loader membership remains 117; all nine Phase 3 pages and six Phase 2 tools remain ad-ineligible.

The unrelated `skills-lock.json` modification and skill files are excluded. No private analytics data was added. This pilot does not authorize a push, merge, deployment, Phase 4 or AdSense review.
