import type { ToolQuality } from "./tools";

const VERIFIED_ON = "2026-08-26";

type QualityInput = Omit<ToolQuality, "verifiedOn" | "sections"> & {
  how: string;
  example: { input: string; output: string };
  useCase: string;
  alternative: string;
  reviewEvidence?: string;
};

function dossier(input: QualityInput, verifiedOn = VERIFIED_ON): ToolQuality {
  return {
    engine: input.engine,
    supportedInputs: input.supportedInputs,
    outputFormats: input.outputFormats,
    limits: input.limits,
    limitations: input.limitations,
    verifiedOn,
    sections: [
      {
        heading: "How this tool works",
        content: input.how,
        bullets: [
          `Engine: ${input.engine}`,
          `Supported input: ${input.supportedInputs.join(", ")}`,
          `Output: ${input.outputFormats.join(", ")}`,
        ],
        example: input.example,
      },
      {
        heading: "Limits, edge cases, and troubleshooting",
        content: input.useCase,
        bullets: [...input.limits, ...input.limitations],
      },
      {
        heading: "When to use another workflow",
        content: input.alternative,
        comparison: [
          { option: "This browser tool", bestFor: "Quick, private, one-off work", tradeoff: "Limited by browser memory and the documented feature set" },
          { option: "Desktop or command-line tool", bestFor: "Batch jobs and repeatable automation", tradeoff: "Requires installation and setup" },
        ],
      },
      {
        heading: "Verification",
        content: verifiedOn ? input.reviewEvidence ? `Implementation checked on ${verifiedOn}. ${input.reviewEvidence}` : `Reviewed by the Free Online Tools Nest Team on ${verifiedOn}. The interface, output path, and documented limitations were checked against the current implementation. See our testing methodology for the review process.` : "Verification is pending. This tool is not yet included in the sitemap.",
      },
    ],
  };
}

