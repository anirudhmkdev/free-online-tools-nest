import { computeDiscount as compute } from "../../helpers/quality-calculators";
import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useMemo, useEffect } from "react";

type CalcMode = "savings" | "discount-pct" | "final-price";

const MODES: { key: CalcMode; label: string; desc: string }[] = [
  { key: "savings", label: "Calculate Savings", desc: "Original Price + Discount % → Savings + Final Price" },
  { key: "discount-pct", label: "Calculate Discount %", desc: "Original Price + Sale Price → Discount %" },
  { key: "final-price", label: "Final Price", desc: "Original Price + Discount Amount → Final Price" },
];

function formatCurrency(val: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);
}

function getLabels(mode: CalcMode) {
  switch (mode) {
    case "savings":
      return { a: "Original Price ($)", b: "Discount (%)", aPlaceholder: "100.00", bPlaceholder: "20" };
    case "discount-pct":
      return { a: "Original Price ($)", b: "Sale Price ($)", aPlaceholder: "100.00", bPlaceholder: "80.00" };
    case "final-price":
      return { a: "Original Price ($)", b: "Discount Amount ($)", aPlaceholder: "100.00", bPlaceholder: "20.00" };
  }
}

export default function DiscountCalculator() {
  const { markInteraction, recordSuccess } = useToolTelemetry();
  const [mode, setMode] = useState<CalcMode>("savings");
  const [inputA, setInputA] = useState("");
  const [inputB, setInputB] = useState("");

  const result = useMemo(() => compute(mode, inputA, inputB), [mode, inputA, inputB]);
  const labels = getLabels(mode);

  const error = useMemo(() => {
    const a = parseFloat(inputA);
    const b = parseFloat(inputB);
    if (!inputA || !inputB) return "";
    if (!Number.isFinite(a) || !Number.isFinite(b)) return "Enter finite numeric values.";
    if (b < 0) return "Sale price or discount must not be negative.";
    if (a <= 0) return "Original price must be greater than zero.";
    if (mode === "savings" && (b < 0 || b > 100)) return "Discount must be between 0 and 100.";
    if (mode === "discount-pct" && b > a) return "Sale price must not exceed original price.";
    if (mode === "final-price" && b > a) return "Discount amount must not exceed original price.";
    return "";
  }, [mode, inputA, inputB]);

  useEffect(() => {
    if (result && !error && Object.values(result).every(Number.isFinite)) recordSuccess("calculate");
  }, [result, error, recordSuccess]);

  return (
    <div className="space-y-6">
      {/* Mode selector */}
      <div className="flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => setMode(m.key)}
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
          <label htmlFor="disc-a" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            {labels.a}
          </label>
          <input
            id="disc-a"
            type="number"
            value={inputA}
            onChange={(e) => { markInteraction(); setInputA(e.target.value); }}
            placeholder={labels.aPlaceholder}
            className="w-full h-12 px-4 border rounded-lg text-base outline-none transition-colors duration-150"
            style={{
              backgroundColor: "var(--color-canvas-soft)",
              borderColor: "var(--color-hairline)",
              color: "var(--color-ink)",
            }}
            inputMode="decimal"
            min="0"
          />
        </div>
        <div>
          <label htmlFor="disc-b" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            {labels.b}
          </label>
          <input
            id="disc-b"
            type="number"
            value={inputB}
            onChange={(e) => { markInteraction(); setInputB(e.target.value); }}
            placeholder={labels.bPlaceholder}
            className="w-full h-12 px-4 border rounded-lg text-base outline-none transition-colors duration-150"
            style={{
              backgroundColor: "var(--color-canvas-soft)",
              borderColor: "var(--color-hairline)",
              color: "var(--color-ink)",
            }}
            inputMode="decimal"
            min="0"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg text-sm" style={{ backgroundColor: "var(--color-canvas-soft-2)", color: "var(--color-body)" }}>
          {error}
        </div>
      )}

      {/* Results */}
      {result && !error && (
        <div className="space-y-4">
          <div className="p-6 rounded-lg text-center" style={{ backgroundColor: "var(--color-canvas-soft-2)" }}>
            <div className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--color-mute)", fontFamily: "var(--font-mono)" }}>
              You Save
            </div>
            <div className="text-3xl font-semibold" style={{ color: "var(--color-success)", letterSpacing: "-0.96px" }}>
              {formatCurrency(result.savings)}
            </div>
            <div className="mt-2 inline-block px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: "var(--color-success)", color: "var(--color-on-primary)" }}>
              Save {result.discountPct.toFixed(1)}%
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg text-center" style={{ backgroundColor: "var(--color-canvas-soft-2)" }}>
              <div className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--color-mute)", fontFamily: "var(--font-mono)" }}>
                Final Price
              </div>
              <div className="text-2xl font-semibold" style={{ color: "var(--color-ink)" }}>
                {formatCurrency(result.finalPrice)}
              </div>
            </div>
            <div className="p-4 rounded-lg text-center" style={{ backgroundColor: "var(--color-canvas-soft-2)" }}>
              <div className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--color-mute)", fontFamily: "var(--font-mono)" }}>
                Discount
              </div>
              <div className="text-2xl font-semibold" style={{ color: "var(--color-ink)" }}>
                {result.discountPct.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
