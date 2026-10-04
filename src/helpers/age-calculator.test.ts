import { describe, expect, it } from "vitest";
import { computeAge } from "./age-calculator";

const age = (birth: string, target: string) => computeAge(new Date(birth), new Date(target));

describe("calendar age decomposition", () => {
  it("clamps January 31 to February's last day without negative residuals", () => {
    expect(age("2025-01-31", "2025-02-28")).toMatchObject({ years: 0, months: 1, weeks: 0, days: 0 });
    expect(age("2025-01-31", "2025-03-01")).toMatchObject({ years: 0, months: 1, weeks: 0, days: 1 });
  });
  it("does not overlap residual weeks and days with completed calendar months", () => {
    expect(age("2000-06-15", "2025-08-30")).toMatchObject({ years: 25, months: 2, weeks: 2, days: 1 });
    expect(age("2025-01-01", "2025-01-31")).toMatchObject({ years: 0, months: 0, weeks: 4, days: 2 });
  });
  it("handles leap birthdays using the stated month-end convention", () => {
    expect(age("2024-02-29", "2025-02-28")).toMatchObject({ years: 1, months: 0, weeks: 0, days: 0 });
    expect(age("2024-02-29", "2025-03-01")).toMatchObject({ years: 1, months: 0, weeks: 0, days: 1 });
  });
  it("uses calendar dates rather than local daylight-saving durations", () => {
    expect(age("2025-03-08", "2025-03-10")).toMatchObject({ hours: 48, minutes: 2880, seconds: 172800 });
    expect(age("2025-01-01", "2025-01-01")).toMatchObject({ years: 0, months: 0, weeks: 0, days: 0, hours: 0 });
  });
  it("rejects invalid and reversed dates", () => {
    expect(() => age("invalid", "2025-01-01")).toThrow("valid dates");
    expect(() => age("2025-02-01", "2025-01-01")).toThrow("after");
  });
});
