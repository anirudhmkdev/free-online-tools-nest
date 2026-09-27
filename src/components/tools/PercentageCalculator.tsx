import { useState, useCallback } from "react";

/**
 * PercentageCalculator — three calculation modes:
 * 1. What is X% of Y?
 * 2. X is what % of Y?
 * 3. Percentage change from X to Y
 */
import { calculatePercentage } from "../../helpers/percentage";
import ErrorBanner from "../ErrorBanner";

type CalcMode = "of" | "is" | "change";

const MODES: { key: CalcMode; label: string; desc: string }[] = [
  { key: "of", label: "% of number", desc: "What is X% of Y?" },
  { key: "is", label: "% is what", desc: "X is what % of Y?" },
  { key: "change", label: "% change", desc: "Change from X to Y" },
];

export default function PercentageCalculator() {
  const [error, setError] = useState("");
  const [formula, setFormula] = useState("");
  const [mode, setMode] = useState<CalcMode>("of");
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const calculate = useCallback(() => {
    setResult(null); setFormula(""); setError("");
    try {
      const { value, formula } = calculatePercentage(mode, a, b);
      setResult(Number.isInteger(value) ? value.toString() : value.toFixed(4));
      setFormula(formula);
    } catch (error) { setError(error instanceof Error ? error.message : "Unable to calculate."); }
  }, [mode, a, b]);

  const getLabels = () => {
    switch (mode) {
      case "of": return { a: "Percentage (%)", b: "Number" };
      case "is": return { a: "Number", b: "Of number" };
      case "change": return { a: "From", b: "To" };
    }
  };

  const labels = getLabels();

  return (
    <div className="space-y-6">
      {/* Mode selector */}
      <div className="flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => { setMode(m.key); setResult(null); setFormula(""); setError(""); }}
            className="px-4 py-2 text-sm rounded-full border transition-all duration-150"
            style={{
              backgroundColor: mode === m.key ? "var(--color-primary)" : "var(--color-canvas)",
              color: mode === m.key ? "var(--color-on-primary)" : "var(--color-body)",
              borderColor: mode === m.key ? "var(--color-primary)" : "var(--color-hairline)",
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      <p className="text-sm" style={{ color: "var(--color-mute)" }}>
        {MODES.find((m) => m.key === mode)?.desc}
      </p>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="pct-a" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            {labels.a}
          </label>
          <input
            id="pct-a"
            type="number"
            value={a}
            onChange={(e) => { setA(e.target.value); setResult(null); setError(""); }}
            placeholder="0"
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
          <label htmlFor="pct-b" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            {labels.b}
          </label>
          <input
            id="pct-b"
            type="number"
            value={b}
            onChange={(e) => { setB(e.target.value); setResult(null); setError(""); }}
            placeholder="0"
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
        Calculate
      </button>

      <ErrorBanner message={error} />
      {/* Result */}
      {result !== null && (
        <div
          className="p-6 rounded-lg text-center"
          style={{ backgroundColor: "var(--color-canvas-soft-2)" }}
        >
          <div className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--color-mute)", fontFamily: "var(--font-mono)" }}>
            Result
          </div>
          <div className="text-4xl font-semibold" style={{ color: "var(--color-ink)", letterSpacing: "-1.28px" }}>
            {result}{mode !== "of" ? "%" : ""}
          </div>
          <p className="text-sm mt-3">Formula: {formula}. Display rounds to at most four decimal places. Percentage change uses the absolute starting value as its denominator.</p>
        </div>
      )}
    </div>
  );
}
