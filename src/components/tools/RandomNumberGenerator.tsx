import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useCallback, useMemo } from "react";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";
import ErrorBanner from "../ErrorBanner";
import { generateRandomNumbers, MAX_RANDOM_COUNT, parseRandomNumberRequest, randomNumberTotals } from "../../helpers/random-numbers";

interface Preset {
  label: string;
  min: number;
  max: number;
}

const PRESETS: Preset[] = [
  { label: "Dice (1-6)", min: 1, max: 6 },
  { label: "Lottery (1-69)", min: 1, max: 69 },
  { label: "Coin Flip (1-2)", min: 1, max: 2 },
  { label: "Percentage (0-100)", min: 0, max: 100 },
];

export default function RandomNumberGenerator() {
  const { markInteraction, recordSuccess, clearInteraction } = useToolTelemetry();
  const [minVal, setMinVal] = useState("1");
  const [maxVal, setMaxVal] = useState("100");
  const [count, setCount] = useState("1");
  const [allowDuplicates, setAllowDuplicates] = useState(true);
  const [sortResults, setSortResults] = useState(false);
  const [numbers, setNumbers] = useState<number[]>([]);
  const [error, setError] = useState("");
  const [copied, handleCopy] = useCopyToClipboard();

  const generate = useCallback(() => {
    markInteraction();
    setError("");
    const validation = parseRandomNumberRequest(minVal, maxVal, count, allowDuplicates);
    if (validation.error !== undefined) { setError(validation.error); setNumbers([]); return; }
    try {
      const result = generateRandomNumbers(validation.request);
      if (sortResults) result.sort((a, b) => a - b);
      setNumbers(result);
      recordSuccess("generate");
    } catch {
      setNumbers([]);
      setError("Secure random generation is unavailable. Try again in a browser that supports it.");
    }
  }, [minVal, maxVal, count, allowDuplicates, sortResults]);

  const stats = useMemo(() => {
    if (numbers.length === 0) return null;
    const { sum, average } = randomNumberTotals(numbers);
    return {
      count: numbers.length,
      min: Math.min(...numbers),
      max: Math.max(...numbers),
      sum,
      average,
    };
  }, [numbers]);

  const handlePreset = useCallback((preset: Preset) => {
    clearInteraction();
    setMinVal(preset.min.toString());
    setMaxVal(preset.max.toString());
    setNumbers([]);
    setError("");
  }, []);

  return (
    <div onChangeCapture={() => { markInteraction(); setError(""); setNumbers([]); }} className="space-y-6">
      <p className="text-sm text-body">Generate up to 1,000 whole numbers per batch. Ranges may contain up to 4,294,967,296 values.</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="rng-min" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            Minimum
          </label>
          <input
            id="rng-min"
            type="number"
            step="1"
            min={Number.MIN_SAFE_INTEGER}
            max={Number.MAX_SAFE_INTEGER}
            value={minVal}
            onChange={(e) => setMinVal(e.target.value)}
            placeholder="1"
            className="w-full h-12 px-4 border rounded-lg text-base outline-none transition-colors duration-150 font-mono"
            style={{
              backgroundColor: "var(--color-canvas-soft)",
              borderColor: "var(--color-hairline)",
              color: "var(--color-ink)",
              fontFamily: "var(--font-mono)",
            }}
            inputMode="numeric"
          />
        </div>
        <div>
          <label htmlFor="rng-max" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            Maximum
          </label>
          <input
            id="rng-max"
            type="number"
            step="1"
            min={Number.MIN_SAFE_INTEGER}
            max={Number.MAX_SAFE_INTEGER}
            value={maxVal}
            onChange={(e) => setMaxVal(e.target.value)}
            placeholder="100"
            className="w-full h-12 px-4 border rounded-lg text-base outline-none transition-colors duration-150 font-mono"
            style={{
              backgroundColor: "var(--color-canvas-soft)",
              borderColor: "var(--color-hairline)",
              color: "var(--color-ink)",
              fontFamily: "var(--font-mono)",
            }}
            inputMode="numeric"
          />
        </div>
        <div>
          <label htmlFor="rng-count" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            Count
          </label>
          <input
            id="rng-count"
            type="number"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            placeholder="1"
            min="1"
            step="1"
            max={MAX_RANDOM_COUNT}
            className="w-full h-12 px-4 border rounded-lg text-base outline-none transition-colors duration-150 font-mono"
            style={{
              backgroundColor: "var(--color-canvas-soft)",
              borderColor: "var(--color-hairline)",
              color: "var(--color-ink)",
              fontFamily: "var(--font-mono)",
            }}
            inputMode="numeric"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: "var(--color-body)" }}>
          <input
            type="checkbox"
            checked={allowDuplicates}
            onChange={(e) => setAllowDuplicates(e.target.checked)}
            className="w-4 h-4 rounded"
            style={{ accentColor: "var(--color-primary)" }}
          />
          Allow duplicates
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: "var(--color-body)" }}>
          <input
            type="checkbox"
            checked={sortResults}
            onChange={(e) => setSortResults(e.target.checked)}
            className="w-4 h-4 rounded"
            style={{ accentColor: "var(--color-primary)" }}
          />
          Sort results
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => handlePreset(preset)}
            className="px-3 py-1.5 text-xs rounded-full border transition-all duration-150"
            style={{
              backgroundColor: minVal === preset.min.toString() && maxVal === preset.max.toString()
                ? "var(--color-primary)"
                : "var(--color-canvas)",
              color: minVal === preset.min.toString() && maxVal === preset.max.toString()
                ? "var(--color-on-primary)"
                : "var(--color-body)",
              borderColor: minVal === preset.min.toString() && maxVal === preset.max.toString()
                ? "var(--color-primary)"
                : "var(--color-hairline)",
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <ErrorBanner message={error} />

      <button
        type="button"
        onClick={generate}
        className="btn-primary btn-sm"
        style={{ backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)" }}
      >
        Generate
      </button>

      {numbers.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold" style={{ color: "var(--color-ink)" }}>
              Generated Numbers
            </h3>
            <button
              type="button"
              onClick={() => handleCopy(numbers.join(", "))}
              className="text-xs px-2 py-1 rounded transition-colors duration-150"
              style={{ color: copied ? "var(--color-success)" : "var(--color-link)" }}
            >
              {copied ? "\u2713 Copied" : "Copy All"}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {numbers.map((n, i) => (
              <span
                key={i}
                className="inline-flex items-center justify-center min-w-[2.5rem] h-10 px-3 rounded-lg text-sm font-semibold font-mono"
                style={{
                  backgroundColor: "var(--color-canvas-soft-2)",
                  color: "var(--color-ink)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {n}
              </span>
            ))}
          </div>

          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: "Count", value: stats.count.toString() },
                { label: "Min", value: stats.min.toString() },
                { label: "Max", value: stats.max.toString() },
                { label: "Sum", value: stats.sum.toString() },
                { label: "Average", value: stats.average.toString() },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="p-3 rounded-lg text-center"
                  style={{ backgroundColor: "var(--color-canvas-soft-2)" }}
                >
                  <div
                    className="text-xs uppercase tracking-wider mb-1"
                    style={{ color: "var(--color-mute)", fontFamily: "var(--font-mono)" }}
                  >
                    {stat.label}
                  </div>
                  <div className="text-lg font-semibold font-mono" style={{ color: "var(--color-ink)", fontFamily: "var(--font-mono)" }}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
