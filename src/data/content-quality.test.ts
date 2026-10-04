import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { AD_ELIGIBLE_TOOL_SLUGS, TOOL_QUALITY } from "./tool-quality";
import { PUBLISHED_LOCALES, getLocalizedCategories, getLocalizedTool, getLocalizedTools, getLocalizedToolsByCategory } from "./localized";
import { CATEGORIES, TOOLS } from "./tools";
import additions from "./__fixtures__/phase-2-additions.json";
import { PAGE_POLICIES } from "./page-policy";

const root = process.cwd();

describe("Phase 2 student tool publication", () => {
  it("requires all six reviewed dossiers and keeps advertising disabled", () => {
    expect(additions).toHaveLength(6);
    expect(TOOLS).toHaveLength(82);
    expect(TOOLS.some(tool => tool.slug === "text-humanizer")).toBe(false);
    for (const route of additions) {
      const slug = route.split("/")[2];
      const tool = TOOLS.find(tool => tool.slug === slug)!;
      expect(tool, route).toBeDefined();
      expect(tool.adEligible, route).toBe(false);
      expect(AD_ELIGIBLE_TOOL_SLUGS).not.toContain(slug);
      expect(tool.quality?.verifiedOn, route).toBe(PAGE_POLICIES[route].lastReviewed);
      expect(tool.quality?.verifiedOn, route).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(tool.quality?.sections.some(section => section.example), route).toBe(true);
      expect(tool.quality?.limitations.length, route).toBeGreaterThan(0);
      expect(tool.quality?.sections.find(section => section.heading === "Verification")?.content, route).toContain("checked");
      expect(tool.usageSteps?.length, route).toBeGreaterThanOrEqual(3);
      expect(tool.faq?.length, route).toBeGreaterThanOrEqual(2);
    }
  });
  it("keeps Spanish and Hindi at exactly their 20 published tools", () => {
    for (const lang of PUBLISHED_LOCALES) {
      expect(getLocalizedTools(lang)).toHaveLength(20);
      for (const route of additions) {
        expect(getLocalizedTool(lang, route.split("/")[2])).toBeUndefined();
        expect(PAGE_POLICIES[`/${lang}${route}`]).toBeUndefined();
      }
    }
  });
});

describe("AdSense content eligibility", () => {
  it("limits eligibility to the 30 reviewed tool dossiers", () => {
    expect(AD_ELIGIBLE_TOOL_SLUGS).toHaveLength(30);
    expect(new Set(AD_ELIGIBLE_TOOL_SLUGS).size).toBe(30);

    for (const slug of AD_ELIGIBLE_TOOL_SLUGS) {
      const tool = TOOLS.find((candidate) => candidate.slug === slug);
      const quality = TOOL_QUALITY[slug];
      expect(tool?.adEligible, slug).toBe(true);
      expect(tool?.quality, slug).toBe(quality);
      expect(quality.engine.length, slug).toBeGreaterThan(8);
      expect(quality.supportedInputs.length, slug).toBeGreaterThan(0);
      expect(quality.outputFormats.length, slug).toBeGreaterThan(0);
      expect(quality.limits.length, slug).toBeGreaterThan(0);
      expect(quality.limitations.length, slug).toBeGreaterThan(0);
      expect(quality.sections.some((section) => section.example), slug).toBe(true);
      expect(quality.sections.find(section => section.heading === "When to use another workflow")?.content, slug).toBeTruthy();
      expect(quality.verifiedOn, slug).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }

    expect(TOOLS.filter((tool) => tool.adEligible)).toHaveLength(30);
  });

  it("keeps production CSP report-only and preview CSP enforcing", () => {
    const headers = readFileSync(join(root, "public", "_headers"), "utf8");
    const production = headers.split("# Live custom domain")[1]?.split("# Preview deployment hashes")[0] ?? "";
    expect(production).toContain("Content-Security-Policy-Report-Only:");
    expect(production).not.toContain("\n  Content-Security-Policy:");
    expect(headers.split("# Preview deployment hashes")[1]).toContain("Content-Security-Policy:");
  });
});

