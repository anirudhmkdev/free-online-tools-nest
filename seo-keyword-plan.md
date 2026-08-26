# SEO Keyword Plan — Free Online Tools Nest

## Part 1: Main Site Pages (Homepage + Static Pages)

> **Current state** as of June 2026. Documented below is what each main site page currently uses for meta titles, descriptions, and implicit keyword targets.
>
> ⬇️ **Your job**: research and fill in the `target_keyword` column below for each page you want to optimize. I'll then apply new metaTitle, metaDescription, and any needed content changes.

---

### Where Meta Lives

All static page meta (homepage, about, contact, faq, privacy, terms) is stored in **`src/i18n/ui.ts`** under the `en` locale keys. 404/500 error pages use `err.*` keys. Favorites page has hardcoded meta in its Astro frontmatter. The `SITE` constant in `src/data/tools.ts` provides brand-level defaults.

Error pages (404, 500) and Favorites page are **noindexed** — they won't appear in search results anyway. The root-level redirect pages (index.astro, about.astro, contact.astro, privacy-policy.astro, terms-and-conditions.astro) also have `noindex, follow` and are just JS redirectors.

---

### Pages to Optimize

#### 1. Homepage (`/en/`)

| Field | Current Value |
|-------|---------------|
| **metaTitle** | `62 Free Online Tools — Private Browser Utilities, No Signup` |
| **metaDesc** | `Access free online tools for text, code, math, SEO, and design. Tool inputs are processed in your browser with no signup required.` |
| **Source** | `home.metaTitle` / `home.metaDesc` in `src/i18n/ui.ts` |
| **Implicit keywords** | free online tools, browser utilities, no signup, private browser tools |
| **Target Keyword (fill in)** | online tools, free web tools, frontier utilities |

#### 2. About Page (`/en/about/`)

| Field | Current Value |
|-------|---------------|
| **metaTitle** | `About Us — Free Online Tools Nest` |
| **metaDesc** | `Learn about Free Online Tools Nest, our mission, values, and dedication to providing fast, browser-based, and private utility tools for everyone.` |
| **Source** | `about.metaTitle` / `about.metaDesc` in `src/i18n/ui.ts` |
| **Implicit keywords** | (brand only — no real keyword targeting) |
| **Target Keyword** | about free online tools website |

#### 3. Contact Page (`/en/contact/`)

| Field | Current Value |
|-------|---------------|
| **metaTitle** | `Contact Free Online Tools Nest — Support & Feedback` |
| **metaDesc** | `Have feedback, a tool suggestion, or need to report a bug? Contact the Free Online Tools Nest team. We respond within 1-2 business days.` |
| **Source** | `contact.metaTitle` / `contact.metaDesc` in `src/i18n/ui.ts` |
| **Implicit keywords** | (brand only — low SEO priority) |
| **Target Keyword** | contact free online tools support |

#### 4. FAQ Page (`/en/faq/`)

| Field | Current Value |
|-------|---------------|
| **metaTitle** | `Frequently Asked Questions — Free Online Tools Nest` |
| **metaDesc** | `Find answers to common questions about Free Online Tools Nest. Learn how our browser-based utility tools keep your data 100% secure and private.` |
| **Source** | `faq.metaTitle` / `faq.metaDesc` in `src/i18n/ui.ts` |
| **Implicit keywords** | browser-based utility tools, private online tools |
| **Target Keyword (fill in)** | are online text tools safe, do online tools save your data, where do web tools upload files, how do browser based tools work, client side vs server side online tools |

#### 5. Privacy Policy (`/en/privacy-policy/`)

| Field | Current Value |
|-------|---------------|
| **metaTitle** | `Privacy Policy — Free Online Tools Nest` |
| **metaDesc** | `Read the privacy policy of Free Online Tools Nest. Discover how our client-side browser tools ensure 100% data privacy and security.` |
| **Source** | `privacy.metaTitle` / `privacy.metaDesc` in `src/i18n/ui.ts` |
| **Implicit keywords** | client-side browser tools, data privacy, online tool security |
| **Target Keyword** | free online tools privacy policy client side |

#### 6. Terms & Conditions (`/en/terms-and-conditions/`)

| Field | Current Value |
|-------|---------------|
| **metaTitle** | `Terms & Conditions — Free Online Tools Nest` |
| **metaDesc** | `Read the terms and conditions for using Free Online Tools Nest. Learn about our free tool service, disclaimers, your rights, and limitations of liability.` |
| **Source** | `terms.metaTitle` / `terms.metaDesc` in `src/i18n/ui.ts` |
| **Implicit keywords** | (brand only — boilerplate SEO, low priority) |
| **Target Keyword** | free online tools terms of service |

---

### Noindex Pages (Search results not affected)

