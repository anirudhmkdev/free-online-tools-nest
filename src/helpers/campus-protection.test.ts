import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { applyApprovedDeltas } from "../../scripts/phase-3-protection.mjs";

describe("Campus frontend protection boundary", () => {
  it("keeps its recorded changes confined to visible text and shared presentation", () => {
    const delta = JSON.parse(readFileSync(new URL("../data/campus-frontend-delta.json", import.meta.url), "utf8"));
    expect(Object.keys(delta.sources)).toEqual(["src/layouts/Layout.astro"]);
    for (const page of Object.values(delta.pages) as { signals: Record<string, unknown> }[]) {
      expect(Object.keys(page.signals)).toEqual(["ownedTextHash"]);
      expect(page.signals.ownedTextHash).toMatch(/^[a-f0-9]{64}$/);
    }
  });

  it("preserves main's reviewed title and publishing signals in the frontend layer", () => {
    const route = "/tools/example/";
    const main = { pages: { [route]: { title: "Reviewed main title", ownedTextHash: "a".repeat(64), robots: "index, follow", canonicals: ["https://example.com/tools/example/"] } }, sources: {} };
    const campus = applyApprovedDeltas(main, { pages: { [route]: { reason: "Relocated intact facts", signals: { ownedTextHash: "b".repeat(64) } } }, sources: {} });
    expect(campus.failures).toEqual([]);
    expect(campus.fixture.pages[route]).toEqual({ ...main.pages[route], ownedTextHash: "b".repeat(64) });
    expect(main.pages[route].ownedTextHash).toBe("a".repeat(64));
    expect(applyApprovedDeltas(campus.fixture, { pages: { [route]: { reason: "Forbidden publishing change", signals: { robots: "noindex" } } }, sources: {} }).failures).toEqual([route + ": invalid approved content delta"]);
  });
});
