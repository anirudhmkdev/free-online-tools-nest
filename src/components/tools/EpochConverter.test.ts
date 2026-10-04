import { describe, expect, it } from "vitest";
import { dateFieldsToTimestamp } from "./EpochConverter";

const fields = { year: "2024", month: "2", day: "29", hour: "12", minute: "0", second: "0" };

describe("manual UTC date fields", () => {
  it("accepts a real leap day and preserves years below 100", () => {
    expect(dateFieldsToTimestamp(fields)).toBe(Date.UTC(2024, 1, 29, 12));
    expect(new Date(dateFieldsToTimestamp({ ...fields, year: "4" })!).getUTCFullYear()).toBe(4);
  });
  it("rejects dates JavaScript would otherwise silently roll into another month", () => {
    expect(dateFieldsToTimestamp({ ...fields, year: "2023" })).toBeNull();
    expect(dateFieldsToTimestamp({ ...fields, month: "4", day: "31" })).toBeNull();
    expect(dateFieldsToTimestamp({ ...fields, month: "13" })).toBeNull();
  });
  it("rejects invalid time and incomplete or malformed numeric fields", () => {
    expect(dateFieldsToTimestamp({ ...fields, hour: "24" })).toBeNull();
    expect(dateFieldsToTimestamp({ ...fields, minute: "60" })).toBeNull();
    expect(dateFieldsToTimestamp({ ...fields, second: "" })).toBeNull();
    expect(dateFieldsToTimestamp({ ...fields, year: "2024x" })).toBeNull();
    expect(dateFieldsToTimestamp({ ...fields, day: "2.5" })).toBeNull();
    expect(dateFieldsToTimestamp({ ...fields, day: "-1" })).toBeNull();
  });
});
