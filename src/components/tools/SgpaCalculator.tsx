import { useState } from "react";
import {
  calculateSgpa,
  formatNumber as f,
} from "../../helpers/student-calculators";
import CalculationResult, {
  CalculatorForm,
  inputClass,
} from "./shared/CalculationResult";
import GradeScaleEditor, {
  CourseEditor,
  emptyCourse,
  emptyGradeConfig,
  readCourses,
} from "./shared/GradeScaleEditor";

export default function SgpaCalculator({
  resultName = "SGPA",
}: {
  resultName?: "SGPA" | "CGPA";
}) {
  const [config, setConfig] = useState(emptyGradeConfig);
  const [rows, setRows] = useState([emptyCourse(), emptyCourse()]);
  const [digits, setDigits] = useState(2);
  const [error, setError] = useState("");
  const [result, setResult] = useState<
    (ReturnType<typeof calculateSgpa> & { scale: number }) | null
  >(null);
  function clear() {
    setResult(null);
    setError("");
  }
  return (
    <div>
      <CalculatorForm
        error={error}
        onEdit={clear}
        onSubmit={(e) => {
          e.preventDefault();
          clear();
          try {
            const { courses, scale } = readCourses(rows, config);
            setResult({ ...calculateSgpa(courses, scale), scale });
          } catch (err) {
            setError((err as Error).message);
          }
        }}
      >
        <GradeScaleEditor
          config={config}
          onChange={(next) => {
            setConfig(next);
            clear();
          }}
        />
        <CourseEditor
          config={config}
          rows={rows}
          onChange={(next) => {
            setRows(next);
            clear();
          }}
        />
        <div>
          <label htmlFor="gpa-precision" className="mb-2 block text-sm">
            Display decimal places
          </label>
          <select
            id="gpa-precision"
            className={inputClass + " sm:max-w-40"}
            value={digits}
            onChange={(e) => setDigits(Number(e.target.value))}
          >
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="submit" className="btn-primary">
            Calculate {resultName}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setConfig({
                maximum: "10",
                mode: "points",
                mapping: [{ label: "", points: "" }],
              });
              setRows([
                { credits: "4", grade: "9", included: true },
                { credits: "3", grade: "8", included: true },
                { credits: "2", grade: "7", included: true },
              ]);
              clear();
            }}
          >
            Load example
          </button>
        </div>
      </CalculatorForm>
      {result && (
        <CalculationResult
          label={`${resultName} · course-credit weighting · scale maximum ${f(result.scale)}`}
          value={result.average.toFixed(digits)}
          lines={[
            ...result.included.map(
              (row, i) =>
                `Included course ${i + 1}: ${f(row.credits)} credits × ${f(row.points)} points = ${f(result.contributions[i])} weighted points.`,
            ),
            `Total weighted points = ${f(result.points)}. Total included credits = ${f(result.credits)}.`,
            `${resultName} = Σ(credits × grade points) ÷ Σ(credits) = ${f(result.points)} ÷ ${f(result.credits)} = ${f(result.average, 8)}.`,
            `${result.excluded} course(s) explicitly excluded from both totals.`,
          ]}
          notes={[
            "The result uses the entered scale and included attempts. No repeat forgiveness, pass rule or percentage conversion is inferred.",
            "Only the displayed result is rounded. Your institution may apply a different method or rounding policy.",
          ]}
        />
      )}
    </div>
  );
}
