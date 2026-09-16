/** Pure, browser-independent mathematics. No institution-specific rules. */
export function finite(
  value: number,
  label: string,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
): number {
  if (!Number.isFinite(value) || value < min || value > max)
    throw new Error(`${label} must be a finite number from ${min} to ${max}.`);
  return value;
}

export function numberInput(
  value: string,
  label: string,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
): number {
  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(value.trim()))
    throw new Error(
      `Enter a valid ${label.toLowerCase()}; do not leave it blank.`,
    );
  return finite(Number(value), label, min, max);
}

export function formatNumber(value: number, digits = 4): string {
  return new Intl.NumberFormat("en", { maximumFractionDigits: digits }).format(
    value,
  );
}

function count(value: number, label: string) {
  finite(value, label, 0, 1_000_000_000);
  if (!Number.isInteger(value))
    throw new Error(`${label} must be a whole number of classes.`);
}

export function calculateAttendance(input: {
  attended: number;
  total: number;
  target: number;
  remaining?: number;
}) {
  const { attended: a, total: t, target, remaining } = input;
  count(a, "Attended classes");
  count(t, "Conducted classes");
  finite(target, "Target percentage", 0, 100);
  if (Number(target.toFixed(2)) !== target)
    throw new Error(
      "Use at most two decimal places for the target percentage.",
    );
  if (a > t)
    throw new Error("Attended classes cannot exceed conducted classes.");
  if (remaining !== undefined) count(remaining, "Remaining classes");
  // Integer basis points prevent a rounded display or floating error changing ceil/floor decisions.
  const p = BigInt(Math.round(target * 100));
  const attended = BigInt(a);
  const total = BigInt(t);
  const hundred = 10000n;
  const met = t > 0 && hundred * attended >= p * total;
  let catchUp: number | null;
  if (p === 0n) catchUp = 0;
  else if (t === 0) catchUp = 1;
  else if (met) catchUp = 0;
  else if (p === hundred) catchUp = null;
  else {
    const numerator = p * total - hundred * attended;
    const denominator = hundred - p;
    catchUp = Number((numerator + denominator - 1n) / denominator);
  }
  const missable =
    p === 0n ? null : !met ? 0 : Number((hundred * attended - p * total) / p);
  const maximumFinal =
    remaining === undefined || t + remaining === 0
      ? null
      : (100 * (a + remaining)) / (t + remaining);
  const reachable =
    catchUp !== null && (remaining === undefined || catchUp <= remaining);
  return {
    current: t === 0 ? null : (100 * a) / t,
    catchUp,
    missable,
    maximumFinal,
    reachable,
    met,
    ...input,
  };
}

export interface GradeMapping {
  label: string;
  points: number;
}
export function validateGradeMapping(
  mapping: GradeMapping[],
  scale: number,
): GradeMapping[] {
  finite(scale, "Scale maximum", Number.MIN_VALUE);
  if (!mapping.length)
    throw new Error("Add at least one grade label and its point value.");
  const seen = new Set<string>();
  return mapping.map((row) => {
    const label = row.label.trim().normalize("NFKC");
    if (!label) throw new Error("Grade labels cannot be empty.");
    const key = label.toLocaleLowerCase("en");
    if (seen.has(key))
      throw new Error(
        `Duplicate grade label: ${label}. Labels are case-insensitive.`,
      );
    seen.add(key);
    finite(row.points, `Points for ${label}`, 0, scale);
    return { label, points: row.points };
  });
}
export function pointsForGrade(
  label: string,
  mapping: GradeMapping[],
  scale: number,
): number {
  const rows = validateGradeMapping(mapping, scale);
  const row = rows.find(
    (row) =>
      row.label.toLocaleLowerCase("en") ===
      label.trim().normalize("NFKC").toLocaleLowerCase("en"),
  );
  if (!row)
    throw new Error(`Choose a mapped grade for ${label || "this course"}.`);
  return row.points;
}