const LEGACY_TOOL_QUALITY: Record<string, ToolQuality> = {
  "word-counter": dossier({ engine: "JavaScript text segmentation and regular-expression analysis", supportedInputs: ["plain Unicode text pasted or typed into the editor"], outputFormats: ["word, character, sentence, paragraph, and reading-time statistics"], limits: ["Performance depends on the amount of text and available browser memory."], limitations: ["Word and sentence boundaries are estimates; languages without spaces and unusual punctuation can produce different counts than an editor."], how: "The component normalizes the entered text, counts tokens and structural separators, and recalculates statistics in the browser whenever the input changes.", example: { input: "A short sentence with five words.", output: "6 words, 33 characters (including spaces), 1 sentence" }, useCase: "Use it to check article length, form limits, captions, and drafts. If a count looks unexpected, remove unusual whitespace or compare the punctuation with your publishing platform.", alternative: "Use a word processor when you need language-specific proofing rules, tracked changes, or the exact count used by a submission system." }),
  "json-formatter": dossier({ engine: "Native JSON.parse and JSON.stringify", supportedInputs: ["valid JSON object, array, string, number, boolean, or null"], outputFormats: ["indented JSON text", "validation error"], limits: ["The full document must fit in browser memory."], limitations: ["Comments, trailing commas, NaN, Infinity, and JavaScript object literals are not valid JSON."], how: "The formatter parses input with the browser's JSON parser and serializes the resulting value with consistent indentation. Parsing errors are shown instead of guessing how malformed data should be repaired.", example: { input: "{\"user\":{\"id\":7},\"active\":true}", output: "An indented JSON object preserving numeric user.id = 7 and boolean active = true" }, useCase: "Use it for API responses, configuration snippets, and test fixtures. A syntax error near the end often comes from a missing quote, bracket, or comma earlier in the document.", alternative: "Use jq or an IDE for very large files, streaming data, schema validation, or repeatable transformations." }),
  "qr-code-generator": dossier({ engine: "qrcode JavaScript library rendered to HTML canvas", supportedInputs: ["text and URLs"], outputFormats: ["PNG image"], limits: ["Very long content creates denser codes that are harder for cameras to scan."], limitations: ["The current download is PNG only; it does not export SVG."], how: "The qrcode dependency encodes the supplied text into modules on a canvas. The download action serializes that canvas as a PNG without sending the value to a server.", example: { input: "https://freeonlinetoolsnest.com/tools/qr-code-generator/", output: "A scannable PNG QR code containing that exact URL" }, useCase: "Use short, final URLs and test the downloaded image with more than one camera before printing. Add physical quiet space around the code.", alternative: "Use a vector design workflow when you need SVG, branded artwork, print preflight, dynamic destination tracking, or bulk generation." }),
  "color-converter": dossier({ engine: "JavaScript color parsing and HEX/RGB/HSL conversion formulas", supportedInputs: ["HEX", "RGB", "HSL color values"], outputFormats: ["normalized HEX", "RGB", "HSL", "visual preview"], limits: ["Inputs must use a supported color notation."], limitations: ["Conversions may round channel or percentage values; wide-gamut CSS color spaces are not supported."], how: "The component parses the selected notation, converts it through numeric RGB channels, and derives the equivalent HEX and HSL values locally.", example: { input: "#336699", output: "rgb(51, 102, 153) and hsl(210, 50%, 40%)" }, useCase: "Use it when moving colors between design files and CSS. If a value fails, check the leading #, commas, parentheses, and allowed numeric ranges.", alternative: "Use a color-managed design application for ICC profiles, Display-P3, Lab, print production, or perceptual color matching." }),
  "image-compressor": dossier({ engine: "Canvas API image decode, drawImage, and toBlob", supportedInputs: ["browser-decodable JPEG", "PNG", "WebP and other formats supported by the browser"], outputFormats: ["JPEG", "PNG", "WebP download"], limits: ["Large images require enough browser memory for the decoded bitmap.", "The UI file guard applies before processing."], limitations: ["PNG may not shrink when re-encoded; metadata and animation are not preserved; browser codec behavior varies."], how: "The browser decodes the image, draws pixels to a canvas, and re-encodes the canvas at the chosen quality and format. The original file is not uploaded.", example: { input: "A 2400 x 1600 JPEG at quality 0.75", output: "A locally generated JPEG with the same pixel dimensions and a typically smaller file size" }, useCase: "Use photographs for the clearest quality savings. If the output is larger, try WebP or JPEG, lower quality slightly, or resize the dimensions first.", alternative: "Use a dedicated encoder such as Squoosh or ImageMagick for metadata control, animation, reproducible codec settings, or large batches." }),
  "pdf-merger": dossier({ engine: "pdf-lib PDFDocument page copying", supportedInputs: ["unencrypted PDF files"], outputFormats: ["one merged PDF"], limits: ["All selected PDFs and copied pages must fit in browser memory."], limitations: ["Password-protected, corrupted, or unusual PDFs may fail; advanced interactive features may not survive copying."], how: "pdf-lib loads each selected document, copies its pages in the chosen order into a new PDFDocument, and saves the result locally.", example: { input: "invoice.pdf (2 pages) + receipt.pdf (1 page)", output: "merged.pdf containing 3 pages in the selected order" }, useCase: "Use it for ordinary reports, scans, invoices, and handouts. Remove encryption first and merge fewer files at a time if the browser runs out of memory.", alternative: "Use a desktop PDF editor for portfolios, forms, signatures, bookmarks, accessibility tags, or very large document sets." }),
  "pdf-compressor": dossier({ engine: "pdf-lib document loading and browser-side PDF rewriting", supportedInputs: ["unencrypted PDF files"], outputFormats: ["rewritten PDF download"], limits: ["The entire PDF must fit in browser memory."], limitations: ["Rewriting may increase size. It does not resample images or guarantee preservation of advanced PDF features."], how: "The component loads the PDF in memory and saves a browser-generated copy with or without object streams. Results depend on how the source PDF stores images, fonts, and objects.", example: { input: "A two-page synthetic PDF with page sizes 300 × 400 and 612 × 792 points", output: "A two-page rewritten PDF preserving those page sizes; savings vary with the source." }, useCase: "Use it for a quick local attempt before sharing. If the size barely changes, the document may already be optimized or dominated by compressed scans.", alternative: "Use Ghostscript, Acrobat, or a specialist compressor when you need image downsampling, font controls, archival profiles, or a target file size." }),
  "grammar-checker": dossier({ engine: "Client-side heuristic pattern checks", supportedInputs: ["English plain text"], outputFormats: ["highlighted suggestions and issue counts"], limits: ["Designed for short and medium drafts that fit comfortably in the browser."], limitations: ["It is not an AI proofreader and cannot understand every context, dialect, or intentional style choice."], how: "The checker applies deterministic rules for repeated words, spacing, punctuation, sentence length, and selected usage patterns. It never claims to provide exhaustive linguistic review.", example: { input: "This is is a very long draft  with extra spaces.", output: "Suggestions for the repeated word and doubled spacing" }, useCase: "Use it as a final mechanical check for English drafts. Review every suggestion because names, dialogue, technical prose, and deliberate repetition can trigger false positives.", alternative: "Use a human editor or a context-aware writing assistant for tone, argument, factual accuracy, and nuanced grammar." }),
  "word-cloud-generator": dossier({ engine: "JavaScript token frequency analysis and canvas rendering", supportedInputs: ["plain text"], outputFormats: ["visual word cloud", "frequency-based layout"], limits: ["Large vocabularies can make labels small or crowded."], limitations: ["Frequency is not sentiment or topic modeling; tokenization and stop-word choices affect results."], how: "The component normalizes words, counts occurrences, scales terms by frequency, and lays them out visually in the browser.", example: { input: "privacy tools privacy browser tools privacy", output: "privacy appears largest, followed by tools, then browser" }, useCase: "Use it to spot repeated themes in survey responses, drafts, and notes. Clean boilerplate and names first when they would dominate the result.", alternative: "Use a text-analysis package for stemming, phrase extraction, sentiment, multilingual tokenization, or reproducible research." }),
  "jwt-decoder": dossier({ engine: "Base64URL decoding plus JSON parsing", supportedInputs: ["three-part JSON Web Tokens"], outputFormats: ["decoded header", "decoded payload", "human-readable time claims"], limits: ["The token must contain decodable Base64URL JSON segments."], limitations: ["Decoding does not verify the signature, issuer, audience, revocation state, or trustworthiness of any claim."], how: "The component splits the token, converts Base64URL segments into text, and parses the header and payload JSON. It does not use a signing key and therefore cannot authenticate the token.", example: { input: "A JWT whose payload contains {\"sub\":\"123\"}", output: "Decoded payload showing sub = 123; signature status remains unverified" }, useCase: "Use only for inspection and debugging. Treat pasted production tokens as secrets and never authorize a request based on decoded claims alone.", alternative: "Use your authentication library or jwt.io with the correct algorithm and trusted key material when signature and claim validation are required." }),
  "epoch-converter": dossier({ engine: "JavaScript Date and timestamp arithmetic", supportedInputs: ["Unix seconds", "Unix milliseconds", "date and time values"], outputFormats: ["ISO/local date display", "Unix timestamp"], limits: ["Dates must fall within the JavaScript Date range."], limitations: ["Ambiguous local times and daylight-saving transitions depend on the browser time zone."], how: "The converter distinguishes seconds from milliseconds, creates a Date value, and formats equivalent representations locally.", example: { input: "0 seconds", output: "1970-01-01T00:00:00.000Z" }, useCase: "Use UTC/ISO output for logs and APIs. If a result is thousands of years away, check whether the source value is milliseconds rather than seconds.", alternative: "Use a date-time library or database function for named time zones, calendar arithmetic, leap-second policy, or bulk conversions." }),
  "character-counter": dossier({ engine: "JavaScript string and whitespace analysis", supportedInputs: ["plain Unicode text"], outputFormats: ["characters with/without spaces", "words and line counts"], limits: ["The entered text must fit in browser memory."], limitations: ["Emoji and combined Unicode symbols may be counted differently from platform-specific limits."], how: "The component recalculates string length and derived counts as the editor changes, with no network request for the text.", example: { input: "Hello world", output: "11 characters including the space, 10 excluding spaces" }, useCase: "Use it for metadata, messages, bios, and form limits. Verify emoji-heavy text in the destination platform because grapheme rules differ.", alternative: "Use the target platform's own counter when its limit is based on bytes, weighted characters, or proprietary parsing." }),
  "unit-converter": dossier({ engine: "Static JavaScript conversion factors grouped by measurement category", supportedInputs: ["numeric values", "the units exposed in the selector"], outputFormats: ["converted numeric value"], limits: ["Only listed unit pairs and finite numeric inputs are supported."], limitations: ["Rounded display values are unsuitable for regulated calibration or high-precision scientific work."], how: "The converter maps the source value to a category base unit and then to the selected target unit using fixed factors.", example: { input: "1 kilometre to metres", output: "1000 metres" }, useCase: "Use it for everyday length, mass, volume, and similar conversions. Check that both units belong to the same category.", alternative: "Use a standards-backed scientific package when significant figures, uncertainty, temperature intervals, or regulated units matter." }),
  "csv-to-json": dossier({ engine: "Client-side delimiter and quoted-field parser", supportedInputs: ["CSV text with a header row", "configurable delimiter"], outputFormats: ["JSON array of objects"], limits: ["The whole table is parsed in browser memory."], limitations: ["Mixed encodings, malformed quotes, duplicate headers, and embedded newlines can require cleanup; values remain textual unless explicitly converted."], how: "The parser separates rows and quoted fields, uses the first row as keys, and serializes subsequent records as JSON objects.", example: { input: "name,age\nAda,36", output: "[{\"name\":\"Ada\",\"age\":\"36\"}]" }, useCase: "Use it for small exports, API fixtures, and spreadsheet data. Confirm the delimiter and inspect headers before trusting the result.", alternative: "Use Python, pandas, or a database import for huge files, encoding detection, schema inference, validation, and repeatable ETL." }),
  "password-generator": dossier({ engine: "Web Crypto getRandomValues with rejection sampling", supportedInputs: ["length and selected character sets"], outputFormats: ["random password text"], limits: ["At least one character set must be enabled; practical length is bounded by the UI."], limitations: ["A generated password is only secure if stored and handled safely after generation."], how: "The component draws random values from the browser's cryptographic random source and maps them to the selected alphabet without a server request.", example: { input: "16 characters with upper, lower, digits, and symbols", output: "A new unpredictable 16-character password matching those settings" }, useCase: "Use a unique password per account and store it in a reputable password manager. Regenerate if a website rejects a chosen symbol.", alternative: "Use your password manager's built-in generator when you want creation, storage, autofill, and breach monitoring in one workflow." }),
  "case-converter": dossier({ engine: "JavaScript string transforms and word-boundary rules", supportedInputs: ["plain text"], outputFormats: ["upper", "lower", "title", "sentence", "camel and other listed cases"], limits: ["The entire text is transformed in memory."], limitations: ["Acronyms, names, apostrophes, and language-specific title rules may need manual correction."], how: "The component splits or normalizes words according to the selected mode and rejoins them with the required capitalization and separators.", example: { input: "hello world", output: "HELLO WORLD, Hello World, or helloWorld depending on the selected mode" }, useCase: "Use it for headings, identifiers, labels, and cleanup. Review proper nouns and acronyms after conversion.", alternative: "Use an editor macro or formatter for project-wide renaming, language-aware title style, or syntax-aware identifiers." }),
  "text-analyzer": dossier({ engine: "Client-side lexical and structural text statistics", supportedInputs: ["plain text"], outputFormats: ["counts, averages, reading estimate, and frequency statistics"], limits: ["Large text may take longer to recalculate."], limitations: ["Readability and reading-time estimates are approximations, not a judgment of factual or editorial quality."], how: "The analyzer tokenizes the draft and derives counts and ratios from characters, words, sentences, and paragraphs.", example: { input: "One short sentence. Another sentence follows.", output: "2 sentences plus word, character, and average-length statistics" }, useCase: "Use it to compare drafts and identify unusually long sentences or repetition. Interpret scores alongside the audience and purpose.", alternative: "Use a corpus or NLP package for linguistic tagging, semantic analysis, authorship research, or reproducible datasets." }),
  "text-diff": dossier({ engine: "Client-side sequence comparison", supportedInputs: ["two plain-text versions"], outputFormats: ["added, removed, and unchanged segments"], limits: ["Very large inputs can consume significant time and memory."], limitations: ["It compares text, not document formatting, comments, binary files, or semantic equivalence."], how: "The component compares the two entered sequences and renders their differences without uploading either version.", example: { input: "Old: color\nNew: colour", output: "Removed 'color' and added 'colour'" }, useCase: "Use it for configs, copy edits, and small code snippets. Normalize line endings if every line appears changed.", alternative: "Use Git or a desktop diff application for repositories, directory comparison, syntax-aware views, history, and merge conflict resolution." }),
  "readability-score": dossier({ engine: "Heuristic syllable, word, and sentence counts with readability formulas", supportedInputs: ["English prose with at least ten letter-bearing words"], outputFormats: ["raw readability scores and supporting statistics"], limits: ["Ten words is an application guardrail, not a reliable sample size; use multiple complete sentences.", "SMOG is intended for a 30-sentence sample; shorter results are provisional."], limitations: ["Names, abbreviations, formulas, code and non-English text reduce accuracy. The token guard is not language detection; a high score does not establish comprehension or correctness."], how: "The component estimates syllables and sentence length, then applies readability arithmetic without clamping formula results. Estimates depend on the English token and syllable heuristics.", example: { input: "The cat sat on the mat and the dog ran.", output: "Flesch Reading Ease 112.1 with the current heuristic; a very short sample is not a reliable comprehension assessment" }, useCase: "Use it to compare drafts for a target audience. Include punctuation and sufficient prose; interpret raw scores and negative grade estimates with care.", alternative: "Use editorial review and audience testing for comprehension, tone, accessibility, domain vocabulary and factual quality." }),
  "url-encoder-decoder": dossier({ engine: "Native encodeURIComponent and decodeURIComponent", supportedInputs: ["Unicode text", "percent-encoded URL components"], outputFormats: ["percent-encoded or decoded text"], limits: ["Input must fit in the text editor."], limitations: ["It operates on components; encoding an entire URL can encode separators, and malformed percent sequences cannot be decoded."], how: "The browser's URI component functions convert text to UTF-8 percent escapes or restore a valid escaped component.", example: { input: "hello world?", output: "hello%20world%3F" }, useCase: "Use it for query values and path components. If decoding fails, look for a lone percent sign or incomplete hexadecimal pair.", alternative: "Use the URL and URLSearchParams APIs in application code to construct complete URLs without double-encoding." }),
  "base64-encoder-decoder": dossier({ engine: "Browser Base64 conversion with UTF-8 handling", supportedInputs: ["text", "Base64-encoded UTF-8 text"], outputFormats: ["Base64", "decoded UTF-8 text"], limits: ["Large files expand by about one third and consume browser memory."], limitations: ["Base64 is encoding, not encryption; invalid padding or alphabet characters cause decoding errors."], how: "The component converts UTF-8 bytes to the Base64 alphabet or reverses that representation locally.", example: { input: "hello", output: "aGVsbG8=" }, useCase: "Use it for data URIs, API test values, and inspecting small payloads. Never treat Base64 as protection for secrets.", alternative: "Use command-line utilities or streaming code for large files, pipelines, checksums, encryption, or repeatable automation." }),
  "regex-tester": dossier({ engine: "Native JavaScript RegExp", supportedInputs: ["ECMAScript regular-expression source", "JavaScript flags exposed by the UI", "plain test text"], outputFormats: ["match highlights", "capture details"], limits: ["Input and matches run on the browser's main thread."], limitations: ["PCRE-, Python-, .NET-, and Java-specific syntax may differ or fail; catastrophic backtracking can freeze the tab."], how: "The component constructs a JavaScript RegExp from the pattern and flags, then applies it to the sample text for matches and replacements.", example: { input: "Pattern \\b\\d{4}\\b with text 'Year 2026'", output: "One match: 2026" }, useCase: "Use short representative text while developing a pattern. Escape literal slashes only when your target syntax requires them.", alternative: "Test in the actual target runtime when flavor-specific behavior, timeouts, Unicode modes, or production safety matters." }),
  "sql-formatter": dossier({ engine: "Protected-segment scanner with keyword and whitespace formatting rules", supportedInputs: ["Common SQL code with quoted values and identifiers, line or nested block comments and dollar-quoted bodies"], outputFormats: ["formatted SQL text"], limits: ["The statement must fit in browser memory.", "Unterminated quoted values, identifiers, block comments and dollar-quoted bodies are rejected."], limitations: ["Formatting outside protected segments is heuristic; it does not validate a database dialect or the SQL inside a preserved body."], how: "The component masks quoted values, identifiers, comments and dollar-quoted bodies, formats surrounding code, then restores the original segment bytes. It never executes the query.", example: { input: "select id,name from users where active=1", output: "SELECT fields, FROM, and WHERE arranged on readable lines" }, useCase: "Use it to improve readability before review. Check vendor-specific functions and quoted identifiers after formatting.", alternative: "Use your database IDE or a dialect-aware parser for linting, query plans, schema validation, and automated repository formatting." }),
  "markdown-to-html": dossier({ engine: "marked parser plus the site's HTML sanitizer", supportedInputs: ["CommonMark-style Markdown supported by marked"], outputFormats: ["HTML source", "sanitized browser preview"], limits: ["The document must fit in browser memory."], limitations: ["The preview removes scripts, event handlers, dangerous URLs, and unsupported markup; themes and extensions can render differently elsewhere."], how: "marked converts Markdown syntax to HTML, then sanitizeHtml removes unsafe elements and attributes before preview rendering.", example: { input: "# Hello\n\n**Private** draft", output: "<h1>Hello</h1> followed by a paragraph containing <strong>Private</strong>" }, useCase: "Use it for documentation and publishing drafts. Inspect the copied HTML in the destination system because its CSS and Markdown extensions may differ.", alternative: "Use the target static-site generator or Markdown pipeline when plugins, frontmatter, syntax highlighting, or exact production parity is required." }),
  "image-resizer": dossier({ engine: "Canvas API decode, drawImage scaling, and export", supportedInputs: ["browser-decodable images"], outputFormats: ["the image formats offered in the UI"], limits: ["Source and destination bitmaps must fit in browser memory."], limitations: ["Upscaling cannot recreate lost detail; metadata, animation, and color profiles may not be preserved."], how: "The browser decodes the selected image, draws it to a canvas at the requested dimensions, and exports a new local file.", example: { input: "1600 x 900 image resized to width 800 with aspect ratio locked", output: "800 x 450 image" }, useCase: "Use it to prepare web images, thumbnails, and profile assets. Keep aspect ratio enabled unless intentional stretching is required.", alternative: "Use a desktop editor or CLI for batch resizing, sharpening, metadata preservation, color management, and repeatable presets." }),
  "image-cropper": dossier({ engine: "Canvas API source-region drawImage and export", supportedInputs: ["browser-decodable still images"], outputFormats: ["cropped image download"], limits: ["The decoded source and crop canvas must fit in browser memory."], limitations: ["Animation and original metadata are not retained; crops outside image bounds are not meaningful."], how: "The component maps the selected rectangle to source pixels, draws only that region to a canvas, and exports the resulting bitmap locally.", example: { input: "A 1200 x 800 image with a centered 600 x 600 selection", output: "A square 600 x 600 crop" }, useCase: "Use it for avatars, thumbnails, and removing unwanted edges. Zoom carefully before applying small crops to high-resolution images.", alternative: "Use a photo editor for perspective correction, non-destructive crops, guides, masks, print resolution, or batch work." }),
  "json-to-csv": dossier({ engine: "Client-side JSON parsing and CSV escaping", supportedInputs: ["JSON arrays of objects"], outputFormats: ["CSV text and download"], limits: ["The full JSON array is processed in browser memory."], limitations: ["Nested objects and arrays require flattening or become serialized values; inconsistent keys produce blank cells."], how: "The component parses the JSON array, collects column keys, escapes quotes and delimiters, and writes one CSV row per object.", example: { input: "[{\"name\":\"Ada\",\"role\":\"Engineer\"}]", output: "name,role\nAda,Engineer" }, useCase: "Use it for flat API exports and spreadsheet handoff. Normalize nested data and confirm column order before downloading.", alternative: "Use a data-frame or ETL tool for nested flattening, type schemas, large datasets, encoding control, and automated exports." }),
  "percentage-calculator": dossier({ engine: "Direct JavaScript arithmetic for percentage modes", supportedInputs: ["finite numeric values"], outputFormats: ["percentage, part, total, or percentage-change result"], limits: ["Inputs must be valid finite numbers."], limitations: ["Division by zero is undefined; displayed rounding can hide additional decimal precision."], how: "The component applies the formula for the selected mode, such as part / whole x 100 or (new - old) / abs(old) x 100.", example: { input: "What is 15% of 80?", output: "12" }, useCase: "Use it for discounts, growth, marks, and proportions. Select the mode carefully because 'percent of' and 'percentage change' use different formulas.", alternative: "Use a spreadsheet for chained calculations, audit trails, scenario tables, currency rounding, and repeatable financial models." }),
  "color-contrast-checker": dossier({ engine: "WCAG relative luminance and contrast-ratio formulas", supportedInputs: ["foreground and background color values accepted by the UI"], outputFormats: ["contrast ratio", "AA/AAA pass indicators"], limits: ["The result describes the entered color pair only."], limitations: ["It does not measure font rendering, background images, transparency stacks, focus visibility, or the overall accessibility of a page."], how: "The component linearizes sRGB channels, calculates relative luminance for each color, and divides the lighter and darker values according to the WCAG contrast formula.", example: { input: "#000000 text on #FFFFFF background", output: "21:1 contrast; passes AA and AAA for normal text" }, useCase: "Use actual foreground and composited background colors. Check every interactive state, not just the default state.", alternative: "Use browser accessibility tooling and manual testing for gradients, opacity, images, forced-colors mode, and complete interface audits." }),
  "schema-markup-generator": dossier({ engine: "Client-side templates and JSON.stringify", supportedInputs: ["the structured fields shown for each supported schema type"], outputFormats: ["JSON-LD script markup"], limits: ["Only schema types and fields exposed by the form are generated."], limitations: ["Valid JSON does not guarantee Google eligibility or factual correctness; required properties vary by rich-result type."], how: "The component assembles a schema.org object from form values and serializes it as formatted JSON-LD for copying.", example: { input: "Organization name 'Example Studio' and URL 'https://example.com'", output: "An Organization JSON-LD object containing those properties" }, useCase: "Use it as a starting point, then validate the final deployed page and ensure every claim matches visible content.", alternative: "Write and test custom JSON-LD when entities are connected, fields are conditional, data comes from a CMS, or a rich-result guideline requires more properties." }),
};

