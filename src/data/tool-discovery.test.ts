import { describe, expect, it } from "vitest";
import { TOOLS } from "./tools";
import { getLocalizedTools } from "./localized";
import { buildSearchData } from "./search";
import { findSearchEntries, serializeSearchData } from "../helpers/search";
import { PRIMARY_TOOL_SLUGS, getToolDiscoveryTier, partitionToolsByDiscovery } from "./tool-discovery";

describe("demand-based tool discovery", () => {
  it("keeps all 83 tools in disjoint 25 primary / 58 secondary collections", () => {
    const { primary, secondary } = partitionToolsByDiscovery(TOOLS);
    expect(primary).toHaveLength(25);
    expect(secondary).toHaveLength(58);
    expect(new Set(PRIMARY_TOOL_SLUGS).size).toBe(25);
    expect(primary.map(tool => tool.slug).sort()).toEqual([...PRIMARY_TOOL_SLUGS].sort());
    expect(new Set([...primary, ...secondary].map(tool => tool.slug)).size).toBe(83);
  });

  it("keeps recent student tools and the PDF to Text workflow dependency accessible as secondary", () => {
    for (const slug of ["sgpa-calculator", "cgpa-calculator", "marks-percentage-calculator", "required-marks-calculator", "image-to-pdf", "pdf-to-text"]) {
      expect(getToolDiscoveryTier(slug)).toBe("secondary");
      expect(TOOLS.some(tool => tool.slug === slug)).toBe(true);
    }
  });

  it.each(["es", "hi"] as const)("partitions only the 20 existing %s translations", locale => {
    const tools = getLocalizedTools(locale);
    const { primary, secondary } = partitionToolsByDiscovery(tools);
    expect(tools).toHaveLength(20);
    expect(primary.length + secondary.length).toBe(20);
    expect([...primary, ...secondary].map(tool => tool.slug).sort()).toEqual(tools.map(tool => tool.slug).sort());
    expect(primary.every(tool => PRIMARY_TOOL_SLUGS.includes(tool.slug as typeof PRIMARY_TOOL_SLUGS[number]))).toBe(true);
  });
});

describe("search discovery", () => {
  it.each(["en", "es", "hi"] as const)("shows primary tools for an empty %s search and keeps all tools in the search index", locale => {
    const { entries } = buildSearchData(locale, true);
    const tools = entries.filter(entry => entry.type === "tool");
    expect(tools).toHaveLength(locale === "en" ? 83 : 20);
    const initial = findSearchEntries(entries, "  ", { limit: 100 });
    expect(initial.length).toBeGreaterThan(0);
    expect(initial.every(entry => entry.type === "tool" && entry.discoveryTier === "primary")).toBe(true);
    for (const entry of tools) {
      expect(findSearchEntries(entries, entry.name, { limit: 100, toolsOnly: true })).toContain(entry);
    }
  });

  it("finds secondary tools and categories when text is entered", () => {
    const { entries } = buildSearchData("en", true);
    expect(findSearchEntries(entries, "sgpa").some(entry => entry.discoveryTier === "secondary" && entry.url === "/tools/sgpa-calculator/")).toBe(true);
    expect(findSearchEntries(entries, "developer tools", { limit: 100 }).some(entry => entry.type === "category")).toBe(true);
  });

  it("keeps script-breaking text escaped while preserving metadata after parsing", () => {
    const data = buildSearchData("en");
    data.entries[0].description = "</script><script>alert(1)</script>";
    const serialized = serializeSearchData(data);
    expect(serialized).not.toContain("</script>");
    expect(JSON.parse(serialized)).toEqual(data);
  });
});
