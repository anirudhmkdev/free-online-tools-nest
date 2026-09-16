import { describe, expect, it } from "vitest";
import {
  calculateAttendance as attendance,
  calculateSgpa as sgpa,
  calculateCgpaSemesters as cgpa,
  calculateMarks as marks,
  calculateRequiredMarks as required,
  numberInput,
  pointsForGrade,
  validateGradeMapping,
} from "./student-calculators";

describe("attendance boundaries and exact class counts", () => {
  it("calculates current percentage and minimum catch-up", () => {
    expect(attendance({ attended: 30, total: 50, target: 75 })).toMatchObject({
      current: 60,
      catchUp: 30,
      reachable: true,
      missable: 0,
    });
    expect(attendance({ attended: 45, total: 50, target: 75 })).toMatchObject({
      catchUp: 0,
      missable: 10,
    });
  });
  it.each([0, 75, 100])(
    "handles no conducted classes at target %s",
    (target) => {
      expect(attendance({ attended: 0, total: 0, target })).toMatchObject({
        current: null,
        catchUp: target === 0 ? 0 : 1,
        missable: target === 0 ? null : 0,
      });
    },
  );
  it("handles 100 percent without dividing by zero", () => {
    expect(attendance({ attended: 10, total: 10, target: 100 })).toMatchObject({
      catchUp: 0,
      missable: 0,
      reachable: true,
    });
    expect(attendance({ attended: 9, total: 10, target: 100 })).toMatchObject({
      catchUp: null,
      reachable: false,
    });
  });
  it("handles a zero target and remaining classes explicitly", () => {
    expect(attendance({ attended: 0, total: 10, target: 0 })).toMatchObject({
      catchUp: 0,
      missable: null,
    });
    expect(
      attendance({ attended: 0, total: 0, target: 75, remaining: 0 }).reachable,
    ).toBe(false);
    const result = attendance({
      attended: 30,
      total: 50,
      target: 75,
      remaining: 20,
    });
    expect(result.reachable).toBe(false);
    expect(result.maximumFinal).toBeCloseTo(71.4285714286);
  });
  it("does not use rounded percentages to pass a threshold", () => {
    expect(
      attendance({ attended: 7499, total: 10000, target: 75 }),
    ).toMatchObject({ catchUp: 4, met: false });
    expect(
      attendance({ attended: 3333, total: 10000, target: 33.33 }),
    ).toMatchObject({ catchUp: 0, met: true });
  });
  it("returns minimal catch-up and maximal permissible absence for integer targets", () => {
    for (let t = 1; t <= 30; t++)
      for (let a = 0; a <= t; a++)
        for (const target of [50, 66, 75, 90]) {
          const r = attendance({ attended: a, total: t, target });
          const x = r.catchUp!;
          expect(100 * (a + x)).toBeGreaterThanOrEqual(target * (t + x));
          if (x > 0)
            expect(100 * (a + x - 1)).toBeLessThan(target * (t + x - 1));
          if (r.met) {
            expect(100 * a).toBeGreaterThanOrEqual(target * (t + r.missable!));
            expect(100 * a).toBeLessThan(target * (t + r.missable! + 1));
          }
        }
  });
  it.each([
    { attended: 2, total: 1, target: 75 },
    { attended: -1, total: 10, target: 75 },
    { attended: 1.5, total: 10, target: 75 },
    { attended: 1, total: 10, target: 100.01 },
    { attended: 1, total: 10, target: 75.001 },
    { attended: 1, total: 10, target: 75, remaining: -1 },
  ])("rejects invalid attendance inputs", (input) =>
    expect(() => attendance(input)).toThrow(),
  );
});

