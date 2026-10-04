import { describe, expect, it } from "vitest";
import { contrastRatio, getChecks } from "./ColorContrastChecker";

describe("WCAG contrast thresholds", () => {
  it("uses the unrounded ratio at the 4.5:1 boundary", () => {
    expect(getChecks(4.499).find((check) => check.label === "AA Normal Text")?.pass).toBe(false);
    expect(getChecks(4.5).find((check) => check.label === "AA Normal Text")?.pass).toBe(true);
  });
  it("keeps the computed ratio precise until presentation", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBe(21);
    expect(contrastRatio("#777777", "#ffffff")).toBeGreaterThan(4.47);
    expect(contrastRatio("#777777", "#ffffff")).toBeLessThan(4.5);
  });
});
