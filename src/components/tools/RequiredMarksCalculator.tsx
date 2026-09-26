import { useState } from "react";
import {
  calculateRequiredMarks,
  formatNumber as f,
  numberInput,
} from "../../helpers/student-calculators";
import CalculationResult, {
  CalculatorForm,
  NumberField,
} from "./shared/CalculationResult";

export default function RequiredMarksCalculator() {
  const [current, setCurrent] = useState("");
  const [weight, setWeight] = useState("");
  const [target, setTarget] = useState("");
  const [maximum, setMaximum] = useState("");
  const [step, setStep] = useState("1");
  const [result, setResult] = useState<ReturnType<
    typeof calculateRequiredMarks
  > | null>(null);
  const [error, setError] = useState("");
  function clear() {
    setResult(null);
    setError("");
  }
  return (
    <>
      <CalculatorForm
        error={error}
        onEdit={clear}
        onSubmit={(e) => {
          e.preventDefault();
          clear();
          try {
            const w = numberInput(
              weight,
              "Remaining assessment weight",
              0,
              100,
            );
            setResult(
              calculateRequiredMarks({
                current:
                  w === 100
                    ? undefined
                    : numberInput(current, "Completed-work average", 0, 100),
                weight: w,
                target: numberInput(target, "Target percentage", 0, 100),
                maximum: maximum.trim()
                  ? numberInput(maximum, "Assessment maximum")
                  : undefined,
                step: maximum.trim()
                  ? numberInput(step, "Mark increment")
                  : undefined,
              }),
            );
          } catch (err) {
            setError((err as Error).message);
          }
        }}
      >
        <p className="text-sm leading-relaxed text-body">
          Use the average percentage for completed work and the weight of one
          remaining assessment (or a combined remaining component). Weights use
          percentages of the overall grade.
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          <NumberField
            id="required-current"
            label="Completed-work average (%)"
            value={current}
            onChange={setCurrent}
            disabled={weight.trim() !== "" && Number(weight) === 100}
            hint="Average of the completed portion, not points already contributed to the final grade."
          />
          <NumberField
            id="required-weight"
            label="Remaining assessment weight (%)"
            value={weight}
            onChange={setWeight}
            hint="0 to 100. Completed work has the remaining weight."
          />
          <NumberField
            id="required-target"
            label="Target overall percentage (%)"
            value={target}
            onChange={setTarget}
          />
          <NumberField
            id="required-maximum"
            required={false}
            label="Assessment maximum marks (optional)"
            value={maximum}
            onChange={setMaximum}
            hint="Leave blank for a required percentage only."
          />
          {maximum.trim() && (
            <NumberField
              id="required-step"
              label="Allowed mark increment"
              value={step}
              onChange={setStep}
              hint="For example 1 for whole marks or 0.5 for half marks. Minimum marks round upward from zero in this increment."
            />
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="submit" className="btn-primary">
            Calculate required marks
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setCurrent("65");
              setWeight("40");
              setTarget("70");
              setMaximum("80");
              setStep("1");
              clear();
            }}
          >
            Load example
          </button>
        </div>
      </CalculatorForm>
      {result && (
        <CalculationResult
          label={
            result.status === "secured"
              ? "Target already secured"
              : "Required on remaining assessment"
          }
          value={
            result.weight === 0
              ? result.status === "secured"
                ? "No additional marks needed"
                : "Impossible at 0% remaining weight"
              : result.status === "impossible"
                ? "Target not achievable"
                : result.minimumMarks !== null
                  ? `${f(result.minimumMarks, 8)} / ${f(result.maximum!)} marks`
                  : `${f(result.required!, 8)}%`
          }
          impossible={result.status === "impossible"}
          lines={[
            `Completed contribution = completed average × (1 − remaining weight / 100) = ${f(result.current ?? 0)} × (1 − ${f(result.weight)} / 100) = ${f(result.contribution, 8)} percentage points.`,
            ...(result.weight === 0
              ? [
                  `Remaining weight is 0%, so the overall result stays ${f(result.resultingOverall!)}%. Compare this with the ${f(result.target)}% target.`,
                ]
              : [
                  `Required percentage = (target − completed contribution) ÷ (remaining weight / 100) = (${f(result.target)} − ${f(result.contribution, 8)}) ÷ (${f(result.weight)} / 100) = ${f(result.required!, 8)}%${result.status === "secured" ? " after clamping a non-positive requirement to zero" : ""}.`,
                  ...(result.rawMarks !== null
                    ? [
                        `Raw required marks = required percentage × maximum marks / 100 = ${f(result.rawMarks, 8)}.`,
                        `Minimum marks = ceil(raw marks ÷ increment) × increment = ceil(${f(result.rawMarks, 8)} ÷ ${f(result.step ?? 1, 8)}) × ${f(result.step ?? 1, 8)} = ${f(result.minimumMarks!, 8)}.`,
                        result.resultingOverall === null
                          ? `The next allowed increment exceeds the assessment maximum of ${f(result.maximum!)}.`
                          : `Overall percentage at this mark = ${f(result.resultingOverall, 8)}%.`,
                      ]
                    : []),
                  ...(result.required! > 100
                    ? [
                        "The calculated requirement exceeds 100%; the target is impossible with this remaining weight.",
                      ]
                    : []),
                ]),
          ]}
          notes={[
            "This models a weighted average. It does not infer exam-specific pass marks, extra credit, moderation or university rules.",
            "If the remaining weight is 100%, the completed average is unused. Rounding the display never rounds down the required mark increment.",
          ]}
        />
      )}
    </>
  );
}
