import { describe, it, expect } from "vitest";
import manifest from "../data/approved-tool-retirements.json";
import baseline from "../data/__fixtures__/post-phase-2-routes.json";
import { applyApprovedRetirements } from "../../scripts/approved-retirements.mjs";

describe("explicit Text Humanizer retirement", () => {
  it("removes exactly the non-advertising route and its sitemap entry while preserving frozen evidence", () => {
    const result = applyApprovedRetirements(baseline,manifest);
    expect(result.failures).toEqual([]);
    expect(result.routes).toEqual(["/tools/text-humanizer/"]);
    expect(result.fixture.pages).toHaveLength(baseline.pages.length-1);
    expect(result.fixture.sitemap).toHaveLength(baseline.sitemap.length-1);
    expect(baseline.pages.some(page=>page.route==="/tools/text-humanizer/")).toBe(true);
    expect(result.fixture.pages.filter((page: {adEligible: boolean})=>page.adEligible)).toEqual(baseline.pages.filter(page=>page.adEligible));
  });
  it("rejects another retirement, advertising removal and unapproved source deletion", () => {
    for (const change of [{route:"/tools/word-counter/"},{beforePolicy:{...manifest.retirements[0].beforePolicy,adEligible:true}},{sources:["src/layouts/Layout.astro"]}]) {
      const revised={...manifest,retirements:[{...manifest.retirements[0],...change}]};
      expect(applyApprovedRetirements(baseline,revised).failures).not.toEqual([]);
    }
  });
});
