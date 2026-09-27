import { expect, it } from "vitest";
import { calculatePercentage } from "./percentage";
it("calculates each supported mode and exposes the formula", () => {
  expect(calculatePercentage("of", "15", "80")).toEqual({value:12,formula:"15 ÷ 100 × 80"});
  expect(calculatePercentage("is", "20", "80").value).toBe(25);
  expect(calculatePercentage("change", "80", "100").value).toBe(25);
  expect(calculatePercentage("change", "-80", "-40").value).toBe(50);
});
it("rejects impossible, malformed and non-finite calculations", () => {
  for(const [a,b] of [["", "1"],["12x","2"],["Infinity","2"],["1e999","2"]]) expect(()=>calculatePercentage("of",a,b)).toThrow();
  expect(()=>calculatePercentage("is","1","0")).toThrow(/zero/);
  expect(()=>calculatePercentage("change","0","1")).toThrow(/zero/);
  expect(()=>calculatePercentage("of","1e308","1e308")).toThrow(/range/);
});