// Preserve the existing advertising set independently of new quality dossiers.
export const AD_ELIGIBLE_TOOL_SLUGS = Object.freeze(Object.keys(LEGACY_TOOL_QUALITY));
export const TOOL_QUALITY: Record<string, ToolQuality> = { ...LEGACY_TOOL_QUALITY };

TOOL_QUALITY["attendance-calculator"] = dossier({
  "reviewEvidence": "Unit tests and local browser checks covered 30/50 at 75% (30 catch-up classes), zero conducted classes, 0% and 100% targets, invalid counts and a finite remaining schedule. Narrow layouts and a keyboard-only calculation were checked.",
  "engine": "Integer class counts and exact basis-point threshold arithmetic",
  "supportedInputs": [
    "whole attended and conducted class counts",
    "0–100% target with up to two decimals",
    "optional whole remaining-class count"
  ],
  "outputFormats": [
    "attendance percentage, class counts and formula breakdown"
  ],
  "limits": [
    "Class-count inputs are limited to one billion to keep results within supported arithmetic bounds."
  ],
  "limitations": [
    "No university rules, excused-absence policy or subject eligibility are inferred.",
    "Catch-up assumes every additional class is attended; display rounding never determines eligibility."
  ],
  "how": "Current percentage is A/T × 100. For a target fraction q between 0 and 1, catch-up is max(0, ceil((qT − A)/(1 − q))). When already at target, missable classes are floor(A/q − T). Zero conducted classes and 0%/100% targets use explicit boundary rules.",
  "example": {
    "input": "30 attended, 50 conducted, target 75%",
    "output": "60% current attendance; 30 consecutive attended classes reach 60/80 = 75%."
  },
  "useCase": "Use the remaining-class field to distinguish eventual mathematical catch-up from what is possible this term. With only 20 classes left in this example, the maximum is 50/70 = 71.4286%.",
  "alternative": "Use the institution's official attendance portal when hours, excused sessions, practicals or separate subject requirements affect eligibility."
}, "2026-09-16");