export interface Course {
  credits: number;
  points: number;
  included?: boolean;
}
export function calculateSgpa(courses: Course[], scale: number) {
  finite(scale, "Scale maximum", Number.MIN_VALUE);
  const included = courses.filter((row) => row.included !== false);
  if (!included.length)
    throw new Error("Include at least one course with positive credits.");
  const contributions = included.map((row, i) => {
    finite(
      row.credits,
      `Credits for included course ${i + 1}`,
      Number.MIN_VALUE,
    );
    finite(row.points, `Grade points for included course ${i + 1}`, 0, scale);
    return finite(row.credits * row.points, "Weighted grade points");
  });
  const credits = finite(
    included.reduce((sum, row) => sum + row.credits, 0),
    "Total credits",
    Number.MIN_VALUE,
  );
  const points = finite(
    contributions.reduce((sum, item) => sum + item, 0),
    "Total weighted points",
  );
  return {
    average: points / credits,
    credits,
    points,
    contributions,
    included,
    excluded: courses.length - included.length,
  };
}

export type SemesterWeighting = "credits" | "custom" | "equal";
export const WEIGHTING_LABELS: Record<SemesterWeighting, string> = {
  credits: "Semester credits",
  custom: "Custom institutional weights",
  equal: "Equal semester weighting (explicitly selected)",
};
export function calculateCgpaSemesters(
  semesters: { sgpa: number; weight?: number }[],
  scale: number,
  method: SemesterWeighting,
) {
  if (!Object.hasOwn(WEIGHTING_LABELS, method))
    throw new Error("Choose how semesters should be weighted.");
  if (!semesters.length) throw new Error("Add at least one semester.");
  const rows = semesters.map((row, i) => {
    finite(row.sgpa, `SGPA for semester ${i + 1}`, 0, scale);
    if (method !== "equal" && row.weight === undefined)
      throw new Error(`Enter credits or weight for semester ${i + 1}.`);
    return { points: row.sgpa, credits: method === "equal" ? 1 : row.weight! };
  });
  return {
    ...calculateSgpa(rows, scale),
    method,
    weighting: WEIGHTING_LABELS[method],
  };
}

export interface GradeThreshold {
  label: string;
  minimum: number;
}
export function calculateMarks(
  subjects: { obtained: number; maximum: number }[],
  thresholds: GradeThreshold[] = [],
) {
  if (!subjects.length) throw new Error("Add at least one subject.");
  subjects.forEach((row, i) => {
    finite(row.maximum, `Maximum marks for subject ${i + 1}`, Number.MIN_VALUE);
    finite(row.obtained, `Obtained marks for subject ${i + 1}`, 0, row.maximum);
  });
  const obtained = finite(
    subjects.reduce((sum, row) => sum + row.obtained, 0),
    "Total obtained marks",
  );
  const maximum = finite(
    subjects.reduce((sum, row) => sum + row.maximum, 0),
    "Total maximum marks",
    Number.MIN_VALUE,
  );
  const percentage = (obtained / maximum) * 100;
  let grade: string | null = null;
  if (thresholds.length) {
    validateGradeMapping(
      thresholds.map((row) => ({ label: row.label, points: row.minimum })),
      100,
    );
    const sorted = [...thresholds].sort((a, b) => b.minimum - a.minimum);
    if (new Set(sorted.map((row) => row.minimum)).size !== sorted.length)
      throw new Error(
        "Each grade threshold must have a different minimum percentage.",
      );
    if (sorted.at(-1)!.minimum !== 0)
      throw new Error(
        "Include a minimum threshold of 0% so every percentage has a grade.",
      );
    // Compare entered decimal marks exactly: 29/50 must meet 58%, while
    // a genuinely lower score must not pass because of an epsilon tolerance.
    const exactObtained = subjects.reduce<Fraction>(
      (sum, row) => add(sum, fraction(row.obtained)),
      [0n, 1n],
    );
    const exactMaximum = subjects.reduce<Fraction>(
      (sum, row) => add(sum, fraction(row.maximum)),
      [0n, 1n],
    );
    const exactPercentage = multiply(divide(exactObtained, exactMaximum), [
      100n,
      1n,
    ]);
    grade = sorted
      .find((row) => {
        const threshold = fraction(row.minimum);
        return (
          exactPercentage[0] * threshold[1] >= threshold[0] * exactPercentage[1]
        );
      })!
      .label.trim();
  }
  return { obtained, maximum, percentage, grade };
}

