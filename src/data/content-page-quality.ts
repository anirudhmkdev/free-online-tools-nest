import { HUBS } from "./hubs";
import { WORKFLOWS } from "./workflows";

export const CONTENT_PAGES = [...HUBS, ...WORKFLOWS];
const REVIEWED_ON = "2026-09-26";
const EVIDENCE: Record<string, string[]> = {
  "/student-tools/": ["Six input-to-calculator decisions reviewed; unequal subject maxima example returns 78% in the existing math engine.", "Verified at five widths in light/dark themes and with JavaScript disabled."],
  "/document-tools/": ["Compared actual H1, title, description and decision content against the unchanged PDF inventory category.", "Checked pixel/byte distinction and image/PDF handoffs; optimized fixture grew from 1619 to 2906 bytes, confirming the no-guaranteed-reduction branch."],
  "/writing-tools/": ["Compared actual H1, title, description and draft-review content against the unchanged Text Tools inventory.", "Word Counter and Character Counter both returned 4 words, 30 characters, 27 without spaces for the stated example."],
  "/workflows/": ["Five starting-material decisions reviewed, including the skip-all branch for a correct under-limit PDF.", "All five destination links and the three topical hub links generated; content remains available without JavaScript."],
  "/workflows/submit-an-assignment/": ["Three numbered JPEGs were reordered, converted to three PDF pages and merged after a one-page cover: four pages verified visually.", "Manual download/select handoffs and under-limit skip-compression decision checked."],
  "/workflows/prepare-pdf-for-upload/": ["Splitter range 1-3,5 produced a three-page and a one-page PDF. Merger output text order was PAGE 1, PAGE 2, PAGE 3, PAGE 5.", "Compressor output for an optimized five-page fixture grew from 1619 to 2906 bytes; fallback wording reviewed."],
  "/workflows/scan-notes-to-pdf/": ["Selected synthetic images 2,1,3, reordered to 1,2,3 and downloaded a three-page PDF; rendered pages inspected.", "JPEG/PNG support, no OCR and application guardrails checked against the existing component."],
  "/workflows/check-assignment-length/": ["The exact example returned 4 words, 30 characters and 27 without spaces in both current counter interfaces.", "Extraction versus OCR, optional English heuristics and consistent included-section recount reviewed."],
  "/workflows/calculate-semester-results/": ["Existing mathematical helpers verified marks 78%, SGPA 60/7, credit-weighted CGPA 8.6, explicit equal CGPA 8.5 and required final score 85%.", "Missing-weight rejection, institution-supplied rules and separate attendance scenario reviewed."],
};
export const CONTENT_QUALITY = Object.fromEntries(CONTENT_PAGES.map(page => [page.path, {
  uniqueValue: page.uniqueValue,
  example: page.example,
  limitations: page.limitations,
  reviewedOn: REVIEWED_ON,
  reviewedRevision: "7ecef62",
  evidence: EVIDENCE[page.path],
}]));

/** Explicit overlap review is required in addition to the general publishing gate. */
export const HUB_DISTINCTIONS = {
  "/document-tools/": {
    category: "/categories/pdf-tools/",
    categoryIntent: "Browse the PDF utility inventory",
    hubIntent: "Choose an operation from a source-format, page, dimension or byte-size problem",
    distinction: "Cross-format decision paths, operation order, manual handoffs and independent pixel/byte examples; the category retains its searchable PDF inventory.",
    reviewedOn: REVIEWED_ON,
  },
  "/writing-tools/": {
    category: "/categories/text-tools/",
    categoryIntent: "Browse the broad text utility inventory",
    hubIntent: "Choose and interpret a draft-review method",
    distinction: "Counting-boundary decisions and comparisons of correction, readability and frequency; the category retains text transformations and other inventory entries.",
    reviewedOn: REVIEWED_ON,
  },
};