TOOL_QUALITY["sgpa-calculator"] = dossier({
  "reviewEvidence": "Unit tests and local browser checks covered 74/9 = 8.222222…, custom scales, included and excluded courses, zero-point grades and invalid mappings including case-equivalent labels. Formula output and narrow layouts were checked.",
  "engine": "Pure credit-weighted arithmetic with validated custom grade mappings",
  "supportedInputs": [
    "positive course credits",
    "grade points from zero to the selected maximum",
    "case-insensitive custom grade labels"
  ],
  "outputFormats": [
    "SGPA, weighted point totals, included credits and formula breakdown"
  ],
  "limits": [
    "The interface supports up to 100 courses and 30 custom grade labels.",
    "Numeric totals must remain within supported finite arithmetic bounds."
  ],
  "limitations": [
    "Repeated-attempt forgiveness, subject pass rules and GPA-to-percentage conversion are not inferred.",
    "Only display rounding is applied; your institution may specify a different method."
  ],
  "how": "For included courses, SGPA = Σ(credits × points) / Σ(credits). Excluded rows contribute neither credits nor points. Mappings reject blank or case-equivalent duplicate labels and point values outside the selected scale.",
  "example": {
    "input": "Credits/points: (4,9), (3,8), (2,7), scale maximum 10",
    "output": "(36 + 24 + 14) / (4 + 3 + 2) = 74/9 = 8.222222…; displayed SGPA 8.22."
  },
  "useCase": "Use numeric grade points from a transcript or build your own mapping. A grade label with no mapping is an error rather than an assumed zero. Zero-credit courses must be explicitly excluded.",
  "alternative": "Use your institution's official calculator or transcript when special regulations, course replacement or non-credit-weighted formulas apply."
}, "2026-09-16");

