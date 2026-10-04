import { describe, expect, it } from "vitest";
import { parsePageRange } from "./PdfSplitter";

describe("PDF splitter range validation", () => {
  it("keeps ordered groups and valid inclusive boundaries", () => {
    expect(parsePageRange("1-3,5,7-9", 9)).toEqual([[1, 2, 3], [5], [7, 8, 9]]);
  });

  it.each(["1,99", "1,0", "1-3,broken", "3-1", "1-6", "1,", "", "0", "9007199254740993"])(
    "rejects the whole selection instead of silently dropping invalid input: %s",
    (range) => expect(parsePageRange(range, 5)).toEqual([]),
  );
});
