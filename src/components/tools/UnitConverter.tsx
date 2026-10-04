import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useMemo, useCallback, useEffect } from "react";

type Category = "length" | "weight" | "temperature" | "speed" | "volume";

interface UnitDef {
  label: string;
  value: string;
}

const CATEGORIES: { key: Category; label: string }[] = [
  { key: "length", label: "Length" },
  { key: "weight", label: "Weight" },
  { key: "temperature", label: "Temperature" },
  { key: "speed", label: "Speed" },
  { key: "volume", label: "Volume" },
];

const UNITS: Record<Category, UnitDef[]> = {
  length: [
    { label: "Meters", value: "m" },
    { label: "Kilometers", value: "km" },
    { label: "Miles", value: "mi" },
    { label: "Feet", value: "ft" },
    { label: "Inches", value: "in" },
    { label: "Centimeters", value: "cm" },
    { label: "Millimeters", value: "mm" },
    { label: "Yards", value: "yd" },
  ],
  weight: [
    { label: "Kilograms", value: "kg" },
    { label: "Grams", value: "g" },
    { label: "Pounds", value: "lb" },
    { label: "Ounces", value: "oz" },
    { label: "Tons (metric)", value: "t" },
    { label: "Milligrams", value: "mg" },
  ],
  temperature: [
    { label: "Celsius", value: "c" },
    { label: "Fahrenheit", value: "f" },
    { label: "Kelvin", value: "k" },
  ],
  speed: [
    { label: "km/h", value: "kmh" },
    { label: "mph", value: "mph" },
    { label: "Knots", value: "kn" },
    { label: "m/s", value: "ms" },
  ],
  volume: [
    { label: "Liters", value: "l" },
    { label: "Milliliters", value: "ml" },
    { label: "Gallons", value: "gal" },
    { label: "Cups", value: "cup" },
    { label: "Fluid Ounces", value: "floz" },
    { label: "Cubic Meters", value: "m3" },
  ],
};

function convert(category: Category, value: number, from: string, to: string): number {
  if (from === to) return value;

  const toBase = (v: number, unit: string): number => {
    switch (category) {
      case "length": {
        const lengthMap: Record<string, number> = {
          m: 1, km: 1000, mi: 1609.344, ft: 0.3048,
          in: 0.0254, cm: 0.01, mm: 0.001, yd: 0.9144,
        };
        return v * (lengthMap[unit] ?? 1);
      }
      case "weight": {
        const weightMap: Record<string, number> = {
          kg: 1, g: 0.001, lb: 0.453592, oz: 0.0283495,
          t: 1000, mg: 0.000001,
        };
        return v * (weightMap[unit] ?? 1);
      }
      case "temperature": {
        if (unit === "c") return v;
        if (unit === "f") return (v - 32) * (5 / 9);
        if (unit === "k") return v - 273.15;
        return v;
      }
      case "speed": {
        const speedMap: Record<string, number> = {
          ms: 1, kmh: 0.277778, mph: 0.44704, kn: 0.514444,
        };
        return v * (speedMap[unit] ?? 1);
      }
      case "volume": {
        const volumeMap: Record<string, number> = {
          l: 1, ml: 0.001, gal: 3.78541, cup: 0.236588,
          floz: 0.0295735, m3: 1000,
        };
        return v * (volumeMap[unit] ?? 1);
      }
      default:
        return v;
    }
  };

  const fromBase = (v: number, unit: string): number => {
    switch (category) {
      case "temperature": {
        if (unit === "c") return v;
        if (unit === "f") return v * (9 / 5) + 32;
        if (unit === "k") return v + 273.15;
        return v;
      }
      default:
        return toBase(v, unit) === 0 ? 0 : v / toBase(1, unit);
    }
  };

  const base = toBase(value, from);
  return parseFloat(fromBase(base, to).toFixed(10));
}

const COMMON_PRESETS: Record<Category, { from: string; to: string; label: string }[]> = {
  length: [
    { from: "m", to: "ft", label: "Meters → Feet" },
    { from: "km", to: "mi", label: "Kilometers → Miles" },
    { from: "cm", to: "in", label: "Centimeters → Inches" },
    { from: "mi", to: "km", label: "Miles → Kilometers" },
  ],
  weight: [
    { from: "kg", to: "lb", label: "Kilograms → Pounds" },
    { from: "g", to: "oz", label: "Grams → Ounces" },
    { from: "lb", to: "kg", label: "Pounds → Kilograms" },
  ],
  temperature: [
    { from: "c", to: "f", label: "Celsius → Fahrenheit" },
    { from: "f", to: "c", label: "Fahrenheit → Celsius" },
    { from: "c", to: "k", label: "Celsius → Kelvin" },
  ],
  speed: [
    { from: "kmh", to: "mph", label: "km/h → mph" },
    { from: "mph", to: "kmh", label: "mph → km/h" },
    { from: "kn", to: "kmh", label: "Knots → km/h" },
  ],
  volume: [
    { from: "l", to: "gal", label: "Liters → Gallons" },
    { from: "gal", to: "l", label: "Gallons → Liters" },
    { from: "cup", to: "ml", label: "Cups → Milliliters" },
  ],
};