describe("configurable grade points", () => {
  it("weights credits on a selected scale", () => {
    expect(
      sgpa(
        [
          { credits: 4, points: 9 },
          { credits: 3, points: 8 },
          { credits: 2, points: 7 },
        ],
        10,
      ).average,
    ).toBeCloseTo(74 / 9);
    expect(
      sgpa(
        [
          { credits: 3, points: 4 },
          { credits: 3, points: 3 },
        ],
        4,
      ).average,
    ).toBe(3.5);
    const map = [
      { label: "A", points: 8 },
      { label: "B", points: 6 },
    ];
    expect(
      sgpa(
        [
          { credits: 3, points: pointsForGrade(" a ", map, 10) },
          { credits: 1, points: pointsForGrade("B", map, 10) },
        ],
        10,
      ).average,
    ).toBe(7.5);
  });
  it("counts zero points but excludes only explicitly excluded courses", () => {
    expect(
      sgpa(
        [
          { credits: 4, points: 8 },
          { credits: 4, points: 0 },
        ],
        10,
      ).average,
    ).toBe(4);
    expect(
      sgpa(
        [
          { credits: 4, points: 8 },
          { credits: 0, points: 0, included: false },
        ],
        10,
      ).average,
    ).toBe(8);
    expect(() => sgpa([{ credits: 0, points: 0 }], 10)).toThrow();
    expect(() =>
      sgpa([{ credits: 4, points: 8, included: false }], 10),
    ).toThrow();
  });
  it.each(
    [
      [{ label: "", points: 1 }],
      [{ label: "  ", points: 1 }],
      [
        { label: "A", points: 1 },
        { label: "A", points: 2 },
      ],
      [
        { label: "A", points: 1 },
        { label: "a", points: 2 },
      ],
      [
        { label: "Ａ", points: 1 },
        { label: "a", points: 2 },
      ],
      [{ label: "A", points: NaN }],
      [{ label: "A", points: Infinity }],
      [{ label: "A", points: -1 }],
      [{ label: "A", points: 11 }],
    ].map((mapping) => ({ mapping })),
  )("rejects invalid grade mappings", ({ mapping }) =>
    expect(() => validateGradeMapping(mapping, 10)).toThrow(),
  );
  it("rejects unknown labels and invalid included values", () => {
    expect(() => pointsForGrade("C", [{ label: "A", points: 4 }], 4)).toThrow();
    expect(() => sgpa([{ credits: 2, points: 5 }], 4)).toThrow();
    expect(() => sgpa([{ credits: Infinity, points: 2 }], 4)).toThrow();
  });
  it("requires semester weights unless equal weighting is explicitly chosen", () => {
    expect(() => cgpa([{ sgpa: 8 }, { sgpa: 9 }], 10, "credits")).toThrow(
      "semester 1",
    );
    expect(() => cgpa([{ sgpa: 8, weight: 0 }], 10, "custom")).toThrow();
    expect(() => cgpa([{ sgpa: 8 }], 10, "" as "credits")).toThrow("Choose");
    expect(cgpa([{ sgpa: 8 }, { sgpa: 9 }], 10, "equal")).toMatchObject({
      average: 8.5,
      method: "equal",
    });
    const r = cgpa(
      [
        { sgpa: 8, weight: 20 },
        { sgpa: 9, weight: 24 },
      ],
      10,
      "credits",
    );
    expect(r.average).toBeCloseTo(376 / 44);
    expect(r.weighting).toBe("Semester credits");
    expect(
      cgpa(
        [
          { sgpa: 8, weight: 1 },
          { sgpa: 9, weight: 3 },
        ],
        10,
        "custom",
      ).average,
    ).toBe(8.75);
  });
});

