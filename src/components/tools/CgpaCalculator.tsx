import { useState } from "react";
import { calculateCgpaSemesters, formatNumber as f, numberInput, type SemesterWeighting } from "../../helpers/student-calculators";
import CalculationResult, { CalculatorForm, NumberField, inputClass } from "./shared/CalculationResult";
import SgpaCalculator from "./SgpaCalculator";

export default function CgpaCalculator() {
  const [mode, setMode] = useState("semesters"); const [scale, setScale] = useState("");
  const [method, setMethod] = useState<SemesterWeighting | "">("");
  const [rows, setRows] = useState([{ sgpa: "", weight: "" }, { sgpa: "", weight: "" }]);
  const [result, setResult] = useState<ReturnType<typeof calculateCgpaSemesters> | null>(null); const [error, setError] = useState("");
  function clear() { setResult(null); setError(""); }
  return <div className="space-y-5"><div className="flex flex-wrap gap-3" aria-label="CGPA input method">{["semesters", "courses"].map(value => <button type="button" key={value} aria-pressed={mode === value} className={mode === value ? "btn-primary" : "btn-secondary"} onClick={() => { setMode(value); clear(); }}>{value === "semesters" ? "From semester SGPAs" : "From individual courses"}</button>)}</div>
  {mode === "courses" ? <div><p className="mb-5 text-sm text-body">Enter the courses from all semesters you want included. Use one grade-point scale throughout.</p><SgpaCalculator resultName="CGPA" /></div> : <>
  <CalculatorForm error={error} onEdit={clear} onSubmit={e => { e.preventDefault(); clear(); try {
    if (!method) throw new Error("Choose semester credits, custom weights or explicit equal weighting.");
    setResult(calculateCgpaSemesters(rows.map((row, i) => ({ sgpa: numberInput(row.sgpa, `SGPA for semester ${i + 1}`), weight: method === "equal" ? undefined : numberInput(row.weight, `Credits or weight for semester ${i + 1}`) })), numberInput(scale, "Scale maximum"), method));
  } catch (err) { setError((err as Error).message); } }}>
    <p className="text-sm leading-relaxed text-body">Semester SGPAs must use the same scale. Credits or weights are required unless you explicitly select equal weighting. Use included GPA credits, not automatically all enrolled credits.</p>
    <div className="grid gap-5 sm:grid-cols-2"><NumberField id="cgpa-scale" label="Scale maximum" value={scale} onChange={setScale} hint="For example 4, 5, 10 or a custom maximum." /><div><label htmlFor="cgpa-weighting" className="mb-2 block text-sm font-medium">Semester weighting method</label><select id="cgpa-weighting" className={inputClass} value={method} onChange={e => setMethod(e.target.value as SemesterWeighting | "")}><option value="">Choose a method</option value="credits">Semester credits</option><option value="custom">Custom institutional weights</option><option value="equal">Equal weighting — I explicitly choose this</option></select></div></div>
    {rows.map((row, i) => <fieldset key={i} className="min-w-0 rounded-lg border border-hairline p-4"><legend className="px-2 text-sm font-semibold">Semester {i + 1}</legend><div className="grid gap-4 sm:grid-cols-2"><NumberField id={`semester-sgpa-${i}`} label={`SGPA — semester ${i + 1}`} value={row.sgpa} onChange={sgpa => setRows(rows.map((r, j) => i === j ? { ...r, sgpa } : r))} />{method !== "equal" && <NumberField id={`semester-weight-${i}`} label={`${method === "credits" ? "Credits" : "Weight"} — semester ${i + 1}`} value={row.weight} onChange={weight => setRows(rows.map((r, j) => i === j ? { ...r, weight } : r))} />}</div><button type="button" disabled={rows.length === 1} className="mt-3 text-sm text-link underline disabled:opacity-40" onClick={() => { setRows(rows.filter((_, j) => i !== j)); clear(); }}>Remove semester {i + 1}</button></fieldset>)}
    <button type="button" className="btn-secondary" disabled={rows.length >= 100} onClick={() => { setRows([...rows, { sgpa: "", weight: "" }]); clear(); }}>Add semester</button>
    <div className="flex flex-wrap gap-3"><button type="submit" className="btn-primary">Calculate CGPA</button><button type="button" className="btn-secondary" onClick={() => { setScale("10"); setMethod("credits"); setRows([{ sgpa: "8", weight: "20" }, { sgpa: "9", weight: "24" }]); clear(); }}>Load example</button></div>
  </CalculatorForm>
  {result && <CalculationResult label={`CGPA · ${result.weighting} · scale maximum ${scale}`} value={result.average.toFixed(2)} lines={[`Selected method: ${result.weighting}.`, ...result.included.map((row, i) => `Semester ${i + 1}: ${f(row.points)} SGPA × ${f(row.credits)} ${result.method === "credits" ? "credits" : "weight"} = ${f(result.contributions[i])}.`), `CGPA = Σ(SGPA × weight) ÷ Σ(weight) = ${f(result.points)} ÷ ${f(result.credits)} = ${f(result.average, 8)}.`]} notes={["This aggregate is approximate if the entered semester SGPAs were already rounded. Use individual courses when exact underlying credits and grade points are available.", "Equal weighting is appropriate only when you deliberately choose that method. No university formula or GPA-to-percentage conversion is assumed."]} />}
  </>}
  </div>;
}