// Rational operations keep exact boundaries when converting a target into whole/half marks.
type Fraction = [bigint, bigint];
function fraction(value: number): Fraction {
  const [mantissa, exponent = "0"] = value.toString().toLowerCase().split("e");
  const decimals = (mantissa.split(".")[1] ?? "").length - Number(exponent);
  const numerator = BigInt(mantissa.replace(".", ""));
  return decimals >= 0
    ? [numerator, 10n ** BigInt(decimals)]
    : [numerator * 10n ** BigInt(-decimals), 1n];
}
function subtract([a, b]: Fraction, [c, d]: Fraction): Fraction {
  return [a * d - c * b, b * d];
}
function add([a, b]: Fraction, [c, d]: Fraction): Fraction {
  return [a * d + c * b, b * d];
}
function multiply([a, b]: Fraction, [c, d]: Fraction): Fraction {
  return [a * c, b * d];
}
function divide([a, b]: Fraction, [c, d]: Fraction): Fraction {
  return [a * d, b * c];
}
const asNumber = ([a, b]: Fraction) => {
  const numerator = Number(a);
  const denominator = Number(b);
  const value = numerator / denominator;
  if (
    !Number.isFinite(numerator) ||
    !Number.isFinite(denominator) ||
    !Number.isFinite(value) ||
    (a !== 0n && value === 0)
  )
    throw new Error(
      "The calculation exceeds supported numeric precision. Use less extreme values.",
    );
  return value;
};

export function calculateRequiredMarks(input: {
  current?: number;
  weight: number;
  target: number;
  maximum?: number;
  step?: number;
}) {
  const { current, weight, target, maximum, step = 1 } = input;
  finite(weight, "Remaining assessment weight", 0, 100);
  finite(target, "Target percentage", 0, 100);
  if (weight !== 100) {
    if (current === undefined)
      throw new Error("Enter the completed-work average.");
    finite(current, "Completed-work average", 0, 100);
  }
  if (maximum !== undefined) {
    finite(maximum, "Assessment maximum", Number.MIN_VALUE);
    finite(step, "Mark increment", Number.MIN_VALUE, maximum);
  }
  const contribution = (1 - weight / 100) * (current ?? 0);
  if (weight === 0)
    return {
      required: null,
      rawMarks: null,
      minimumMarks: null,
      resultingOverall: current!,
      contribution,
      status:
        current! >= target ? ("secured" as const) : ("impossible" as const),
      ...input,
    };
  const w = divide(fraction(weight), [100n, 1n]);
  const earned = multiply(subtract([1n, 1n], w), fraction(current ?? 0));
  const requiredFraction = divide(subtract(fraction(target), earned), w);
  const required = asNumber(requiredFraction);
  let status: "secured" | "possible" | "impossible" =
    requiredFraction[0] <= 0n
      ? "secured"
      : requiredFraction[0] > 100n * requiredFraction[1]
        ? "impossible"
        : "possible";
  let rawMarks: number | null = null;
  let minimumMarks: number | null = null;
  let resultingOverall: number | null = null;
  if (maximum !== undefined && status !== "impossible") {
    const raw =
      status === "secured"
        ? ([0n, 1n] as Fraction)
        : multiply(divide(requiredFraction, [100n, 1n]), fraction(maximum));
    rawMarks = asNumber(raw);
    const increments = divide(raw, fraction(step));
    const rounded = multiply(
      [(increments[0] + increments[1] - 1n) / increments[1], 1n],
      fraction(step),
    );
    minimumMarks = asNumber(rounded);
    if (minimumMarks > maximum) status = "impossible";
    else
      resultingOverall = asNumber(earned) + (minimumMarks / maximum) * weight;
  }
  return {
    required: Math.max(0, required),
    rawMarks,
    minimumMarks,
    resultingOverall,
    contribution: asNumber(earned),
    status,
    ...input,
  };
}