describe("subject marks", () => {
  it("divides totals, not the average of percentages", () => {
    expect(
      marks([
        { obtained: 80, maximum: 100 },
        { obtained: 45, maximum: 50 },
      ]),
    ).toMatchObject({ obtained: 125, maximum: 150 });
    expect(
      marks([
        { obtained: 80, maximum: 100 },
        { obtained: 45, maximum: 50 },
      ]).percentage,
    ).toBeCloseTo(83.3333333333);
  });
  it.each([0, 75, 100])(
    "supports boundary scores without invented grades",
    (obtained) =>
      expect(marks([{ obtained, maximum: 100 }])).toMatchObject({
        percentage: obtained,
        grade: null,
      }),
  );
  it("applies only supplied grade thresholds", () => {
    const thresholds = [
      { label: "A", minimum: 90 },
      { label: "B", minimum: 75 },
      { label: "C", minimum: 0 },
    ];
    expect(marks([{ obtained: 80, maximum: 100 }], thresholds).grade).toBe("B");
    expect(marks([{ obtained: 75, maximum: 100 }], thresholds).grade).toBe("B");
    expect(marks([{ obtained: 74.99, maximum: 100 }], thresholds).grade).toBe(
      "C",
    );
    expect(() =>
      marks([{ obtained: 80, maximum: 100 }], thresholds.slice(0, 2)),
    ).toThrow("0%");
    expect(() =>
      marks(
        [{ obtained: 80, maximum: 100 }],
        [...thresholds, { label: "D", minimum: 0 }],
      ),
    ).toThrow("different minimum");
  });
  it.each(
    [
      [{ obtained: 1, maximum: 0 }],
      [{ obtained: 101, maximum: 100 }],
      [{ obtained: -1, maximum: 100 }],
      [],
    ].map((rows) => ({ rows })),
  )("rejects invalid subject rows", ({ rows }) =>
    expect(() => marks(rows)).toThrow(),
  );
});

describe("required assessment score", () => {
  it("reports unsupported extreme precision instead of displaying NaN", () =>
    expect(() => required({ current: 65, weight: 1e-308, target: 70 })).toThrow(
      "precision",
    ));
  it("shows percentage and raw marks", () =>
    expect(
      required({ current: 65, weight: 40, target: 70, maximum: 80 }),
    ).toMatchObject({
      required: 77.5,
      rawMarks: 62,
      minimumMarks: 62,
      resultingOverall: 70,
      status: "possible",
    }));
  it("identifies impossible and secured targets", () => {
    expect(required({ current: 50, weight: 40, target: 90 })).toMatchObject({
      required: 150,
      status: "impossible",
    });
    expect(required({ current: 90, weight: 20, target: 60 })).toMatchObject({
      required: 0,
      contribution: 72,
      status: "secured",
    });
  });
  it("rounds marks up without rounding intermediate percentages", () =>
    expect(
      required({ current: 64, weight: 40, target: 70, maximum: 75 }),
    ).toMatchObject({
      rawMarks: 59.25,
      minimumMarks: 60,
      resultingOverall: 70.4,
    }));
  it("does not add an extra scoring increment at exact boundaries", () => {
    expect(
      required({ weight: 100, target: 30, maximum: 1, step: 0.1 }).minimumMarks,
    ).toBe(0.3);
    expect(
      required({ weight: 100, target: 100, maximum: 75, step: 2 }).status,
    ).toBe("impossible");
  });
  it("handles zero and full remaining weight", () => {
    expect(required({ current: 70, weight: 0, target: 70 }).status).toBe(
      "secured",
    );
    expect(required({ current: 60, weight: 0, target: 70 }).status).toBe(
      "impossible",
    );
    expect(required({ weight: 100, target: 70 }).required).toBe(70);
  });
  it.each([
    { current: 50, weight: 101, target: 70 },
    { current: 50, weight: 40, target: 101 },
    { weight: 50, target: 70 },
    { current: 50, weight: 40, target: 70, maximum: 0 },
    { current: 50, weight: 40, target: 70, maximum: 80, step: 0 },
  ])("rejects invalid configurations", (input) =>
    expect(() => required(input)).toThrow(),
  );
});

describe("strict numeric parsing", () => {
  it.each(["", " ", "12abc", "Infinity", "NaN", "1e309"])(
    "rejects %j rather than silently treating it as a number",
    (text) => expect(() => numberInput(text, "Value")).toThrow(),
  );
  it("accepts zero and decimals", () => {
    expect(numberInput("0", "Value")).toBe(0);
    expect(numberInput(" 12.5 ", "Value")).toBe(12.5);
  });
});
