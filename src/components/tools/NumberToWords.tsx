import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useCallback } from "react";

const ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
const TEENS = ["ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
const SCALES = ["", "thousand", "million", "billion", "trillion"];

function convertHundreds(n: number): string {
  const parts: string[] = [];
  const h = Math.floor(n / 100);
  if (h > 0) {
    parts.push(ONES[h] + " hundred");
  }
  const r = n % 100;
  if (r > 0) {
    if (r < 10) {
      parts.push(ONES[r]);
    } else if (r < 20) {
      parts.push(TEENS[r - 10]);
    } else {
      const t = Math.floor(r / 10);
      const o = r % 10;
      parts.push(TENS[t] + (o > 0 ? "-" + ONES[o] : ""));
    }
  }
  return parts.join(" ");
}

function numberToWords(n: number): string {
  if (n === 0) return "zero";
  if (!isFinite(n)) return "infinity";

  const isNegative = n < 0;
  let abs = Math.abs(Math.floor(n));

  const parts: string[] = [];
  let scaleIndex = 0;

  while (abs > 0) {
    const chunk = abs % 1000;
    if (chunk > 0) {
      const chunkWords = convertHundreds(chunk);
      const scale = SCALES[scaleIndex];
      parts.unshift(chunkWords + (scale ? " " + scale : ""));
    }
    abs = Math.floor(abs / 1000);
    scaleIndex++;
  }

  return (isNegative ? "negative " : "") + parts.join(" ");
}

export default function NumberToWords() {
  const { markInteraction, recordSuccess } = useToolTelemetry();
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState("");

  const convert = useCallback(() => {
    markInteraction();
    setError("");
    const trimmed = input.trim();
    if (!trimmed) {
      setError("Please enter a number.");
      setResult(null);
      return;
    }

    const num = Number(trimmed);
    if (!Number.isFinite(num)) {
      setError("Please enter a valid number.");
      setResult(null);
      return;
    }

    if (!Number.isInteger(num)) {
      const intPart = Math.floor(Math.abs(num));
      const decPart = Math.round((Math.abs(num) - intPart) * 100);
      const intWords = numberToWords(intPart) || "zero";
      setResult(`${num < 0 ? "negative " : ""}${intWords} and ${decPart}/100`);
      if (Math.abs(num) <= 999999999999999) recordSuccess("convert");
      return;
    }

    if (Math.abs(num) > 999999999999999) {
      setError("Number is too large (max: 999 trillion).");
      setResult(null);
      return;
    }

    setResult(numberToWords(num));
    recordSuccess("convert");
  }, [input]);

  return (
    <div onChangeCapture={markInteraction} className="space-y-6">
      <div>
        <label htmlFor="number-input" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
          Enter a Number
        </label>
        <input
          id="number-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
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