TOOL_QUALITY["cgpa-calculator"] = dossier({
  "reviewEvidence": "Unit tests and local browser checks covered 376/44 = 8.545454…, explicit equal weighting (8.5), missing semester weights and calculation from individual courses. The selected weighting method appears beside the result; narrow layouts were checked.",
  "engine": "Pure weighted-mean arithmetic with explicit weighting selection",
  "supportedInputs": [
    "course credits and grade points on one scale",
    "semester SGPAs with credits or custom positive weights",
    "explicit equal semester weighting"
  ],
  "outputFormats": [
    "CGPA, selected weighting method, contributions and denominator"
  ],
  "limits": [
    "The interface supports up to 100 semesters or 100 courses.",
    "Numeric totals must remain within supported finite arithmetic bounds."
  ],
  "limitations": [
    "Rounded semester SGPAs produce an approximate aggregate.",
    "Different scales, nonlinear university formulas and repeated-course replacement are not converted automatically."
  ],
  "how": "Course mode uses Σ(credits × points)/Σ(credits). Semester mode uses Σ(SGPA × weight)/Σ(weight). Credits and custom modes require every weight; explicit equal weighting uses weight 1 for each semester.",
  "example": {
    "input": "SGPA 8 with 20 credits; SGPA 9 with 24 credits",
    "output": "(8×20 + 9×24)/(20+24) = 376/44 = 8.545454…; displayed CGPA 8.55. Explicit equal weighting would give 8.50."
  },
  "useCase": "Use included GPA credits rather than blindly copying all enrolled credits. Confirm the selected weighting method in the result and prefer course-level data when semester rounding matters.",
  "alternative": "Use official institutional records for special weighting schemes, transfer credits, scale conversion and course-repeat regulations."
}, "2026-09-16");

