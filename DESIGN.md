---
name: Free Online Tools Nest — Campus Playground
description: A clear, approachable search desk for real browser utilities.
colors:
  primary: "#2853b5"
  on-primary: "#fff"
  link: "#2853b5"
  link-deep: "#193e91"
  canvas: "#e8eefb"
  canvas-soft: "#f7f9ff"
  canvas-soft-2: "#d4dff5"
  ink: "#142e5b"
  body: "#485d7b"
  mute: "#485d7b"
  hairline: "#b4c5e3"
  hairline-strong: "#6d82aa"
  error: "#a82438"
  success: "#176146"
  warning: "#735018"
  dark-primary: "#adc7ff"
  dark-on-primary: "#142b58"
  dark-link: "#adc7ff"
  dark-link-deep: "#cedcff"
  dark-canvas: "#14234c"
  dark-canvas-soft: "#213764"
  dark-canvas-soft-2: "#2b4377"
  dark-ink: "#f0f4ff"
  dark-body: "#c2d0ee"
  dark-mute: "#c2d0ee"
  dark-hairline: "#566e9a"
  dark-hairline-strong: "#809cc7"
  dark-error: "#ffc0c7"
  dark-success: "#a3e4c0"
  dark-warning: "#f5d399"
typography:
  display:
    fontFamily: "'Outfit Variable', 'Noto Sans Devanagari Variable', sans-serif"
    fontSize: "clamp(40px, 6vw, 80px)"
    fontWeight: 600
    lineHeight: 1.07
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "'Outfit Variable', 'Noto Sans Devanagari Variable', sans-serif"
    fontSize: "2.5rem"
    fontWeight: 600
    lineHeight: 1.14
    letterSpacing: "-0.03em"
  section:
    fontFamily: "'Outfit Variable', 'Noto Sans Devanagari Variable', sans-serif"
    fontSize: "1.5rem"
    fontWeight: 550
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  title:
    fontFamily: "'Outfit Variable', 'Noto Sans Devanagari Variable', sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.35
  related-heading:
    fontFamily: "'Outfit Variable', 'Noto Sans Devanagari Variable', sans-serif"
    fontSize: "18px"
    fontWeight: 550
  body:
    fontFamily: "'Outfit Variable', 'Noto Sans Devanagari Variable', sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  reading:
    fontFamily: "'Outfit Variable', 'Noto Sans Devanagari Variable', sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "'Outfit Variable', 'Noto Sans Devanagari Variable', sans-serif"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: "24px"
  metadata:
    fontFamily: "'Outfit Variable', 'Noto Sans Devanagari Variable', sans-serif"
    fontSize: "14px"
    lineHeight: 1.5
  hindi-body:
    fontFamily: "'Noto Sans Devanagari Variable', 'Outfit Variable', sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0"
  code:
    fontFamily: "'JetBrains Mono', ui-monospace, Consolas, monospace"
    fontWeight: 400
rounded:
  control: "12px"
  tool-card: "20px"
  surface: "24px"
  pill: "999px"
spacing:
  tiny: "4px"
  small: "8px"
  inset-small: "12px"
  base: "16px"
  control-inline: "20px"
  inset: "24px"
  section-gap: "32px"
  collection-column: "40px"
  section: "48px"
  major: "64px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.link-deep}"
    textColor: "{colors.on-primary}"
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "44px"
  nav-action:
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    size: "44px"
  tool-card:
    backgroundColor: "{colors.canvas-soft}"
    rounded: "{rounded.tool-card}"
    padding: "24px"
  tool-card-hover:
    backgroundColor: "{colors.canvas-soft-2}"
  tool-card-compact:
    backgroundColor: "{colors.canvas-soft}"
    rounded: "{rounded.tool-card}"
    padding: "16px"
  workspace:
    backgroundColor: "{colors.canvas-soft}"
    rounded: "{rounded.surface}"
    padding: "24px"
  input:
    backgroundColor: "{colors.canvas-soft}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
  search:
    backgroundColor: "{colors.canvas-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "8px 12px 8px 24px"
  navigation:
    backgroundColor: "{colors.canvas-soft}"
    rounded: "{rounded.pill}"
    padding: "8px 12px 8px 24px"
  contents:
    backgroundColor: "{colors.canvas-soft}"
    rounded: "{rounded.surface}"
    padding: "16px 24px"
  worked-example:
    backgroundColor: "{colors.canvas-soft-2}"
    rounded: "{rounded.surface}"
    padding: "24px"
