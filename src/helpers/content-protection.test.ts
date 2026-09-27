import { describe, expect, it } from "vitest";
import { applyContentChanges } from "../../scripts/phase-3-protection.mjs";

describe("scoped content changes without rewriting historical fixtures", () => {
  const fixture = {pages: {"/tools/example/": {title: "Before", robots: "index, follow", canonicals: ["https://example.com/tools/example/"]}}, sources: {"src/data/tools.ts": "a".repeat(64)}};
  it("requires exact historical evidence and records the replacement", () => {
    const result = applyContentChanges(fixture, {pages: {"/tools/example/": {title: {before:"Before", after:"Accurate title", reason:"Correct unsupported claim"}}}, sources:{}});
    expect(result.failures).toEqual([]);
    expect(result.fixture.pages["/tools/example/"].title).toBe("Accurate title");
    expect(fixture.pages["/tools/example/"].title).toBe("Before");
  });
  it.each(["robots", "canonicals", "adEligible"])("cannot approve publishing changes through %s", key => {
    expect(applyContentChanges(fixture, {pages: {"/tools/example/": {[key]: {before:fixture.pages["/tools/example/"][key as "title"], after:"changed", reason:"not allowed"}}}, sources:{}}).failures).not.toEqual([]);
  });
  it("rejects stale before values, missing reasons and unknown paths", () => {
    expect(applyContentChanges(fixture, {pages: {"/tools/example/": {title: {before:"wrong", after:"new", reason:"fix"}}}, sources:{}}).failures).toHaveLength(1);
    expect(applyContentChanges(fixture, {pages: {}, sources:{"public/ads.txt": {before:"a".repeat(64),after:"b".repeat(64),reason:"not allowed"}}}).failures).toHaveLength(1);
  });
});
