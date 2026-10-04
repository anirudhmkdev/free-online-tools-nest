import { describe, expect, it } from "vitest";
import { applyContentChanges, applyApprovedDeltas } from "../../scripts/phase-3-protection.mjs";

describe("main and demand approval composition", () => {
  it("preserves historical evidence and publishing signals through all three content layers", () => {
    const route = "/tools/example/";
    const original = { pages: { [route]: { title: "Original", ownedTextHash: "a".repeat(64), robots: "index, follow", canonicals: ["https://example.com/tools/example/"] } }, sources: { "src/data/tools.ts": "a".repeat(64) } };
    const main = applyContentChanges(original, { pages: { [route]: { title: { before: "Original", after: "Reviewed", reason: "Existing main editorial review" } } }, sources: {} });
    const demand = applyApprovedDeltas(main.fixture, { pages: { [route]: { signals: { ownedTextHash: "b".repeat(64) }, reason: "Demand discovery" } }, sources: { "src/data/tools.ts": { hash: "b".repeat(64), reason: "Demand copy" } } });
    const integration = applyApprovedDeltas(demand.fixture, { pages: { [route]: { signals: { ownedTextHash: "c".repeat(64) }, reason: "Combine reviewed behavior" } }, sources: {} });
    expect([...main.failures, ...demand.failures, ...integration.failures]).toEqual([]);
    expect(integration.fixture.pages[route]).toEqual({ ...original.pages[route], title: "Reviewed", ownedTextHash: "c".repeat(64) });
    expect(original.pages[route].title).toBe("Original");
    expect(original.sources["src/data/tools.ts"]).toBe("a".repeat(64));
    expect(applyApprovedDeltas(integration.fixture, { pages: { [route]: { reason: "Invalid publishing change", signals: { robots: "noindex" } } }, sources: {} }).failures).toEqual([route + ": invalid approved content delta"]);
  });
});