TOOL_QUALITY["marks-percentage-calculator"] = dossier({
  "reviewEvidence": "Unit tests and local browser checks covered 125/150 = 83.333333…%, different subject maxima and obtained marks above the maximum. Unit tests also covered custom grade thresholds and boundary scores; narrow layouts were checked.",
  "engine": "Pure total-marks arithmetic with optional validated grade thresholds",
  "supportedInputs": [
    "non-negative obtained marks up to each subject maximum",
    "positive maximum marks",
    "optional percentage-to-grade thresholds"
  ],
  "outputFormats": [
    "percentage, totals, optional custom grade and formula"
  ],
  "limits": [
    "Up to 100 subjects and 30 custom thresholds.",
    "Totals must remain within supported finite arithmetic bounds."
  ],
  "limitations": [
    "Extra credit above a subject maximum is not supported.",
    "Institutional pass conditions and GPA conversions are not inferred."
  ],
  "how": "Percentage = sum of obtained marks / sum of maximum marks × 100. Custom grades use the highest minimum threshold met; labels and cutoffs must be unique and one threshold must start at 0%.",
  "example": {
    "input": "80/100 and 45/50",
    "output": "125 / 150 × 100 = 83.333333…%, displayed as 83.33%."
  },
  "useCase": "Combine exam or assignment marks with different maxima without giving a small quiz the same weight as a larger exam.",
  "alternative": "Use a weighted-course calculator or official transcript when credits or institutional weights govern the final result."
}, "2026-09-16");

