import { describe, expect, it } from "vitest";
import { buildSearchData } from "./search";
import { TOOLS, CATEGORIES } from "./tools";
import { LOCALIZED_TOOL_SLUGS, getLocalizedTools } from "./localized";
import {
  findSearchEntries,
  serializeSearchData,
  type SearchEntry,
} from "../helpers/search";

describe("compact search data", () => {
  it.each(["en", "es", "hi"] as const)(
    "includes exactly published %s tool URLs and categories",
    (lang) => {
      const { entries } = buildSearchData(lang);
      const prefix = lang === "en" ? "" : `/${lang}`;
      const slugs =
        lang === "en" ? TOOLS.map((t) => t.slug) : LOCALIZED_TOOL_SLUGS;
      expect(
        entries.filter((e) => e.type === "tool").map((e) => e.url),
      ).toEqual(slugs.map((slug) => `${prefix}/tools/${slug}/`));
      expect(
        entries.filter((e) => e.type === "category").map((e) => e.url),
      ).toEqual(
        (lang === "en"
          ? CATEGORIES.map((c) => c.slug)
          : [
              "text-tools",
              "developer-tools",
              "converters",
              "pdf-tools",
              "design-tools",
            ]
        ).map((slug) => `${prefix}/categories/${slug}/`),
      );
      expect(new Set(entries.map((e) => e.url)).size).toBe(entries.length);
      entries.forEach((entry) =>
        expect(Object.keys(entry).sort()).toEqual([
          "description",
          "icon",
          "name",
          "type",
          "url",
        ]),
      );
    },
  );

  it("preserves labels and descriptions in the page's language", () => {
    for (const lang of ["es", "hi"] as const) {
      const { entries, labels } = buildSearchData(lang);
      const tool = getLocalizedTools(lang)[0];
      expect(entries[0]).toMatchObject({
        name: tool.name,
        description: tool.description,
      });
      expect(labels.title).not.toBe(buildSearchData("en").labels.title);
      expect(entries.some((e) => e.url.includes("attendance-calculator"))).toBe(
        false,
      );
    }
  });

  it("retains homepage keyword searches, result order and five-result limit", () => {
    const { entries } = buildSearchData("en", true);
    for (const query of [
      "attendance",
      "pdf",
      "text",
      " ",
      ...TOOLS.flatMap((t) => t.keywords),
    ]) {
      const q = query.trim().toLowerCase();
      const expected = TOOLS.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.keywords.some((k) => k.includes(q)),
      ).slice(0, 5);
      expect(
        findSearchEntries(entries, query, {
          limit: 5,
          toolsOnly: true,
          includeKeywords: true,
        }).map((e) => e.url),
      ).toEqual(expected.map((t) => `/tools/${t.slug}/`));
    }
  });

  it("keeps modal matching limited to names/descriptions and ten results", () => {
    const entries: SearchEntry[] = Array.from({ length: 12 }, (_, i) => ({
      type: "tool",
      name: `Tool ${i}`,
      description: "Helpful converter",
      icon: "",
      url: `/tools/${i}/`,
      keywords: ["secret"],
    }));
    expect(findSearchEntries(entries, " secret ")).toEqual([]);
    expect(findSearchEntries(entries, " CONVERTER ")).toHaveLength(10);
    expect(findSearchEntries(entries, "")).toEqual(entries.slice(0, 10));
    expect(findSearchEntries(entries, "不存在🙂مرحبا")).toEqual([]);
  });

  it("escapes script termination without corrupting Unicode or displayed text", () => {
    const entries: SearchEntry[] = [
      {
        type: "tool",
        name: '</script><script>alert("x")</script>',
        description: "🙂 हिन्दी Español <b>&",
        icon: "",
        url: "/tools/example/",
      },
    ];
    const data = { entries, labels: buildSearchData("en").labels };
    const serialized = serializeSearchData(data);
    expect(serialized).not.toContain("<");
    expect(JSON.parse(serialized)).toEqual(data);
  });
});