---

# Design System: Free Online Tools Nest

## Overview

**Creative North Star: "Campus Playground — Search Desk"**

The approved world is an approachable desk for finding a useful tool, doing a small task and understanding its result. Cool paper surfaces, cobalt controls, broad Outfit headings and a slim stationery photograph give the homepage character. Operating pages bring the workspace forward; guides and articles use a calmer reading rhythm. The existing two-line wordmark and truthful product voice remain part of the identity.

This is the current local production implementation, documented from source on 2026-10-04 after the user selected Search Desk B, approved its working preview and authorized implementation. The prior Vercel-inspired reference is preserved at `.private/campus-production-rollout/baseline-site/DESIGN.md`; it is historical context. PRODUCT.md's specification/mockup-only phase statement is also historical and has not been edited. No push, merge or deployment is authorized by this document.

The frontmatter is the normative token record. `src/campus.css` supplies the active presentation overrides after `src/styles.css`; the latter still supplies shared utility mechanics. The extracted names for spacing and shape describe reused implemented dimensions, without introducing new CSS variables. `src/campus-fonts.css`, the shared layouts, Campus icon component and `src/scripts/campus-motion.ts` provide the remaining ground truth. `.impeccable/design.json` extends these tokens with shadows, motion, breakpoints and standalone component samples.

**Key Characteristics:**

- Cobalt actions on pale blue surfaces, with an equally deliberate dark palette.
- Floating pill navigation, visible search and native disclosure controls.
- Compact, stable workspaces; metadata and engagement follow the operating tool.
- Drawn category icons, readable descriptions and a measured article column.
- Decorative motion is finite and optional; content is visible without it.

**Evidence boundary.** The final screenshot directory `.private/campus-production-rollout/evidence/screenshots/` contains 36 settled, normal-scale captures: nine representative families—home, directory, calculator, editor, upload, visual, workflow, article and Hindi—at 375×812 and 1440×900 in both themes. The [rollout report](docs/campus-search-desk-rollout.md) records the passing local build and 261 tests, zero generated publishing/analytics differences, 192 measured responsive states and 16 palette comparisons. The independent reviewer resolved three findings and returned “ship” at that three-fix verdict scope. These are bounded checks, not proof that every route, input or browser state passed.

Native file selection, ordering, conversion and completed download flows, native 200% browser zoom, OS reduced-motion switching, complete screen-reader behavior, a JavaScript-disabled browser run and a complete network trace remain unverified. The native Impeccable approval receipt and its comp-diff cycle are historical pending records; human chat approval must not be fabricated into that receipt. Local visual work does not establish AdSense approval or production readiness.

## Colors

Cool paper and cobalt form one visual family. Dark mode changes the same semantic roles to navy surfaces, light ink and pale blue actions; it does not add another accent vocabulary.

### Primary

- **Desk Cobalt / Night Periwinkle:** `primary` and `dark-primary` carry principal buttons, focused selection, task disclosure and link emphasis. `on-primary` and its dark counterpart supply the paired foregrounds.
- **Link Cobalt:** `link` follows the primary hue; `link-deep` provides the implemented hover and pressed treatment. Resolve each to its current theme rather than hard-coding a light value into a component.

### Secondary

- **Result Green:** `success` and `dark-success` communicate a valid or successful state where existing tools use that role. They are not decoration.
- **Caution Ochre:** `warning` and `dark-warning` support existing warnings.
- **Error Rose:** `error` and `dark-error` support existing errors. Preserve explanatory text alongside state color.