TOOL_QUALITY["required-marks-calculator"] = dossier({
  "reviewEvidence": "Unit tests and local browser checks covered 62/80 required marks, upward rounding from 59.25 to 60/75 (70.4% overall), zero and full remaining weight and impossible targets. Exact increment boundaries and narrow layouts were checked.",
  "engine": "Weighted-average algebra with rational arithmetic for upward mark increments",
  "supportedInputs": [
    "completed-work average, remaining weight and target percentages from 0 to 100",
    "optional positive assessment maximum and mark increment"
  ],
  "outputFormats": [
    "required percentage or minimum marks, feasibility and formula"
  ],
  "limits": [
    "An assessment is modeled as one remaining component.",
    "Maximum marks and increments must be positive, finite and within supported arithmetic bounds."
  ],
  "limitations": [
    "Separate assessment pass marks, moderation and extra credit are not modeled.",
    "Allowed scores are multiples of the chosen increment from zero; choose the increment that matches your assessment."
  ],
  "how": "With remaining fraction w = weight / 100, required percentage = (target − completed average × (1 − w)) / w. Non-positive requirements become zero; results over 100% are impossible. Minimum marks = ceil(raw marks / increment) × increment. Zero remaining weight is handled separately.",
  "example": {
    "input": "Completed average 65%, remaining weight 40%, target 70%, exam out of 80, whole marks",
    "output": "(70 − 65 × 0.6) / 0.4 = 77.5%; 77.5% of 80 = 62 marks, producing 70% overall."
  },
  "useCase": "Plan a remaining exam using the completed-work average rather than mistaking already-weighted contribution points for that average.",
  "alternative": "Consult the official assessment scheme where final grades use non-linear rules, minimum component scores or moderation."
}, "2026-09-16");

TOOL_QUALITY["image-to-pdf"] = dossier({
  "reviewEvidence": "Local browser checks covered JPEG photo orientation, transparent PNG, page ordering, removal, invalid images, oversized dimensions and impossible margins. Downloaded PDFs were parsed and visually inspected. Conversion also worked offline after app code was loaded; synthetic filename and metadata markers were absent from outgoing requests. Unit tests cover layout arithmetic and application guardrails.",
  "engine": "Local image signature checks, createImageBitmap, Canvas and the bundled pdf-lib library",
  "supportedInputs": [
    "still JPEG images",
    "still PNG images including transparency"
  ],
  "outputFormats": [
    "one image-only PDF with one image per page",
    "A4 or US Letter; portrait, landscape or automatic per-image orientation"
  ],
  "limits": [
    "Application guardrails: 20 files, 15 MiB each, 50 MiB total, 16 megapixels each, 64 megapixels total and 16,384 pixels per side.",
    "These are conservative application choices for reliability, not universal browser or device limits. A smaller batch may still be necessary."
  ],
  "limitations": [
    "No HEIC, WebP, SVG, GIF or animated PNG input; convert to a still JPEG or PNG first.",
    "No OCR, searchable text, PDF editing, encryption or guaranteed file-size reduction.",
    "Images are re-encoded to apply orientation and omit original metadata; JPEG quality and color profiles may change."
  ],
  "how": "The tool reads local file bytes, checks signatures and dimensions, creates small local previews and processes images sequentially. Canvas applies image orientation and re-encodes pixels; pdf-lib places each image on a white PDF page. Fit scale = min(usable page width / image width, usable page height / image height), with the result centered. Blob URLs are released when images or results are removed, replaced or the component is closed.",
  "example": {
    "input": "1200 × 800 image on a portrait US Letter page (612 × 792 points), 12.7 mm margins (36 points)",
    "output": "Image fits to 540 × 360 points at x=36 and y=216 without cropping or stretching."
  },
  "useCase": "Combine photographed assignment pages in a chosen order. Inspect previews and the final download; no image content or filename is sent by the conversion code.",
  "alternative": "Use a trusted desktop scanner or PDF application for OCR, very large batches, archival color management or accessibility tagging."
}, "2026-09-16");

