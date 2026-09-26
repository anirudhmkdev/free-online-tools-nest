import { describe, expect, it } from "vitest";
import { CONTENT_PAGES } from "../data/content-page-quality";
import { contentPage, contentSchema, isReviewedDestination, validateContentReferences, reviewErrors } from "./content-navigation";
import { PAGE_POLICIES } from "../data/page-policy";

describe("content navigation", () => {
  it("blocks indexing without dated evidence or a reviewed category distinction", () => {
    const page = contentPage("/document-tools/");
    const policy = { ...PAGE_POLICIES[page.path], indexable: true, reviewStatus: "reviewed" as const, lastReviewed: "2026-09-26" };
    expect(reviewErrors(page, policy, {reviewedOn:null,evidence:[]})).not.toEqual([]);
    const quality = {reviewedOn:"2026-09-26",evidence:["Verified example"]};
    expect(reviewErrors(page, policy, quality, {reviewedOn:null}).join(" ")).toContain("distinction");
    expect(reviewErrors(page, policy, quality, {reviewedOn:"2026-09-26"})).toEqual([]);
    expect(reviewErrors(page, {...policy,indexable:false}, {reviewedOn:null,evidence:[]}, {reviewedOn:null})).toEqual([]);
  });
  it("rejects missing destinations instead of silently hiding them", () => {
    expect(() => contentPage("/missing/")).toThrow("Missing content destination");
    const page = { ...contentPage("/student-tools/"), related: [{ path: "/missing/", label: "Missing" }] };
    expect(validateContentReferences([page], PAGE_POLICIES).join(" ")).toContain("missing /missing/");
  });
  it("requires actual reviewed/indexable/sitemap-eligible policy before promotion", () => {
    const policy = PAGE_POLICIES["/tools/sgpa-calculator/"];
    expect(isReviewedDestination("/candidate/", { "/candidate/": policy })).toBe(true);
    for (const patch of [{indexable: false}, {sitemapEligible: false}, {reviewStatus: "pending-evidence" as const}, {lastReviewed: null}]) {
      expect(isReviewedDestination("/candidate/", { "/candidate/": { ...policy, ...patch } })).toBe(false);
    }
    expect(isReviewedDestination("/missing/")).toBe(false);
  });
  it("uses schema matching content, with no unsubstantiated date fields", () => {
    for (const page of CONTENT_PAGES) {
      const schema = contentSchema(page);
      expect(schema["@type"]).toBe(page.kind === "hub" ? "CollectionPage" : "WebPage");
      for (const property of ["lastReviewed", "datePublished", "dateModified", "aggregateRating"]) expect(schema).not.toHaveProperty(property);
    }
    expect(contentSchema(contentPage("/workflows/")).mainEntity?.itemListElement).toHaveLength(5);
  });
});
