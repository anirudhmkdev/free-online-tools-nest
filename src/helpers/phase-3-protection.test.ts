import { describe, expect, it } from "vitest";
import { ownedSignals, checkHubMetadata } from "../../scripts/phase-3-protection.mjs";
import baseline from "../data/__fixtures__/post-phase-2-routes.json";
import { PAGE_POLICIES } from "../data/page-policy";

describe("stable Phase 2 protection", () => {
  it("rejects matching hub/category titles, descriptions or H1s", () => {
    const category = {title:"Inventory",description:"Browse every tool",h1:["Tools"]};
    expect(checkHubMetadata(category, category)).toHaveLength(3);
    expect(checkHubMetadata({title:"Choose an operation",description:"Match your task",h1:["What needs changing?"]}, category)).toEqual([]);
  });
  it("preserves all 182 existing policy decisions independently of approved additions", () => {
    expect(baseline.pages).toHaveLength(182);
    for (const page of baseline.pages) {
      expect(PAGE_POLICIES[page.route], page.route).toMatchObject({
        indexable: page.indexable, sitemapEligible: page.sitemapEligible,
        canonicalPath: page.route, adEligible: page.adEligible,
      });
    }
  });
  const html = '<title>Original</title><meta name="description" content="Description"><header>Shared nav</header><main><h1>Owned heading</h1><p>Owned text</p><script src="/chunk-old.js">timestamp=123</script></main><footer>2025</footer>';
  it("ignores bundles, attributes, shared navigation, timestamps and permitted workflow additions", () => {
    const changed = html.replace('chunk-old', 'chunk-new').replace('123', '456').replace('2025', '2026').replace('Shared nav', 'Updated navigation').replace('<p>', '<p class="new-layout">').replace('</main>', '<section data-workflow-links><h2>Workflow</h2><a href="/workflows/">Next task</a></section></main>');
    expect(ownedSignals(changed, "/")).toEqual(ownedSignals(html, "/"));
  });
  it.each([['Owned text', 'Changed copy'], ['Owned heading', 'Changed heading'], ['Original', 'New title'], ['Description', 'New description']])("detects changed owned content: %s", (before, after) => {
    expect(ownedSignals(html.replace(before, after), "/")).not.toEqual(ownedSignals(html, "/"));
  });
  it("ignores only the existing Epoch live clock, preserving its surrounding content", () => {
    const clock = '<main><h1>Epoch</h1><p>Current Timestamp (ms) 12345 Refresh</p></main>';
    const route = "/es/tools/epoch-converter/";
    expect(ownedSignals(clock.replace('12345', '67890'), route)).toEqual(ownedSignals(clock, route));
    expect(ownedSignals(clock.replace('Refresh', 'Different copy'), route)).not.toEqual(ownedSignals(clock, route));
  });
});
