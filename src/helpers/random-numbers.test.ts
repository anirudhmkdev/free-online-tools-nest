import { describe, expect, it } from "vitest";
import { generateRandomNumbers, MAX_RANDOM_RANGE, parseRandomNumberRequest, randomNumberTotals } from "./random-numbers";

describe("random integer request validation", () => {
  it.each([
    ["", "10", "1"], ["1.5", "10", "1"], ["1", "10.2", "1"], ["1", "10", "1.5"],
    ["1", "10", "0"], ["1", "10", "1001"], ["10", "1", "1"], ["NaN", "10", "1"],
    ["1", "9007199254740992", "1"], ["0", String(MAX_RANDOM_RANGE), "1"], ["1junk", "10", "1"],
  ])("rejects invalid bounds/count %s %s %s", (min, max, count) => {
    expect(parseRandomNumberRequest(min, max, count, true).error).toBeTruthy();
  });
  it("rejects impossible unique counts instead of returning a partial result", () => {
    expect(parseRandomNumberRequest("1", "2", "3", false).error).toContain("only 2 distinct numbers");
  });
  it("supports single-value ranges, negative bounds and the full unsigned 32-bit range", () => {
    expect(parseRandomNumberRequest("-5", "-5", "1", false).request).toEqual({ min: -5, max: -5, count: 1, allowDuplicates: false });
    expect(parseRandomNumberRequest("0", String(MAX_RANDOM_RANGE - 1), "1000", true).error).toBeUndefined();
  });
});

describe("random integer generation", () => {
  it("rejects the biased tail before mapping a draw to a smaller range", () => {
    const draws = [MAX_RANDOM_RANGE - 1, 0, 8];
    expect(generateRandomNumbers({ min: 1, max: 6, count: 2, allowDuplicates: true }, () => draws.shift()!)).toEqual([1, 3]);
    expect(draws).toHaveLength(0);
  });
  it("reaches both ends of the full supported range", () => {
    const draws = [0, MAX_RANDOM_RANGE - 1];
    expect(generateRandomNumbers({ min: 0, max: MAX_RANDOM_RANGE - 1, count: 2, allowDuplicates: true }, () => draws.shift()!)).toEqual([0, MAX_RANDOM_RANGE - 1]);
  });
  it("produces a complete distinct sample without duplicate retry loops", () => {
    const result = generateRandomNumbers({ min: -499, max: 500, count: 1000, allowDuplicates: false }, () => 0);
    expect(result).toHaveLength(1000);
    expect(new Set(result).size).toBe(1000);
    expect(Math.min(...result)).toBe(-499);
    expect(Math.max(...result)).toBe(500);
  });
  it("keeps exact results near safe integer limits and propagates random-source failure", () => {
    const max = Number.MAX_SAFE_INTEGER;
    expect(generateRandomNumbers({ min: max - 1, max, count: 2, allowDuplicates: false }, () => 0)).toEqual([max - 1, max]);
    expect(() => generateRandomNumbers({ min: 1, max: 2, count: 1, allowDuplicates: true }, () => { throw new Error("source unavailable"); })).toThrow("source unavailable");
  });
  it("preserves exact sums and correctly rounded means", () => {
    expect(randomNumberTotals([Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER - 1])).toEqual({ sum: "18014398509481981", average: "9007199254740990.5" });
    expect(randomNumberTotals([-1, 0, 0])).toEqual({ sum: "-1", average: "-0.33" });
    expect(randomNumberTotals([0, 0])).toEqual({ sum: "0", average: "0" });
  });
});