### Neutral

- **Blue Paper:** `canvas` is the page background; `canvas-soft` is the raised-looking navigation, workspace and card surface; `canvas-soft-2` is the quieter grouping or hover surface.
- **Navy Ink:** `ink` supplies headings and high-priority text. `body` and `mute` share a readable secondary value in this system; do not restore faint legacy captions.
- **Soft Divider / Strong Control Edge:** `hairline` divides content; `hairline-strong` outlines fields, filters, secondary buttons and menus. Control outlines use the strong role.

**The Paired Palette Rule.** Every new surface uses the active semantic roles. The frontmatter's `dark-*` tokens map to the identically named CSS roles under `html.dark`; they are theme overrides, not separate component roles.

## Typography

**Display and body font:** Outfit Variable, with Noto Sans Devanagari Variable and a generic sans fallback. Outfit Latin and Latin Extended files are served locally with `font-display: swap`.

**Hindi font:** Noto Sans Devanagari Variable comes first on Hindi pages. Devanagari, Latin and Latin Extended font files are local. Hindi headings remove negative tracking.

**Code font:** JetBrains Mono, with UI monospace and Consolas fallbacks, is reserved for code, examples and numeric outputs that need it. Its existing Google Fonts request remains; the system must not claim all font loading is local.

### Hierarchy

- **Display:** the frontmatter's responsive display role belongs to the homepage hero. Its deliberate desktop line break collapses below 640px; real wording may wrap naturally.
- **Headline:** the general page heading uses the headline role. At widths below 768px, general headings reduce to 2rem. Individual tool headings use 2.25rem and a line height of 1.15, with the mobile general size override; guide headings use 2.5rem and reduce to 2rem on mobile.
- **Section:** the section role sets the shared heading scale. Homepage collection headings have their implemented 28px group heading and 22px collection title; do not turn these surface-specific sizes into a universal scale.
- **Title:** tool-card titles use the title role, with clear visual distinction from their full descriptions. Complete names wrap naturally; they are not reduced to one line or an ellipsis.
- **Related heading:** supporting related-tool headings use the shared Outfit stack (18px, weight 550), retaining the prose hierarchy rather than introducing a code-label face.
- **Body:** the body role serves navigation, inputs, controls, tool explanation and compact supporting text. Labels use medium weight rather than an uppercase eyebrow convention.
- **Reading:** articles and prose-like informational pages use the reading role, with a maximum measure of 65ch. Guide paragraphs use the same desktop rhythm and reduce to 16px below 768px.
- **Metadata:** the small role remains readable. It is supporting information, not a heading substitute.

**The Reading Measure Rule.** Keep article prose, prose-like informational copy and guide explanation within the implemented 65ch measure. Both article forms receive paragraph spacing (24px), heading separation (48px above, 16px below) and visible list markers; a sequence of touching paragraphs is not this system.

## Layout

The shared page container caps its content at 1200px plus two gutters. Gutters are 16px by default, 24px from 768px and 32px from 1280px. The floating header itself caps at 1200px. Vertical groups use the extracted spacing steps rather than a new spacing scale.

The homepage's centered copy caps at 960px and search at 800px. The stationery strip combines a broad photograph with a 240px task disclosure, then stacks below 768px. Three task collections become two below 1024px and one below 640px. This is the homepage composition; operating tools and reading pages have their own density.

Tool pages run in a vertical sequence: breadcrumbs, title and existing description, operating workspace, tool facts and favorite/share controls, then review information and supporting explanations. Attendance, age, percentage, marks percentage, required marks and random-number tools cap their content at 880px plus gutters. Other tools retain the shared width for editors, files and visual outputs. Related tools follow the workspace in four columns, two below 1024px and one below 640px. Avoid a sticky sidebar beside a working result.

