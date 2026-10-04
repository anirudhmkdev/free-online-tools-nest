import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useCallback } from "react";

function bmiCategory(bmi: number): { label: string; color: string } {
  if (bmi < 16) return { label: "Severely Underweight", color: "#3b82f6" };
  if (bmi < 18.5) return { label: "Underweight", color: "#60a5fa" };
  if (bmi < 25) return { label: "Normal", color: "#22c55e" };
  if (bmi < 30) return { label: "Overweight", color: "#eab308" };
  if (bmi < 35) return { label: "Obese Class I", color: "#f97316" };
  if (bmi < 40) return { label: "Obese Class II", color: "#ef4444" };
  return { label: "Obese Class III", color: "#dc2626" };
}

const BMI_RANGES = [
  { min: 0, max: 16, color: "#3b82f6", label: "Severely underweight" },
  { min: 16, max: 18.5, color: "#60a5fa", label: "Underweight" },
  { min: 18.5, max: 25, color: "#22c55e", label: "Normal" },
  { min: 25, max: 30, color: "#eab308", label: "Overweight" },
  { min: 30, max: 35, color: "#f97316", label: "Obese I" },
  { min: 35, max: 40, color: "#ef4444", label: "Obese II" },
  { min: 40, max: 50, color: "#dc2626", label: "Obese III" },
];

export default function BmiCalculator() {
  const { markInteraction, recordSuccess } = useToolTelemetry();
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [bmi, setBmi] = useState<number | null>(null);
  const [error, setError] = useState("");

  const calculate = useCallback(() => {
    markInteraction();
    setError("");
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
      setError("Please enter valid positive numbers for height and weight.");
      setBmi(null);
      return;
    }

    let bmiValue: number;
    if (unit === "metric") {
      const hInM = h / 100;
      bmiValue = w / (hInM * hInM);
    } else {
      bmiValue = (w / (h * h)) * 703;
    }
    if (!Number.isFinite(bmiValue) || bmiValue <= 0) {
      setError("Please enter height and weight within a finite calculation range.");
      setBmi(null);
      return;
    }
    setBmi(Math.round(bmiValue * 10) / 10);
    recordSuccess("calculate");
  }, [height, weight, unit, markInteraction, recordSuccess]);

  const category = bmi !== null ? bmiCategory(bmi) : null;

  return (
    <div className="space-y-6">
      {/* Unit toggle */}
      <div className="flex gap-2">
        {(["metric", "imperial"] as const).map((u) => (
          <button
            key={u}
            type="button"
            onClick={() => { setUnit(u); setBmi(null); setError(""); }}
            className="px-4 py-2 text-sm rounded-full border transition-all duration-150"
            style={{
              backgroundColor: unit === u ? "var(--color-primary)" : "var(--color-canvas)",
              color: unit === u ? "var(--color-on-primary)" : "var(--color-body)",
              borderColor: unit === u ? "var(--color-primary)" : "var(--color-hairline)",
            }}
          >
            {u === "metric" ? "Metric (cm / kg)" : "Imperial (in / lb)"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="bmi-height" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            {unit === "metric" ? "Height (cm)" : "Height (inches)"}
          </label>
          <input
            id="bmi-height"
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder={unit === "metric" ? "e.g. 175" : "e.g. 69"}
            className="w-full h-12 px-4 border rounded-lg text-base outline-none transition-colors duration-150"
            style={{
              backgroundColor: "var(--color-canvas-soft)",
              borderColor: "var(--color-hairline)",
              color: "var(--color-ink)",
            }}
            inputMode="decimal"
          />
        </div>
        <div>
          <label htmlFor="bmi-weight" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            {unit === "metric" ? "Weight (kg)" : "Weight (lbs)"}
          </label>
          <input
            id="bmi-weight"
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder={unit === "metric" ? "e.g. 70" : "e.g. 154"}
            className="w-full h-12 px-4 border rounded-lg text-base outline-none transition-colors duration-150"
            style={{
              backgroundColor: "var(--color-canvas-soft)",
              borderColor: "var(--color-hairline)",
              color: "var(--color-ink)",
            }}
            inputMode="decimal"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={calculate}
        className="btn-primary btn-sm"
        style={{ backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)" }}
      >
        Calculate BMI
      </button>

      {error && (
        <div className="p-4 rounded-lg text-sm" style={{ backgroundColor: "var(--color-canvas-soft-2)", color: "var(--color-body)" }}>
          {error}
        </div>
      )}

      {bmi !== null && !error && (
        <div className="space-y-4">
          {/* Result card */}
          <div className="p-6 rounded-lg text-center" style={{ backgroundColor: "var(--color-canvas-soft-2)" }}>
            <div className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--color-mute)", fontFamily: "var(--font-mono)" }}>
              Your BMI
            </div>
            <div className="text-4xl font-semibold" style={{ color: "var(--color-ink)", letterSpacing: "-1.28px" }}>
              {bmi}
            </div>
            {category && (
              <div className="mt-2 inline-block px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: category.color + "20", color: category.color }}>
                {category.label}
              </div>
            )}
          </div>

          {/* BMI scale bar */}
          <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--color-canvas-soft-2)" }}>
            <div className="text-xs uppercase tracking-wider mb-3" style={{ color: "var(--color-mute)", fontFamily: "var(--font-mono)" }}>
              BMI Scale
            </div>
            <div className="relative h-6 rounded-full overflow-hidden flex" style={{ backgroundColor: "var(--color-canvas)" }}>
              {BMI_RANGES.map((r) => {
                const width = ((r.max - r.min) / 50) * 100;
                return (
                  <div
                    key={r.label}
                    className="h-full transition-all duration-300"
                    style={{ width: `${width}%`, backgroundColor: r.color }}
                    title={r.label}
                  />
                );
              })}
              {bmi !== null && (
                <div
                  className="absolute top-0 w-0.5 h-full bg-white shadow-md transition-all duration-300"
                  style={{ left: `${Math.min((bmi / 50) * 100, 100)}%` }}
                />
              )}
            </div>
            <div className="flex justify-between mt-1 text-[10px]" style={{ color: "var(--color-mute)" }}>
              <span>0</span>
              <span>18.5</span>
              <span>25</span>
              <span>30</span>
              <span>40</span>
              <span>50+</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
