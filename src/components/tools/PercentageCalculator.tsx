import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useCallback } from "react";

/**
 * PercentageCalculator — three calculation modes:
 * 1. What is X% of Y?
 * 2. X is what % of Y?
 * 3. Percentage change from X to Y
 */
type CalcMode = "of" | "is" | "change";

const MODES: { key: CalcMode; label: string; desc: string }[] = [
  { key: "of", label: "% of number", desc: "What is X% of Y?" },
  { key: "is", label: "% is what", desc: "X is what % of Y?" },
  { key: "change", label: "% change", desc: "Change from X to Y" },
];

export default function PercentageCalculator() {
  const { markInteraction, recordSuccess } = useToolTelemetry();
  const [mode, setMode] = useState<CalcMode>("of");
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const calculate = useCallback(() => {
    markInteraction();
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    if (!Number.isFinite(numA) || !Number.isFinite(numB)) {
      setResult(null);
      return;
    }

    let res: number;
    switch (mode) {
      case "of":
        res = (numA / 100) * numB;
        break;
      case "is":
        if (numB === 0) { setResult("Cannot divide by zero"); return; }
        res = (numA / numB) * 100;
        break;
      case "change":
        if (numA === 0) { setResult("Cannot divide by zero"); return; }
        res = ((numB - numA) / Math.abs(numA)) * 100;
        break;
      default:
        return;
    }
    if (!Number.isFinite(res)) { setResult(null); return; }
    setResult(Number.isInteger(res) ? res.toString() : res.toFixed(4));
    recordSuccess("calculate");
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
    <div onChangeCapture={markInteraction} className="space-y-6">
      {/* Mode selector */}
      <div className="flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => { setMode(m.key); setResult(null); }}
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
            onChange={(e) => setA(e.target.value)}
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
            onChange={(e) => setB(e.target.value)}
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
        </div>
      )}
    </div>
  );
}
