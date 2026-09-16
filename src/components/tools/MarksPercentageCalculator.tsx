import { useState } from "react";
import {
  calculateMarks,
  formatNumber as f,
  numberInput,
} from "../../helpers/student-calculators";
import CalculationResult, {
  CalculatorForm,
  NumberField,
  inputClass,
} from "./shared/CalculationResult";

export default function MarksPercentageCalculator() {
  const [rows, setRows] = useState([{ obtained: "", maximum: "" }]);
  const [useGrades, setUseGrades] = useState(false);
  const [thresholds, setThresholds] = useState([{ label: "", minimum: "" }]);
  const [result, setResult] = useState<ReturnType<
    typeof calculateMarks
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
            setResult(
              calculateMarks(
                rows.map((row, i) => ({
                  obtained: numberInput(
                    row.obtained,
                    `Obtained marks for subject ${i + 1}`,
                  ),
                  maximum: numberInput(
                    row.maximum,
                    `Maximum marks for subject ${i + 1}`,
                  ),
                })),
                useGrades
                  ? thresholds.map((row) => ({
                      label: row.label,
                      minimum: numberInput(row.minimum, "Minimum percentage"),
                    }))
                  : [],
              ),
            );
          } catch (err) {
            setError((err as Error).message);
          }
        }}
      >
        <p className="text-sm text-body">
          Add each subject's obtained and maximum marks. The total uses marks,
          so subjects with different maxima are weighted correctly.
        </p>
        {rows.map((row, i) => (
          <fieldset
            key={i}
            className="min-w-0 rounded-lg border border-hairline p-4"
          >
            <legend className="px-2 text-sm font-semibold">
              Subject {i + 1}
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField
                id={`marks-obtained-${i}`}
                label={`Obtained marks — subject ${i + 1}`}
                value={row.obtained}
                onChange={(obtained) =>
                  setRows(
                    rows.map((r, j) => (i === j ? { ...r, obtained } : r)),
                  )
                }
              />
              <NumberField
                id={`marks-maximum-${i}`}
                label={`Maximum marks — subject ${i + 1}`}
                value={row.maximum}
                onChange={(maximum) =>
                  setRows(rows.map((r, j) => (i === j ? { ...r, maximum } : r)))
                }
              />
            </div>
            <button
              type="button"
              className="mt-3 text-sm text-link underline disabled:opacity-40"
              disabled={rows.length === 1}
              onClick={() => {
                setRows(rows.filter((_, j) => i !== j));
                clear();
              }}
            >
              Remove subject {i + 1}
            </button>
          </fieldset>
        ))}
        <button
          type="button"
          className="btn-secondary"
          disabled={rows.length >= 100}
          onClick={() => {
            setRows([...rows, { obtained: "", maximum: "" }]);
            clear();
          }}
        >
          Add subject
        </button>
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={useGrades}
            onChange={(e) => setUseGrades(e.target.checked)}
            className="mt-1"
          />
          Apply my own percentage-to-grade thresholds
        </label>
        {useGrades && (
          <fieldset className="space-y-4 rounded-lg border border-hairline p-4">
            <legend className="px-2 font-semibold">
              Your grade thresholds
            </legend>
            <p className="text-sm text-body">
              Enter unique labels and minimum percentages. Include a 0% minimum.
              The highest threshold met wins; no university grade system is
              supplied.
            </p>
            {thresholds.map((row, i) => (
              <div key={i} className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor={`threshold-label-${i}`}
                    className="mb-2 block text-sm"
                  >
                    Grade label {i + 1}
                  </label>
                  <input
                    id={`threshold-label-${i}`}
                    className={inputClass}
                    value={row.label}
                    maxLength={40}
                    onChange={(e) =>
                      setThresholds(
                        thresholds.map((r, j) =>
                          i === j ? { ...r, label: e.target.value } : r,
                        ),
                      )
                    }
                  />
                </div>
                <NumberField
                  id={`threshold-min-${i}`}
                  label={`Minimum percentage — grade ${i + 1}`}
                  value={row.minimum}
                  onChange={(minimum) =>
                    setThresholds(
                      thresholds.map((r, j) =>
                        i === j ? { ...r, minimum } : r,
                      ),
                    )
                  }
                />
                <button
                  type="button"
                  className="text-left text-sm text-link underline disabled:opacity-40"
                  disabled={thresholds.length === 1}
                  onClick={() => {
                    setThresholds(thresholds.filter((_, j) => i !== j));
                    clear();
                  }}
                >
                  Remove grade {i + 1}
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn-secondary"
              disabled={thresholds.length >= 30}
              onClick={() => {
                setThresholds([...thresholds, { label: "", minimum: "" }]);
                clear();
              }}
            >
              Add grade threshold
            </button>
          </fieldset>
        )}
        <div className="flex flex-wrap gap-3">
          <button type="submit" className="btn-primary">
            Calculate percentage
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setRows([
                { obtained: "80", maximum: "100" },
                { obtained: "45", maximum: "50" },
              ]);
              setUseGrades(false);
              clear();
            }}
          >
            Load example
          </button>
        </div>
      </CalculatorForm>
      {result && (
        <CalculationResult
          label="Marks percentage"
          value={`${result.percentage.toFixed(2)}%`}
          lines={[
            ...rows.map(
              (row, i) =>
                `Subject ${i + 1}: ${row.obtained} / ${row.maximum} marks.`,
            ),
            `Percentage = Σ(obtained marks) ÷ Σ(maximum marks) × 100 = ${f(result.obtained)} ÷ ${f(result.maximum)} × 100 = ${f(result.percentage, 8)}%.`,
            ...(result.grade
              ? [
                  `Grade under your thresholds: ${result.grade}. Thresholds: ${thresholds.map((row) => `${row.label} ≥ ${row.minimum}%`).join("; ")}.`,
                ]
              : []),
          ]}
          notes={[
            "This is a marks-weighted percentage, not an average of subject percentages or a GPA conversion.",
            "A grade appears only when you supply thresholds. Subject pass requirements and institutional classifications are not inferred.",
          ]}
        />
      )}
    </>
  );
}
