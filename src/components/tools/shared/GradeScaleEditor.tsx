import {
  numberInput,
  pointsForGrade,
  validateGradeMapping,
  type Course,
} from "../../../helpers/student-calculators";
import { inputClass, NumberField } from "./CalculationResult";
export interface GradeConfig {
  maximum: string;
  mode: "points" | "letters";
  mapping: { label: string; points: string }[];
}
export interface CourseEntry {
  credits: string;
  grade: string;
  included: boolean;
}
export const emptyGradeConfig = (): GradeConfig => ({
  maximum: "",
  mode: "points",
  mapping: [{ label: "", points: "" }],
});
export const emptyCourse = (): CourseEntry => ({
  credits: "",
  grade: "",
  included: true,
});

export function readCourses(
  rows: CourseEntry[],
  config: GradeConfig,
): { courses: Course[]; scale: number } {
  const scale = numberInput(config.maximum, "Scale maximum");
  const mapping =
    config.mode === "letters"
      ? validateGradeMapping(
          config.mapping.map((row) => ({
            label: row.label,
            points: numberInput(
              row.points,
              `Points for ${row.label || "grade"}`,
            ),
          })),
          scale,
        )
      : [];
  const courses = rows.map((row, i) =>
    row.included
      ? {
          credits: numberInput(row.credits, `Credits for course ${i + 1}`),
          points:
            config.mode === "letters"
              ? pointsForGrade(row.grade, mapping, scale)
              : numberInput(row.grade, `Points for course ${i + 1}`),
          included: true,
        }
      : { credits: 0, points: 0, included: false },
  );
  return { courses, scale };
}

export default function GradeScaleEditor({
  config,
  onChange,
}: {
  config: GradeConfig;
  onChange: (config: GradeConfig) => void;
}) {
  return (
    <fieldset className="min-w-0 space-y-4 rounded-lg border border-hairline p-4">
      <legend className="px-2 text-sm font-semibold text-ink">
        Your grading system
      </legend>
      <p className="text-sm leading-relaxed text-body">
        Enter the scale and point values from your institution. These settings
        are not a university grading policy.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField
          id="grade-scale"
          label="Scale maximum"
          value={config.maximum}
          onChange={(maximum) => onChange({ ...config, maximum })}
          hint="For example 4, 5, 10 or your own positive maximum."
        />
        <div>
          <label
            htmlFor="grade-mode"
            className="mb-2 block text-sm font-medium"
          >
            Enter grades as
          </label>
          <select
            id="grade-mode"
            className={inputClass}
            value={config.mode}
            onChange={(e) =>
              onChange({
                ...config,
                mode: e.target.value as GradeConfig["mode"],
              })
            }
          >
            <option value="points">Numeric grade points</option>
            <option value="letters">My own grade labels</option>
          </select>
        </div>
      </div>
      {config.mode === "letters" && (
        <div className="space-y-3">
          <p className="text-xs leading-relaxed text-body">
            Define every label you use. A and a count as the same label. No
            grade mappings are supplied automatically.
          </p>
          {config.mapping.map((row, i) => (
            <div key={i} className="grid gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor={`grade-label-${i}`}
                  className="mb-2 block text-sm"
                >
                  Grade label {i + 1}
                </label>
                <input
                  id={`grade-label-${i}`}
                  className={inputClass}
                  value={row.label}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      mapping: config.mapping.map((r, j) =>
                        j === i ? { ...r, label: e.target.value } : r,
                      ),
                    })
                  }
                />
              </div>
              <NumberField
                id={`grade-points-${i}`}
                label={`Point value ${i + 1}`}
                value={row.points}
                onChange={(points) =>
                  onChange({
                    ...config,
                    mapping: config.mapping.map((r, j) =>
                      j === i ? { ...r, points } : r,
                    ),
                  })
                }
              />
              <button
                type="button"
                className="min-h-11 min-w-11 py-2 text-left text-sm text-link underline disabled:opacity-40"
                disabled={config.mapping.length === 1}
                onClick={() =>
                  onChange({
                    ...config,
                    mapping: config.mapping.filter((_, j) => j !== i),
                  })
                }
              >
                Remove grade {i + 1}
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn-secondary"
            disabled={config.mapping.length >= 30}
            onClick={() =>
              onChange({
                ...config,
                mapping: [...config.mapping, { label: "", points: "" }],
              })
            }
          >
            Add grade label
          </button>
        </div>
      )}
    </fieldset>
  );
}

export function CourseEditor({
  rows,
  config,
  onChange,
}: {
  rows: CourseEntry[];
  config: GradeConfig;
  onChange: (rows: CourseEntry[]) => void;
}) {
  function edit(index: number, update: Partial<CourseEntry>) {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...update } : row)));
  }
  return (
    <div className="space-y-4">
      <p className="text-sm text-body">
        Include only the attempts and courses your institution counts. Excluding
        a course removes both its credits and points from the calculation.
      </p>
      {rows.map((row, i) => (
        <fieldset
          key={i}
          className="min-w-0 rounded-lg border border-hairline p-4"
        >
          <legend className="px-2 text-sm font-semibold">Course {i + 1}</legend>
          <label className="mb-4 flex min-h-11 cursor-pointer items-center gap-2 py-2 text-sm">
            <input
              type="checkbox"
              checked={row.included}
              onChange={(e) => edit(i, { included: e.target.checked })}
            />
            Include course {i + 1} in GPA
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField
              id={`course-credits-${i}`}
              label={`Credits — course ${i + 1}`}
              value={row.credits}
              disabled={!row.included}
              onChange={(credits) => edit(i, { credits })}
            />
            {config.mode === "points" ? (
              <NumberField
                id={`course-points-${i}`}
                label={`Grade points — course ${i + 1}`}
                value={row.grade}
                disabled={!row.included}
                onChange={(grade) => edit(i, { grade })}
              />
            ) : (
              <div>
                <label
                  htmlFor={`course-grade-${i}`}
                  className="mb-2 block text-sm"
                >
                  Grade label — course {i + 1}
                </label>
                <input
                  id={`course-grade-${i}`}
                  className={inputClass}
                  value={row.grade}
                  disabled={!row.included}
                  onChange={(e) => edit(i, { grade: e.target.value })}
                  placeholder="Enter one of your mapped labels"
                />
              </div>
            )}
          </div>
          <button
            type="button"
            className="mt-3 min-h-11 min-w-11 py-2 text-sm text-link underline disabled:opacity-40"
            disabled={rows.length === 1}
            onClick={() => onChange(rows.filter((_, j) => j !== i))}
          >
            Remove course {i + 1}
          </button>
        </fieldset>
      ))}
      <button
        type="button"
        className="btn-secondary"
        disabled={rows.length >= 100}
        onClick={() => onChange([...rows, emptyCourse()])}
      >
        Add course
      </button>
    </div>
  );
}
