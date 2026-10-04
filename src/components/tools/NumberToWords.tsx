import { decimalToWords } from "../../helpers/quality-converters";
import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useCallback } from "react";

export default function NumberToWords() {
  const { markInteraction, recordSuccess } = useToolTelemetry();
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState("");

  const convert = useCallback(() => {
    markInteraction();
    setError("");
    try {
      setResult(decimalToWords(input));
      recordSuccess("convert");
    } catch (error) {
      setResult(null);
      setError(error instanceof Error ? error.message : "Unable to convert this number.");
    }
  }, [input]);

  return (
    <div onChangeCapture={markInteraction} className="space-y-6">
      <p className="text-sm">English words for plain decimal numbers. Fractions round to hundredths, with halves rounded away from zero; 1.999 becomes two and 00/100.</p>
      <div>
        <label htmlFor="number-input" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
          Enter a Number
        </label>
        <input
          id="number-input"
          type="text"
          value={input}
          onChange={(e) => { setInput(e.target.value); setResult(null); setError(""); }}
          placeholder="e.g. 12345"
          className="w-full h-12 px-4 border rounded-lg text-base outline-none transition-colors duration-150 font-mono"
          style={{
            backgroundColor: "var(--color-canvas-soft)",
            borderColor: "var(--color-hairline)",
            color: "var(--color-ink)",
          }}
          inputMode="numeric"
        />
      </div>

      <button
        type="button"
        onClick={convert}
        className="btn-primary btn-sm"
        style={{ backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)" }}
      >
        Convert to Words
      </button>

      {error && (
        <div className="p-4 rounded-lg text-sm" style={{ backgroundColor: "var(--color-canvas-soft-2)", color: "var(--color-body)" }}>
          {error}
        </div>
      )}

      {result && !error && (
        <div className="p-6 rounded-lg" style={{ backgroundColor: "var(--color-canvas-soft-2)" }}>
          <div className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--color-mute)", fontFamily: "var(--font-mono)" }}>
            In Words
          </div>
          <div className="text-xl font-semibold leading-relaxed" style={{ color: "var(--color-ink)", letterSpacing: "-0.4px" }}>
            {result}
          </div>
        </div>
      )}
    </div>
  );
}