Guide layouts place a 260px contents/related column beside the 65ch main column from 1024px; smaller widths restore reading order in one column. Reading-family page containers cap at 900px plus gutters, with prose still limited to 65ch. Long text wraps; wide code and tables scroll within their own output bounds. Menus scroll within their own viewport bounds. The page is not a substitute for an overflowing menu or output.

**The Workspace First Rule.** Keep controls and results stable and early in the tool page. Engagement, category facts, review details and related destinations follow the workspace rather than competing with it before the visitor can act.

## Elevation & Depth

Tonal surfaces and clear edges create most depth. The current Campus card and workspace overrides remove ambient card shadows; cards change surface tone on hover without lifting their container. Soft diffuse shadows are limited to the floating navigation and transient menus/search results. Keep the source shadow values in the sidecar so the frontmatter stays within its token schema.

### Shadow Vocabulary

- **Floating navigation:** the `shadow-elevated` CSS role gives the header its small diffuse separation. The implemented value is shared by both themes.
- **Transient surface:** the `shadow-modal` role separates Browse, command search and search results from the page. It has an explicit dark-mode override.
- **Tool surface:** `shadow-card` and `shadow-card-hover` are `none` in the Campus overrides.

**The Quiet Surface Rule.** Establish tool and reading groups with surface tone, spacing and appropriate borders. Reserve shadow for floating or transient UI; do not reapply the historical stacked-card or hard-offset shadow vocabulary.

## Shapes

Generous rounded corners make controls approachable without changing their behavior. Inputs and icon tiles use the control radius; tool cards use their own card radius; workspace panels, contents, worked examples, photograph and menu surfaces use the surface radius. Navigation, buttons and pill controls use the pill radius. Existing processing-component utilities may retain smaller shapes; their incidental values are not new Campus defaults.

Fields and secondary controls have a one-pixel strong edge. Decorative dividers use the soft edge. Icons are inline drawn SVG, generally 22px, with 40px category tiles. Tool categories map consistently to text, code, calculator, swap, files, search and palette. Keep icon decoration hidden from assistive technology while preserving the control's accessible name.

## Components

### Buttons

Clear, compact pill controls put the task label first. Primary buttons use paired primary colors; hover and active states use the deeper link tone. Secondary buttons use the canvas and ink with a strong border. The shared button utility keeps medium labels, 44px height and 20px horizontal padding after Campus overrides. Wrapped labels must remain visible.

The interaction target floor is 44×44px. Navigation actions use an actual 44px square; tool buttons apply minimum height and width. This is a design requirement and a source pattern, not a claim that every existing inline link has been independently measured. Disabled operating buttons retain the implemented opacity of 0.65 and disabled cursor.

### Cards / Containers

Tool cards use a soft surface, complete wrapping name, full description, category icon and a restrained arrow affordance. Default cards use the extracted 24px inset; related compact cards use 16px. Hover changes tone. The base grid and body flex mechanics still come from `styles.css`, while Campus supplies its current radius, color, spacing and text sizes.

Workspaces use a rounded soft panel with a compact divider row. Do not turn all reading paragraphs into cards. Worked examples use the stronger soft surface to distinguish an actual example from surrounding explanation.

### Inputs / Fields

Operating inputs, selects and textareas use a soft surface, ink text, strong edge, control radius and at least 48px height. Textareas start at 180px. Their source padding remains component-specific; the system does not introduce a new universal input-padding value. Numeric and code outputs can use tabular figures, and preformatted outputs retain their own horizontal scrolling.

Visible focus uses the shared three-pixel link-colored outline with a three-pixel offset. The hero search transfers that focus indication to the enclosing field via `:focus-within`, while its inner input removes a duplicate outline. Error, empty, unsupported and disabled behavior remains the operating component's responsibility; do not hide it through presentation overrides.

### Navigation

