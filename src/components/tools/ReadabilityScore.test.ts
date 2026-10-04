import { describe, expect, it } from "vitest";
import { calculateScores } from "./ReadabilityScore";

describe("English readability calculation", () => {
  it.each(["", "123 123 123 123 123 123 123 123 123 123", "! ? -- ! ? -- ! ? -- !", "हिन्दी शब्द हिन्दी शब्द हिन्दी शब्द हिन्दी शब्द हिन्दी शब्द"])(
    "does not produce an English score for input without eligible prose: %s",
    text => expect(calculateScores(text)).toBeNull(),
  );

  it("requires ten letter-bearing words instead of letting numeric tokens satisfy the minimum", () => {
    expect(calculateScores("The cat sat on the mat and the dog 123 456 789")).toBeNull();
  });

  it("preserves scores above 100 and negative formula estimates", () => {
    const scores = calculateScores("The cat sat on the mat and the dog ran.");
    expect(scores).toMatchObject({
      wordCount: 10,
      sentenceCount: 1,
      syllableCount: 10,
      fleschKincaidGrade: 0.1,
      fleschReadingEase: 112.1,
      colemanLiau: -1.7,
      ari: -2.8,
    });
  });

  it("preserves negative reading ease for polysyllabic prose", () => {
    expect(calculateScores("university university university university university university university university university university."))
      .toMatchObject({ wordCount: 10, syllableCount: 50, fleschReadingEase: -226.3 });
  });

  it("does not let standalone numbers distort the prose word or character denominators", () => {
    const prose = "The cat sat on the mat and the dog ran.";
    expect(calculateScores(`${prose} 123 456 789`)).toEqual(calculateScores(prose));
  });
});
