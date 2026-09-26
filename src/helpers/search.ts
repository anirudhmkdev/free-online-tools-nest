/** Small client-safe search contract. Keep editorial data imports out of this module. */
export interface SearchEntry {
  type: "tool" | "category";
  name: string;
  description: string;
  icon: string;
  url: string;
  keywords?: string[];
}

export interface SearchLabels {
  title: string;
  placeholder: string;
  noResults: string;
  category: string;
  tool: string;
  close: string;
}

export interface SearchData {
  entries: SearchEntry[];
  labels: SearchLabels;
}

/** Escape script termination while preserving the original text after parsing. */
export function serializeSearchData(data: SearchData): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function findSearchEntries(
  entries: SearchEntry[],
  query: string,
  { limit = 10, toolsOnly = false, includeKeywords = false } = {},
): SearchEntry[] {
  const q = query.toLowerCase().trim();
  return entries
    .filter(
      (entry) =>
        (!toolsOnly || entry.type === "tool") &&
        (!q ||
          entry.name.toLowerCase().includes(q) ||
          entry.description.toLowerCase().includes(q) ||
          (includeKeywords &&
            entry.keywords?.some((keyword) => keyword.includes(q)))),
    )
    .slice(0, limit);
}

const indexes = new WeakMap<Element, SearchData>();

/** The index is embedded once per page and shared by both search interfaces. */
export function readSearchData(): SearchData | undefined {
  const element = document.getElementById("site-search-data");
  if (!element) return undefined;
  const cached = indexes.get(element);
  if (cached) return cached;
  const data: SearchData = JSON.parse(element.textContent || "null");
  indexes.set(element, data);
  return data;
}

export function readSearchEntries(): SearchEntry[] {
  return readSearchData()?.entries ?? [];
}
