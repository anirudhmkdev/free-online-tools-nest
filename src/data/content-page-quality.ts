import { HUBS } from "./hubs";
import { WORKFLOWS } from "./workflows";

export const CONTENT_PAGES = [...HUBS, ...WORKFLOWS];
export const CONTENT_QUALITY = Object.fromEntries(CONTENT_PAGES.map(page => [page.path, {
  uniqueValue: page.uniqueValue,
  example: page.example,
  limitations: page.limitations,
  reviewedOn: null as string | null,
  evidence: [] as string[],
}]));

/** Explicit overlap review is required in addition to the general publishing gate. */
export const HUB_DISTINCTIONS = {
  "/document-tools/": {
    category: "/categories/pdf-tools/",
    categoryIntent: "Browse the PDF utility inventory",
    hubIntent: "Choose an operation from a source-format, page, dimension or byte-size problem",
    distinction: "Cross-format decision paths, operation order, manual handoffs and independent pixel/byte examples; the category retains its searchable PDF inventory.",
    reviewedOn: null as string | null,
  },
  "/writing-tools/": {
    category: "/categories/text-tools/",
    categoryIntent: "Browse the broad text utility inventory",
    hubIntent: "Choose and interpret a draft-review method",
    distinction: "Counting-boundary decisions and comparisons of correction, readability and frequency; the category retains text transformations and other inventory entries.",
    reviewedOn: null as string | null,
  },
};