The sticky floating pill keeps the existing two-line wordmark, search and theme actions. Full desktop links appear at 1280px. English exposes three core collections and a native automatic Browse popover for the remaining real destinations. Smaller widths use one native modal dialog drawer, with a close control, scrollable content and focus restoration. Opening command search closes competing menus first; resizing across the desktop breakpoint closes them as well.

The drawer uses the viewport height and bottom safe-area inset. Browse placement and maximum height are measured from the actual header. The header-derived scroll offset replaces the default estimate after measurement; anchors should not disappear under the sticky header. A no-script navigation fallback preserves actual links. Localized navigation uses only published localized destinations and the existing English-only blog destination.

### Search and task disclosure

The broad search desk has an explicit label, real tool matching, keyboard selection and bounded results. Descriptions are visible; do not replace search with a decorative field. The adjacent task collection uses native `details`/`summary` so its essential destinations work without a custom animation runtime.

### Workspace guidance

The workspace's compact guidance row uses native `details`/`summary`. Its existing local-processing explanation is available on demand rather than taking space above every operating control. Keep the tool component in its slot, and keep the All tools destination alongside the disclosure. Metadata, category icons, favorite/share controls and supporting content appear after the workspace.

### Reading and contents

Article prose and prose-like informational content share the reading measure and paragraph/list rhythm. Guides expose a native contents disclosure with real section anchors, clear manual handoff wording, examples and limitations. Tools open as separate pages; users download an output and select it in the next tool. Do not imply automatic file transfer, assignment submission or an institutional guarantee.

### Decorative motion

GSAP and ScrollTrigger provide three finite enhancements: a once-only stationery image scale reveal, a short Browse scale expansion, and one outward-and-back arrow response. Their exact timings and easing names are recorded in the sidecar. No working field, result, heading or page section is pinned or displaced by these sequences. Essential content is visible before the scripts load and remains usable if they are unavailable.

Only `prefers-reduced-motion: no-preference` enables the GSAP sequences. Reduced motion removes Campus CSS animation and transitions, restores normal scrolling and removes the decorative image transform. This describes the implementation; OS-level switching remains an unverified check.

## Do's and Don'ts

### Do:

- **Do** use the current semantic palette in both themes and retain strong field/control edges.
- **Do** use Outfit for the shared visual voice, Devanagari-first Hindi text and JetBrains Mono where code needs it.
- **Do** keep operating workspaces compact, labels visible, focus obvious and interaction targets at least 44×44px.
- **Do** keep prose and prose-like content on the same deliberate reading rhythm, with visible list markers and appropriate spacing.
- **Do** keep all 83 tools, all 191 routes, the 25-primary/58-secondary discovery policy and the existing localized availability. Presentation does not change publishing eligibility.
- **Do** preserve canonical, robots, hreflang, sitemap, structured-data and recorded-date behavior; GA4/event context; the exact 117-page AdSense-loader set; advertising and Cloudflare configuration; and frozen publishing fixtures. Verify those through the separate baseline/validation workflow.
- **Do** preserve calculations, helpers, file logic, search/favorites/download behavior and truthful claims. Local input processing remains distinct from analytics, advertising and any remote font requests.

### Don't:

- **Don't** restore the prior Vercel palette, mesh decoration or shadow system as the visual authority.
- **Don't** hide required controls or results behind decorative motion, move operating surfaces on scroll or add automatic file handoffs.
- **Don't** replace the drawn category icon system with glyphs or emoji, or add kickers/eyebrows above headings.
- **Don't** invent translations, destinations, review dates, endorsements, traffic numbers, privacy guarantees or AdSense approval claims.
- **Don't** treat screenshot coverage, source compliance or a passing build as proof of full browser behavior, native approval or production release.

**Historical drift not repaired here:** PRODUCT.md's immediate-deliverable phase wording and older utility comments naming the prior DESIGN.md remain historical. The documenter's write boundary excludes their source files. Unverified native file flows, zoom, OS motion switching and the pending native review receipt stay explicit rather than being absorbed into the system as a pass.