| Page | metaTitle | metaDesc | Reason |
|------|-----------|----------|--------|
| **404 Error** | `Page not found` | `The page you're looking for doesn't exist or has been moved.` | `noindex` |
| **500 Error** | `Server Error` | `We encountered an unexpected error.` | `noindex` |
| **Favorites** | `Favorite Tools — Free Online Tools Nest` | `Your saved favorite tools. Quickly access the tools you use most.` | `noindex` |
| **Root redirects** (/, /about/, /contact/, /privacy-policy/, /terms-and-conditions/) | Varies per page | Varies per page | `noindex, follow` — JS redirectors to locale versions |

---

### SITE Constant (Brand-Level — `src/data/tools.ts`)

```typescript
export const SITE = {
  name: "Free Online Tools Nest",
  domain: "freeonlinetoolsnest.com",
  url: "https://freeonlinetoolsnest.com",
  description: "62 free online tools for text, code, math, and more. No uploads, no signups — everything runs in your browser, 100% private.",
  tagline: "Free tools for text, code, and math.",
};
```

The SITE constant feeds OG tags, JSON-LD organization/website schema, and default brand references across all pages.

---

### How to Fill In

For each page above, write in the `target_keyword` column with the **long-tail, low-difficulty keyword** you want that page to rank for. Some guidance:

| Page | Keyword Opportunity (examples — replace with your research) |
|------|--------------------------------------------------------------|
| **Homepage** | `free online tools no signup` / `browser based utilities private` |
| **About** | `free online tools website about` / `about free browser tools` |
| **Contact** | `contact free online tools team` / `free tool support email` |
| **FAQ** | `free online tools faq how do they work` / `are online tools private` |
| **Privacy** | `free online tools privacy policy client side` |
| **Terms** | `free online tools terms of service disclaimer` |

> ⚠️ **Priority order**: Homepage >>> FAQ > About > Privacy > Contact > Terms. Focus your research effort accordingly.

Once you fill in the target keywords, **hand the file back to me** and I will:
1. Update metaTitle (under 60 chars)
2. Update metaDescription (under 160 chars, keyword-first)
3. Update implicit keyword targeting in H1, H2 headings, and body content where appropriate
4. Verify with `npm run build`

---

---

## Part 2: 62 Tools Keyword Plan (already applied — kept for reference)

> **Instructions**: Below are all 62 tools organized by category. For each tool, fill in the `target_keyword` field with the **lower-difficulty, long-tail keyword** you want to target. Leave blank any you're unsure about — I'll suggest alternatives.
> Once complete, I will update each tool's `metaTitle`, `metaDescription`, `keywords[]`, `usageSteps`, and `faq` to optimize for your chosen keywords.

---

## Text Tools (14)

| # | Tool Name | Slug | Target Keyword (fill in) |
|---|-----------|------|--------------------------|
| 1 | Word Counter | `word-counter` | word counter google docs |
| 2 | Character Counter | `character-counter` | twitter character counter |
| 3 | Case Converter | `case-converter` | upper case converter |
| 4 | Text Analyzer | `text-analyzer` | lexile text analyzer |
| 5 | Text Diff | `text-diff` | online text diff checker |
| 6 | Text Summarizer | `text-summarizer` | text summarizer free |
| 7 | Text Humanizer | `text-humanizer` | ai text humanizer free |
| 8 | Grammar Checker | `grammar-checker` | free grammar checker online |
| 9 | Palindrome Checker | `palindrome-checker` | palindrome checker |
| 10 | Reverse Text | `reverse-text` | how to reverse text in word |
| 11 | Lorem Ipsum Generator | `lorem-ipsum-generator` | lorem ipsum charlotte |
| 12 | Markdown to HTML | `markdown-to-html` | markdown to html |
| 13 | Number to Words | `number-to-words` | phone number to words converter |
| 14 | Slug Generator | `slug-generator` | slug generator |

---

## Developer Tools (12)

| # | Tool Name | Slug | Target Keyword (fill in) |
|---|-----------|------|--------------------------|
| 15 | JSON Formatter | `json-formatter` | notepad++ json formatter |
| 16 | HTML Formatter | `html-formatter` | html formatter notepad++ |
| 17 | Regex Tester | `regex-tester` | ruby regex tester |
| 18 | CSS Minifier | `css-minifier` | css minifier |
| 19 | Base64 Encoder/Decoder | `base64-encoder-decoder` | base64 encoder/decoder |
| 20 | URL Encoder/Decoder | `url-encoder-decoder` | url encoder decoder online |
| 21 | UUID Generator | `uuid-generator` | random uuid generator |
| 22 | Hash Generator | `hash-generator` | ntlm hash generator |
| 23 | Binary Converter | `binary-converter` | text to binary converter |
| 24 | HTML Entity Converter | `html-entity-converter` | html entity converter |
| 25 | CSV to JSON | `csv-to-json` | csv to json python |
| 26 | YAML to JSON | `yaml-to-json` | yaml to json |

