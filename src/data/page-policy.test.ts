import { describe, expect, it } from "vitest";
import baseline from "./__fixtures__/pre-pivot-routes.json";
import phase3 from "./__fixtures__/phase-3-additions.json";
import additions from "./__fixtures__/phase-2-additions.json";
import { getPagePolicy, isSitemapEligible, PAGE_POLICIES } from "./page-policy";
import retirements from "./approved-tool-retirements.json";

describe("Phase 1 publishing migration", () => {
  it("preserves every route, indexing decision, sitemap member and ad eligibility", () => {
    const retired = retirements.retirements.map(item => item.route);
    expect(retired).toEqual(["/tools/text-humanizer/"]);
    const legacyRoutes = baseline.pages.map(page => page.route).filter(route => !retired.includes(route));
    expect(Object.keys(PAGE_POLICIES).filter(route => !additions.includes(route) && !phase3.includes(route)).sort()).toEqual(legacyRoutes.sort());
    for (const route of additions) {
      const policy = PAGE_POLICIES[route];
      const approvedGuides = route === "/tools/image-to-pdf/" ? ["/blog/verify-browser-tool-no-upload/"] : [];
      expect(policy, route).toMatchObject({ indexable: true, sitemapEligible: true, canonicalPath: route, adEligible: false, reviewStatus: "reviewed", relatedGuides: approvedGuides });
      expect(policy.lastReviewed, route).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
    for (const page of baseline.pages) {
      if (retired.includes(page.route)) {
        expect(PAGE_POLICIES[page.route]).toBeUndefined();
        expect(isSitemapEligible(`https://freeonlinetoolsnest.com${page.route}`)).toBe(false);
        continue;
      }
      const policy = getPagePolicy(page.route);
      expect(policy.indexable, page.route).toBe(page.indexable);
      expect(policy.adEligible, page.route).toBe(page.adEligible);
      expect(isSitemapEligible(`https://freeonlinetoolsnest.com${page.route}`), page.route).toBe(page.sitemapEligible);
      expect(policy.canonicalPath, page.route).toBe(page.route);
    }
  });

  it("requires explicit metadata for additions rather than silently publishing them", () => {
    expect(() => getPagePolicy("/tools/not-reviewed/")).toThrow("Missing publishing policy");
    expect(isSitemapEligible("https://freeonlinetoolsnest.com/tools/not-reviewed/")).toBe(false);
    expect(getPagePolicy("/tools/word-counter")).toBe(getPagePolicy("/tools/word-counter/"));
  });

  it("has meaningful intent and valid references without invented review dates", () => {
    for (const [route, policy] of Object.entries(PAGE_POLICIES)) {
      expect(policy.primaryAudience.trim(), route).not.toBe("");
      expect(policy.primaryIntent.trim(), route).not.toBe("");
      if (policy.lastReviewed) expect(policy.lastReviewed, route).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      for (const target of [...policy.relatedGuides, ...policy.relatedWorkflows]) {
        expect(PAGE_POLICIES[target], `${route} -> ${target}`).toBeDefined();
      }
    }
  });
});
