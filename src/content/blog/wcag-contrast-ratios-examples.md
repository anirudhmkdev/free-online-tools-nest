---
title: "WCAG Contrast Ratios With Practical Color Examples"
description: "Understand relative luminance, AA and AAA contrast thresholds, and practical checks for text and interface colors."
pubDate: 2026-08-26
tags: ["accessibility", "wcag", "design"]
draft: false
---

Contrast ratio compares the relative luminance of a lighter color with a darker color. The range runs from 1:1 for identical colors to 21:1 for black against white. The calculation is based on linearized sRGB channel values, not a simple difference between hexadecimal numbers.

Enter `#000000` and `#FFFFFF` in the [WCAG Color Contrast Checker](/tools/color-contrast-checker/). The result is 21:1, which passes WCAG AA and AAA text thresholds. A subtler gray pair can fail even when it looks acceptable on one monitor.

For WCAG 2.x, common text thresholds are 4.5:1 for normal text at AA, 3:1 for large text at AA, 7:1 for normal text at AAA, and 4.5:1 for large text at AAA. Non-text UI components and meaningful graphical boundaries commonly use a 3:1 requirement against adjacent colors. Check the exact success criterion for your interface and policy target.

## Practical checks

- Test default, hover, focus, active, disabled, error, and visited states separately.
- Composite transparency over the real background before calculating the final colors.
- Do not rely on contrast alone to communicate status; add text, icons, or patterns.
- Large text depends on rendered size and weight, not the visual importance of a heading.
- A passing pair does not prove the whole component is accessible. Focus visibility, touch targets, labels, zoom, and screen-reader semantics still matter.

The browser checker evaluates the two entered colors using the formula. It cannot inspect gradients, background images, overlays, or anti-aliasing. Use browser accessibility tools and manual testing on the deployed interface for those cases.

Primary reference: [WCAG 2.2 contrast minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).
