import { useState } from "react";
import {
  calculateAttendance,
  formatNumber as f,
  numberInput,
} from "../../helpers/student-calculators";
import CalculationResult, {
  CalculatorForm,
  NumberField,
} from "./shared/CalculationResult";

export default function AttendanceCalculator() {
  const [attended, setAttended] = useState("");
  const [total, setTotal] = useState("");
  const [target, setTarget] = useState("");
  const [remaining, setRemaining] = useState("");
  const [result, setResult] = useState<ReturnType<
    typeof calculateAttendance
  > | null>(null);
  const [error, setError] = useState("");
  function clearResult() {
    setResult(null);
    setError("");
  }
  return (
    <div>
      <CalculatorForm
        error={error}
        onEdit={clearResult}
        onSubmit={(e) => {
          e.preventDefault();
          clearResult();
          try {
            setResult(
              calculateAttendance({
                attended: numberInput(attended, "Attended classes"),
                total: numberInput(total, "Conducted classes"),
                target: numberInput(target, "Target percentage"),
                remaining: remaining.trim()
                  ? numberInput(remaining, "Remaining classes")
                  : undefined,
              }),
            );
          } catch (err) {
            setError((err as Error).message);
          }
        }}
      >
        <p className="text-sm leading-relaxed text-body">
          Enter the attendance target that applies to you. This is a class-count
          calculation, not a statement of your institution’s eligibility rules.
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          <NumberField
            id="attendance-attended"
            step={1}
            max={1_000_000_000}
            label="Attended classes"
            value={attended}
            onChange={setAttended}
            hint="Count completed classes you attended."
          />
          <NumberField
            id="attendance-total"
            step={1}
            max={1_000_000_000}
            label="Conducted classes"
            value={total}
            onChange={setTotal}
            hint="Include attended and missed classes."
          />
          <NumberField
            id="attendance-target"
            step={0.01}
            max={100}
            label="Target attendance (%)"
            value={target}
            onChange={setTarget}
            hint="Required: 0–100%, up to two decimal places."
          />
          <NumberField
            id="attendance-remaining"
            required={false}
            step={1}
            max={1_000_000_000}
            label="Remaining classes (optional)"
            value={remaining}
            onChange={setRemaining}
            hint="Use a known schedule to check whether your target is still possible."
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="btn-primary" type="submit">
            Calculate attendance
          </button>
          <button
            className="btn-secondary"
            type="button"
            onClick={() => {
              setAttended("30");
              setTotal("50");
              setTarget("75");
              setRemaining("");
              clearResult();
            }}
          >
            Load example
          </button>
        </div>
      </CalculatorForm>
      {result && (
        <CalculationResult
          label="Current attendance"
          value={
            result.current === null
              ? "Not established yet"
              : f(result.current) + "%"
          }
          impossible={!result.reachable}
          lines={[
            result.current === null
              ? "No classes have been conducted, so A ÷ T is undefined; current attendance is not 0%."
              : `Current = attended ÷ conducted × 100 = ${result.attended} ÷ ${result.total} × 100 = ${f(result.current)}%.`,
            result.target === 0
              ? "Target = 0%: no catch-up is needed (0 classes)."
              : result.total === 0
                ? "With no conducted classes and a positive target, one attended class establishes 1 ÷ 1 × 100 = 100%."
                : result.target === 100
                  ? result.catchUp === null
                    ? "Exact 100% cannot be reached in finitely many future classes after an absence: (A + x) remains smaller than (T + x)."
                    : "A = T, so attendance is already exactly 100%; catch-up = 0 classes."
                  : `Catch-up = max(0, ceil((target × conducted − attended) ÷ (1 − target))), with target as a fraction: max(0, ceil((${result.target / 100} × ${result.total} − ${result.attended}) ÷ (1 − ${result.target / 100}))) = ${f(result.catchUp!)} consecutive attended classes.`,
            result.missable === null
              ? "A zero target has no mathematical absence constraint. This does not imply permission to miss classes."
              : !result.met
                ? "Additional classes you can miss while meeting the target now: 0. Reach the target first."
                : `Missable = floor(attended ÷ target − conducted) = floor(${result.attended} ÷ ${result.target / 100} − ${result.total}) = ${f(result.missable)} additional classes.`,
            ...(result.remaining === undefined
              ? []
              : [
                  result.maximumFinal === null
                    ? "With zero past and zero remaining classes, there is no final percentage to calculate."
                    : `Attend all ${result.remaining} remaining classes: (${result.attended} + ${result.remaining}) ÷ (${result.total} + ${result.remaining}) × 100 = ${f(result.maximumFinal)}% maximum final attendance.`,
                ]),
          ]}
          notes={[
            "Decisions use the exact class counts and entered target, not the rounded percentage shown above.",
            "Catch-up assumes every additional class is attended. Excused absences, hours, subject-specific rules and institutional rounding are not inferred.",
          ]}
        />
      )}
    </div>
  );
}
