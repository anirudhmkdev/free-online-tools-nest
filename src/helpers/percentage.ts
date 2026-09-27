export type PercentageMode = "of" | "is" | "change";
export function calculatePercentage(mode: PercentageMode, first: string, second: string) {
  const a = Number(first), b = Number(second);
  if (!first.trim() || !second.trim() || !Number.isFinite(a) || !Number.isFinite(b)) throw new Error("Enter two finite numbers.");
  if ((mode === "is" && b === 0) || (mode === "change" && a === 0)) throw new Error("This calculation is undefined because its denominator is zero.");
  const value = mode === "of" ? a / 100 * b : mode === "is" ? a / b * 100 : (b - a) / Math.abs(a) * 100;
  if (!Number.isFinite(value)) throw new Error("The result is outside the supported numeric range.");
  const formula = mode === "of" ? `${a} ÷ 100 × ${b}` : mode === "is" ? `${a} ÷ ${b} × 100` : `(${b} − ${a}) ÷ |${a}| × 100`;
  return { value, formula };
}