// Scoped content remediation; legacy advertising membership above remains frozen.
TOOL_QUALITY["grammar-checker"] = dossier({
  "engine": "Fixed English regular-expression rules",
  "supportedInputs": [
    "English plain text"
  ],
  "outputFormats": [
    "Suggestions with line numbers and context"
  ],
  "limits": [
    "Not a complete dictionary or grammar analysis."
  ],
  "limitations": [
    "False positives and missed errors are possible; no subject-verb agreement certification.",
    "Edit text manually; no accept/dismiss or automatic correction controls."
  ],
  "how": "Runs explicit checks for repeated words, selected spelling errors, line capitalization, spaces, punctuation and repeated filler words.",
  "example": {
    "input": "This is is a draft.",
    "output": "One repeated-word suggestion for “is”."
  },
  "useCase": "Review a short draft for simple oversights; retain deliberate repetition and headings when suggestions do not fit.",
  "alternative": "Use a qualified editor or a contextual proofing tool for meaning, argument, full grammar or multilingual writing.",
  "reviewEvidence": "The displayed example and documented limits were checked with synthetic inputs. Unsupported input and the distinction between an estimate and a verified result were reviewed."
}, "2026-09-27");
TOOL_QUALITY["text-analyzer"] = dossier({
  "engine": "Whitespace and punctuation counts with case conversion",
  "supportedInputs": [
    "Plain text"
  ],
  "outputFormats": [
    "Counts, timing estimates and converted text"
  ],
  "limits": [
    "Reading: 200 words/minute; speaking: 130, rounded up to whole minutes."
  ],
  "limitations": [
    "Does not compute readability, word frequency or vocabulary complexity.",
    "Punctuation and whitespace rules can differ from your editor."
  ],
  "how": "Splits words on whitespace and sentences on punctuation; estimates time from word totals. Case conversion creates a separate result.",
  "example": {
    "input": "Cats run. Cats sleep.",
    "output": "4 words; 2 sentences; 1 paragraph; reading estimate 1 minute."
  },
  "useCase": "Check draft size and format text in one place. Inspect acronyms and proper names after case conversion.",
  "alternative": "Use Readability Score for a separate formula-based estimate and your submission system for its official word count.",
  "reviewEvidence": "The displayed example and documented limits were checked with synthetic inputs. Unsupported input and the distinction between an estimate and a verified result were reviewed."
}, "2026-09-27");
TOOL_QUALITY["yaml-to-json"] = dossier({
  "engine": "Restricted YAML subset parser with explicit rejection",
  "supportedInputs": [
    "Two-space indented mappings",
    "Scalar lists",
    "Strings, finite decimal numbers, booleans and null"
  ],
  "outputFormats": [
    "Indented JSON or a conversion error"
  ],
  "limits": [
    "100,000 characters; 1,000 lines; 32 nesting levels. These are application guardrails."
  ],
  "limitations": [
    "Not full YAML 1.2: no anchors, aliases, tags, flow collections, block strings or object list items.",
    "Unsafe integers, duplicate keys and ambiguous numeric forms are rejected."
  ],
  "how": "Parses a documented block subset and preserves mapping keys and list values. Unsupported forms fail instead of being silently interpreted as unrelated strings.",
  "example": {
    "input": "items:\n  - one\n  - two",
    "output": "{\"items\":[\"one\",\"two\"]}"
  },
  "useCase": "Convert small simple configuration snippets. Inspect types before copying the result.",
  "alternative": "Use a mature YAML parser in your target runtime for full YAML documents, schemas or production automation.",
  "reviewEvidence": "The displayed example and documented limits were checked with synthetic inputs. Unsupported input and the distinction between an estimate and a verified result were reviewed."
}, "2026-09-27");
TOOL_QUALITY["text-summarizer"] = dossier({
  "engine": "English-oriented extractive sentence ranking",
  "supportedInputs": [
    "English source text"
  ],
  "outputFormats": [
    "Original sentences in source order"
  ],
  "limits": [
    "100,000-character application guardrail; interface selects up to 3, 6 or 10 sentences."
  ],
  "limitations": [
    "No meaning analysis, fact checking or rewriting.",
    "Abbreviations and line breaks can split sentences; other languages are not supported."
  ],
  "how": "Scores sentences using average frequency of non-stop words, selects sentence occurrences by index and restores original order.",
  "example": {
    "input": "Cats sleep. Dogs bark. Cats purr. Select 2 sentences in the logic helper.",
    "output": "Cats sleep. Cats purr."
  },
  "useCase": "Build a starting extract, then compare it to the complete source and repair omitted context yourself.",
  "alternative": "Write an editorial summary when meaning, attribution or a faithful balance of arguments matters.",
  "reviewEvidence": "The displayed example and documented limits were checked with synthetic inputs. Unsupported input and the distinction between an estimate and a verified result were reviewed."
}, "2026-09-27");
TOOL_QUALITY["seo-length-checker"] = dossier({
  "engine": "Character counts and fixed character-class width estimates",
  "supportedInputs": [
    "Title and description text"
  ],
  "outputFormats": [
    "Counts, approximate widths and illustrative previews"
  ],
  "limits": [
    "Guideline ranges are application choices, not fixed search-engine limits."
  ],
  "limitations": [
    "No font measurement or guaranteed rendering.",
    "Search engines can rewrite titles and descriptions; display varies."
  ],
  "how": "Counts JavaScript string length and estimates width from character classes. Illustrative previews shorten text at fixed thresholds.",
  "example": {
    "input": "iii and www entered separately as a title",
    "output": "Both have 3 characters and the same 33 px estimate, illustrating the limitation of the width heuristic."
  },
  "useCase": "Use the preview to spot verbose copy, then prioritize clarity over filling a quota.",
  "alternative": "Inspect actual search results and official search documentation when investigating how a page is displayed.",
  "reviewEvidence": "The displayed example and documented limits were checked with synthetic inputs. Unsupported input and the distinction between an estimate and a verified result were reviewed."
}, "2026-09-27");