export default function UnitConverter() {
  const { markInteraction, recordSuccess, clearInteraction } = useToolTelemetry();
  const [category, setCategory] = useState<Category>("length");
  const [fromUnit, setFromUnit] = useState("m");
  const [toUnit, setToUnit] = useState("ft");
  const [inputValue, setInputValue] = useState("1");

  const unitList = UNITS[category];

  const result = useMemo(() => {
    const num = parseFloat(inputValue);
    if (isNaN(num) || num < 0) return null;
    return convert(category, num, fromUnit, toUnit);
  }, [category, inputValue, fromUnit, toUnit]);

  const handleCategoryChange = (cat: Category) => {
    clearInteraction();
    setCategory(cat);
    const units = UNITS[cat];
    setFromUnit(units[0].value);
    setToUnit(units.length > 1 ? units[1].value : units[0].value);
    setInputValue("1");
  };

  const getUnitLabel = (val: string): string => {
    return unitList.find((u) => u.value === val)?.label ?? val;
  };

  const handlePresetClick = useCallback(
    (from: string, to: string) => {
      clearInteraction();
      setFromUnit(from);
      setToUnit(to);
    },
    []
  );

  useEffect(() => {
    if (result !== null && Number.isFinite(result)) recordSuccess("convert");
  }, [result, recordSuccess]);

  return (
    <div onChangeCapture={markInteraction} className="space-y-6">
      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            type="button"
            onClick={() => handleCategoryChange(cat.key)}
            className="px-4 py-2 text-sm rounded-full border transition-all duration-150"
            style={{
              backgroundColor: category === cat.key ? "var(--color-primary)" : "var(--color-canvas)",
              color: category === cat.key ? "var(--color-on-primary)" : "var(--color-body)",
              borderColor: category === cat.key ? "var(--color-primary)" : "var(--color-hairline)",
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Converter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        <div>
          <label htmlFor="uc-value" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            Value
          </label>
          <input
            id="uc-value"
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="1"
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
          <label htmlFor="uc-from" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            From
          </label>
          <select
            id="uc-from"
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            className="w-full h-12 px-4 border rounded-lg text-base outline-none transition-colors duration-150"
            style={{
              backgroundColor: "var(--color-canvas-soft)",
              borderColor: "var(--color-hairline)",
              color: "var(--color-ink)",
            }}
          >
            {unitList.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="uc-to" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            To
          </label>
          <select
            id="uc-to"
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
            className="w-full h-12 px-4 border rounded-lg text-base outline-none transition-colors duration-150"
            style={{
              backgroundColor: "var(--color-canvas-soft)",
              borderColor: "var(--color-hairline)",
              color: "var(--color-ink)",
            }}
          >
            {unitList.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Result */}
      {result !== null && (
        <div className="p-6 rounded-lg text-center" style={{ backgroundColor: "var(--color-canvas-soft-2)" }}>
          <div className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--color-mute)", fontFamily: "var(--font-mono)" }}>
            Result
          </div>
          <div className="text-3xl font-semibold" style={{ color: "var(--color-ink)", letterSpacing: "-0.96px" }}>
            {inputValue} {getUnitLabel(fromUnit)} = {result} {getUnitLabel(toUnit)}
          </div>
        </div>
      )}

      {/* Common conversions */}
      <div className="space-y-2">
        <h3 className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--color-mute)", fontFamily: "var(--font-mono)" }}>
          Common Conversions
        </h3>
        <div className="flex flex-wrap gap-2">
          {(COMMON_PRESETS[category] ?? []).map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handlePresetClick(preset.from, preset.to)}
              className="px-3 py-1.5 text-xs rounded-full border transition-all duration-150"
              style={{
                backgroundColor: fromUnit === preset.from && toUnit === preset.to
                  ? "var(--color-primary)"
                  : "var(--color-canvas)",
                color: fromUnit === preset.from && toUnit === preset.to
                  ? "var(--color-on-primary)"
                  : "var(--color-body)",
                borderColor: fromUnit === preset.from && toUnit === preset.to
                  ? "var(--color-primary)"
                  : "var(--color-hairline)",
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
