/** Discovery choices only. Publishing, indexing and advertising policy stay separate. */
export type ToolDiscoveryTier = "primary" | "secondary";

export const PRIMARY_TOOL_SLUGS = [
  "word-counter", "character-counter", "lorem-ipsum-generator", "grammar-checker",
  "readability-score", "word-cloud-generator", "json-formatter", "html-formatter",
  "regex-tester", "markdown-to-html", "sql-formatter", "robots-txt-generator",
  "seo-length-checker", "canonical-tag-generator", "alt-text-checker",
  "serp-preview-generator", "image-compressor", "image-resizer", "pdf-merger",
  "pdf-compressor", "age-calculator", "random-number-generator", "epoch-converter",
  "qr-code-generator", "color-contrast-checker",
] as const;

const primarySlugs = new Set<string>(PRIMARY_TOOL_SLUGS);

export function getToolDiscoveryTier(slug: string): ToolDiscoveryTier {
  return primarySlugs.has(slug) ? "primary" : "secondary";
}

/** Operates on the supplied catalogue, including only translations that already exist. */
export function partitionToolsByDiscovery<T extends { slug: string }>(tools: readonly T[]) {
  return {
    primary: tools.filter((tool) => getToolDiscoveryTier(tool.slug) === "primary"),
    secondary: tools.filter((tool) => getToolDiscoveryTier(tool.slug) === "secondary"),
  };
}
