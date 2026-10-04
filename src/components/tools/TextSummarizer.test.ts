import { describe, expect, it } from "vitest";
import { summarize } from "./TextSummarizer";

describe("extractive summary sentence selection", () => {
  it("does not expand one selected occurrence into repeated identical sentences", () => {
    const result = summarize("Cats chase mice. Cats chase mice. Dogs sleep outside.", 1);
    expect(result).toHaveLength(1);
    expect(result[0].text).toBe("Cats chase mice.");
  });

  it("keeps selected sentences in source order", () => {
    expect(summarize("Cats chase mice. Dogs sleep outside. Cats chase mice.", 2).map(s => s.text))
      .toEqual(["Cats chase mice.", "Cats chase mice."]);
  });

  it("does not invent sentences when the input is empty or shorter than the requested summary", () => {
    expect(summarize("", 3)).toEqual([]);
    expect(summarize("One complete sentence.", 3)).toHaveLength(1);
  });
});