describe("localized publishing quality", () => {
  it("publishes no zero-tool localized categories", () => {
    for (const lang of PUBLISHED_LOCALES) {
      const categories = getLocalizedCategories(lang);
      expect(categories.length).toBeGreaterThan(0);
      for (const category of categories) {
        expect(getLocalizedToolsByCategory(lang, category.slug).length, `${lang}/${category.slug}`).toBeGreaterThan(0);
      }
      expect(categories.some((category) => category.slug === "calculators")).toBe(false);
      expect(categories.some((category) => category.slug === "seo-tools")).toBe(false);
    }
  });

  it("uses distinct per-tool localized examples and limitations", () => {
    for (const lang of PUBLISHED_LOCALES) {
      const content = TOOLS.map((tool) => getLocalizedTool(lang, tool.slug))
        .filter(Boolean)
        .map((tool) => tool!.additionalContent?.map((section) => section.content).join(" ") ?? "");
      expect(content).toHaveLength(20);
      expect(new Set(content).size).toBe(20);
    }
  });

  it("redirects withdrawn locale categories", () => {
    const redirects = readFileSync(join(root, "public", "_redirects"), "utf8");
    for (const lang of PUBLISHED_LOCALES) {
      for (const slug of ["calculators", "seo-tools"]) {
        expect(redirects).toContain(`/${lang}/categories/${slug}/  /${lang}/categories/  301`);
      }
    }
  });
});

describe("trust and legal content", () => {
  it("contains no obsolete public monetization promises", () => {
    const files = [
      join(root, "README.md"),
      join(root, "AGENTS.md"),
      join(root, "seo-keyword-plan.md"),
      join(root, "src", "i18n", "ui.ts"),
      join(root, "src", "i18n", "overrides.ts"),
      join(root, "src", "pages", "index.astro"),
      join(root, "src", "layouts", "ToolLayout.astro"),
    ];
    const obsolete = ["no " + "ads", "ad" + "-free", "self" + "-funded", "without ad " + "clutter"];
    const corpus = files.map((file) => readFileSync(file, "utf8").toLowerCase()).join("\n");
    for (const phrase of obsolete) expect(corpus).not.toContain(phrase);
  });

  it("contains required advertising disclosures in every legal locale", () => {
    const privacy = readFileSync(join(root, "src", "pages", "privacy-policy.astro"), "utf8");
    const localized = readFileSync(join(root, "src", "pages", "[locale]", "[staticPage].astro"), "utf8");
    for (const term of ["Google AdSense", "cookies", "personalized or non-personalized", "adssettings.google.com", "consent"]) {
      expect(privacy.toLowerCase()).toContain(term.toLowerCase());
    }
    expect(localized).toContain("Google AdSense");
    expect(localized).toContain("adssettings.google.com");
    expect(localized).toContain("विज्ञापन");
    expect(localized).toContain("Publicidad");
  });

  it("publishes all eight original guides and the standards page", () => {
    const guides = [
      "json-formatting-validation-edge-cases.md",
      "why-pdfs-compress-differently.md",
      "javascript-regex-flags-groups-mistakes.md",
      "image-compression-resizing-format-conversion.md",
      "csv-to-json-delimiters-quotes-headers.md",
      "decode-jwt-vs-verify-signature.md",
      "wcag-contrast-ratios-examples.md",
      "verify-browser-tool-no-upload.md",
    ];
    for (const guide of guides) {
      const content = readFileSync(join(root, "src", "content", "blog", guide), "utf8");
      expect(content, guide).toMatch(/^---\s*\n/);
      expect(content, guide).toMatch(/title:\s*\S+/);
      expect(content, guide).toMatch(/description:\s*\S+/);
      expect(content, guide).toMatch(/\]\(\/tools\/[a-z-]+\/\)/);
    }
    expect(readFileSync(join(root, "src", "pages", "standards.astro"), "utf8")).toContain("Advertising independence");
    expect(CATEGORIES).toHaveLength(7);
  });
});