---

## Calculators (8)

| # | Tool Name | Slug | Target Keyword (fill in) |
|---|-----------|------|--------------------------|
| 27 | Percentage Calculator | `percentage-calculator` | average percentage calculator |
| 28 | Loan Calculator | `loan-calculator` | online loan calculator |
| 29 | Discount Calculator | `discount-calculator` | percent discount calculator |
| 30 | Mortgage Calculator | `mortgage-calculator` | dave ramsey mortgage calculator |
| 31 | Tip Calculator | `tip-calculator` | tip calculator iphone |
| 32 | Age Calculator | `age-calculator` | chronological age calculator |
| 33 | BMI Calculator | `bmi-calculator` | bmi calculator online |
| 34 | Date Difference Calculator | `date-difference-calculator` | date difference calculator excel |

---

## Converters (7)

| # | Tool Name | Slug | Target Keyword (fill in) |
|---|-----------|------|--------------------------|
| 35 | Unit Converter | `unit-converter` | lego unit converter |
| 36 | Temperature Converter | `temperature-converter` | temperature converter |
| 37 | Lbs to Kg Converter | `lbs-to-kg-converter` | lbs to kg converter |
| 38 | JSON to CSV | `json-to-csv` | json to csv python |
| 39 | Color Converter | `color-converter` | pms color converter |
| 40 | Image Format Converter | `image-format-converter` | image format converter |
| 41 | Image to Base64 | `image-to-base64` | image to base64 converter online |

---

## PDF Tools (5)

| # | Tool Name | Slug | Target Keyword (fill in) |
|---|-----------|------|--------------------------|
| 42 | PDF Merger | `pdf-merger` | adobe pdf merger |
| 43 | PDF Splitter | `pdf-splitter` | free pdf splitter |
| 44 | PDF Compressor | `pdf-compressor` | adobe pdf compressor |
| 45 | PDF to Text | `pdf-to-text` | pdf to text |
| 46 | PDF to Images | `pdf-to-images` | convert pdf to images online free |

---

## SEO Tools (8)

| # | Tool Name | Slug | Target Keyword (fill in) |
|---|-----------|------|--------------------------|
| 47 | Meta Tag Generator | `meta-tag-generator` | seo meta tag generator |
| 48 | Sitemap Generator | `sitemap-generator` | sitemap generator by spellmistake |
| 49 | Robots.txt Generator | `robots-txt-generator` | wordpress robots.txt generator |
| 50 | Keyword Density Checker | `keyword-density-checker` | keyword density checker free |
| 51 | Canonical Tag Generator | `canonical-tag-generator` | canonical tag generator |
| 52 | SEO Length Checker | `seo-length-checker` | seo by highsoftware99.com |
| 53 | Open Graph Preview Generator | `open-graph-preview-generator` | all in one seo open graph |
| 54 | Alt Text Checker | `alt-text-checker` | alt text checker |

---

## Design Tools (8)

| # | Tool Name | Slug | Target Keyword (fill in) |
|---|-----------|------|--------------------------|
| 55 | QR Code Generator | `qr-code-generator` | adobe qr code generator |
| 56 | Image Resizer | `image-resizer` | adobe image resizer |
| 57 | Image Cropper | `image-cropper` | best free image cropper tool |
| 58 | Image Filter | `image-filter` | black and white image filter |
| 59 | Image Compressor | `image-compressor` | image compressor online |
| 60 | Color Contrast Checker | `color-contrast-checker` | webaim color contrast checker |
| 61 | Password Generator | `password-generator` | secure password generator |
| 62 | Password Strength Checker | `password-strength-checker` | password strength checker online |

---

## How Keyword Research Works (for reference)

When picking target keywords, aim for:

- **Long-tail** (3-5 words) — e.g. "free online word counter tool" instead of "word counter"
- **Low competition** — phrases where the top 10 results aren't all DA 80+ giants
- **Search intent match** — the page actually delivers what the searcher wants
- **Monthly volume** — target 100-1k/mo range for realistic ranking potential

### Example Good Keywords:

| Tool | Weak (too broad) | Better (long-tail) |
|------|------------------|--------------------|
| Word Counter | `word counter` | `free online word counter tool no signup` |
| JSON Formatter | `json formatter` | `json formatter online free beautify validate` |
| PDF Merger | `merge pdf` | `free pdf merger tool online no upload` |
| QR Code Generator | `qr code generator` | `free online qr code generator download png` |

---

*File created: 2026-06-22 | Last updated: 2026-06-23*
