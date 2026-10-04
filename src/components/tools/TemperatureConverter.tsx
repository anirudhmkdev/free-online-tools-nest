import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useCallback } from "react";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";

type Unit = "celsius" | "fahrenheit" | "kelvin";

function toCelsius(value: number, from: Unit): number {
  switch (from) {
    case "celsius": return value;
    case "fahrenheit": return (value - 32) * 5 / 9;
    case "kelvin": return value - 273.15;
  }
}

function formatTemp(value: number): string {
  return `${value.toFixed(2)}\u00B0`;
}

export default function TemperatureConverter() {
  const { markInteraction, recordSuccess } = useToolTelemetry();
  const [celsius, setCelsius] = useState("");
  const [fahrenheit, setFahrenheit] = useState("");
  const [kelvin, setKelvin] = useState("");
  const [copied, handleCopy] = useCopyToClipboard();

  const handleChange = useCallback((value: string, unit: Unit) => {
    markInteraction();
    if (value === "" || value === "-") {
      setCelsius("");
      setFahrenheit("");
      setKelvin("");
      return;
    }
    const num = parseFloat(value);
    if (isNaN(num)) return;

    const c = toCelsius(num, unit);
    const f = c * 9 / 5 + 32;
    const k = c + 273.15;

    setCelsius(unit === "celsius" ? value : c.toFixed(2));
    setFahrenheit(unit === "fahrenheit" ? value : f.toFixed(2));
    setKelvin(unit === "kelvin" ? value : k.toFixed(2));
    if (Number.isFinite(c) && Number.isFinite(f) && Number.isFinite(k) && k >= 0) recordSuccess("convert");
  }, []);

  const outputs = [
    { label: "Celsius", unit: "celsius" as Unit, value: celsius, symbol: "\u00B0C" },
    { label: "Fahrenheit", unit: "fahrenheit" as Unit, value: fahrenheit, symbol: "\u00B0F" },
    { label: "Kelvin", unit: "kelvin" as Unit, value: kelvin, symbol: " K" },
  ];

  return (
    <div onChangeCapture={markInteraction} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {outputs.map(({ label, unit, value, symbol }) => (
          <div key={unit}>
            <label htmlFor={`temp-${unit}`} className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
              {label}
            </label>
            <div className="relative">
              <input
                id={`temp-${unit}`}
                type="number"
                value={value}
                onChange={(e) => handleChange(e.target.value, unit)}
                placeholder="--"
                className="w-full h-12 px-4 pr-10 border rounded-lg text-base outline-none"
                style={{
                  backgroundColor: "var(--color-canvas-soft)",
                  borderColor: "var(--color-hairline)",
                  color: "var(--color-ink)",
                  fontFamily: "var(--font-mono)",
                }}
                step="any"
              />
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none"
                style={{ color: "var(--color-mute)" }}
              >
                {symbol}
              </span>
            </div>
          </div>
        ))}
      </div>

      {celsius && (
        <div className="flex flex-col sm:flex-row gap-2">
          {outputs.map(({ label, value, symbol }) => (
            <button
              key={label}
              type="button"
              onClick={() => handleCopy(`${value}${symbol}`)}
              className="text-sm px-3 py-2 rounded-md transition-colors duration-150"
              style={{
                color: copied ? "var(--color-success)" : "var(--color-link)",
                backgroundColor: "var(--color-canvas-soft-2)",
              }}
            >
              {copied ? "Copied" : `Copy ${label}`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
