import { describe, expect, it } from "vitest";
import { CONTENT_PAGES, CONTENT_QUALITY, HUB_DISTINCTIONS } from "./content-page-quality";
import { PAGE_POLICIES } from "./page-policy";
import additions from "./__fixtures__/phase-3-additions.json";
import { contentReferences, validateContentReferences } from "../helpers/content-navigation";
import { calculateMarks, calculateSgpa, calculateCgpaSemesters, calculateRequiredMarks } from "../helpers/student-calculators";
import { getLocalizedTools } from "./localized";

describe("Phase 3 content review", () => {
  it("contains exactly the nine approved routes and real references", () => {
    expect(CONTENT_PAGES.map(page => page.path).sort()).toEqual([...additions].sort());
    expect(validateContentReferences(CONTENT_PAGES, PAGE_POLICIES)).toEqual([]);
    expect(new Set(CONTENT_PAGES.map(p => p.uniqueValue)).size).toBe(9);
    expect(new Set(CONTENT_PAGES.map(p => p.heading)).size).toBe(9);
    for (const page of CONTENT_PAGES) {
      expect(page.example.input).not.toBe(""); expect(page.example.output).not.toBe("");
      expect(page.limitations.length).toBeGreaterThan(0);
      expect(PAGE_POLICIES[page.path].adEligible).toBe(false);
      if (PAGE_POLICIES[page.path].indexable) {
        expect(CONTENT_QUALITY[page.path].reviewedOn).toBe(PAGE_POLICIES[page.path].lastReviewed);
        expect(CONTENT_QUALITY[page.path].evidence.length).toBeGreaterThan(0);
      }
    }
  });
  it("matches the agreed hub core-tool inventories without SEO-tool promotion", () => {
    const expected = {
      "/student-tools/": ["attendance-calculator", "sgpa-calculator", "cgpa-calculator", "marks-percentage-calculator", "required-marks-calculator", "percentage-calculator"],
      "/document-tools/": ["image-to-pdf", "pdf-merger", "pdf-splitter", "pdf-compressor", "pdf-to-text", "pdf-to-images", "image-compressor", "image-resizer", "image-cropper"],
      "/writing-tools/": ["word-counter", "character-counter", "grammar-checker", "readability-score", "text-analyzer", "word-cloud-generator"],
    };
    for (const [route, slugs] of Object.entries(expected)) {
      const page = CONTENT_PAGES.find(p => p.path === route)!;
      expect(page.decisions.flatMap(d => d.links.map(l => l.path))).toEqual(slugs.map(s => `/tools/${s}/`));
    }
  });
  it("keeps reverse workflow links relevant to actual tool use", () => {
    for (const [route, policy] of Object.entries(PAGE_POLICIES)) {
      if (!route.startsWith("/tools/")) continue;
      expect(new Set(policy.relatedWorkflows).size).toBe(policy.relatedWorkflows.length);
      for (const path of policy.relatedWorkflows) {
        const workflow = CONTENT_PAGES.find(p => p.path === path)!;
        expect(workflow.kind).toBe("workflow");
        expect(contentReferences(workflow).some(link => link.path === route), `${route} -> ${path}`).toBe(true);
      }
    }
  });
  it("requires separate category-overlap evidence for the two candidate hubs", () => {
    for (const [path, review] of Object.entries(HUB_DISTINCTIONS)) {
      expect(review.hubIntent).not.toBe(review.categoryIntent);
      expect(PAGE_POLICIES[review.category].indexable).toBe(true);
      if (PAGE_POLICIES[path].indexable) expect(review.reviewedOn).toBe(PAGE_POLICIES[path].lastReviewed);
    }
  });
  it("does not manufacture localized pages or increase localized tool availability", () => {
    for (const lang of ["es", "hi"] as const) {
      expect(getLocalizedTools(lang)).toHaveLength(20);
      for (const path of additions) expect(PAGE_POLICIES[`/${lang}${path}`]).toBeUndefined();
    }
  });
});

describe("worked academic scenarios use the existing mathematical engine", () => {
  it("aggregates unequal maxima to 78 percent", () => {
    expect(calculateMarks([{obtained:72,maximum:100},{obtained:45,maximum:50}]).percentage).toBe(78);
  });
  it("uses credits for semester GPA", () => {
    expect(calculateSgpa([{credits:3,points:8},{credits:4,points:9}],10).average).toBeCloseTo(60/7,10);
  });
  it("distinguishes credit weighting from deliberately equal semesters", () => {
    expect(calculateCgpaSemesters([{sgpa:8,weight:20},{sgpa:9,weight:30}],10,"credits").average).toBe(8.6);
    expect(calculateCgpaSemesters([{sgpa:8},{sgpa:9}],10,"equal").average).toBe(8.5);
    expect(() => calculateCgpaSemesters([{sgpa:8},{sgpa:9}],10,"credits")).toThrow();
  });
  it("requires 85 percent on the remaining assessment", () => {
    expect(calculateRequiredMarks({current:60,weight:40,target:70})).toMatchObject({required:85,status:"possible"});
  });
});
