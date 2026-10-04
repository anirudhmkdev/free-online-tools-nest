import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useCallback } from "react";

const LBS_TO_KG = 0.453592;

export default function LbsToKgConverter() {
  const { markInteraction, recordSuccess } = useToolTelemetry();
  const [lbs, setLbs] = useState("");
  const [kg, setKg] = useState("");

  const handleLbsChange = useCallback((value: string) => {
    markInteraction();
    setLbs(value);
    if (value === "" || value === ".") {
      setKg("");
      return;
    }
    const num = parseFloat(value);
    if (isNaN(num)) return;
    setKg((num * LBS_TO_KG).toFixed(2));
    if (Number.isFinite(num * LBS_TO_KG)) recordSuccess("convert");
  }, [markInteraction, recordSuccess]);

  const handleKgChange = useCallback((value: string) => {
    markInteraction();
    setKg(value);
    if (value === "" || value === ".") {
      setLbs("");
      return;
    }
    const num = parseFloat(value);
    if (isNaN(num)) return;
    setLbs((num / LBS_TO_KG).toFixed(2));
    if (Number.isFinite(num / LBS_TO_KG)) recordSuccess("convert");
  }, [markInteraction, recordSuccess]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="lbs-input" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            Pounds (lbs)
          </label>
          <div className="relative">
            <input
              id="lbs-input"
              type="number"
              value={lbs}
              onChange={(e) => handleLbsChange(e.target.value)}
              placeholder="0"
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
              lbs
            </span>
          </div>
        </div>

        <div>
          <label htmlFor="kg-input" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            Kilograms (kg)
          </label>
          <div className="relative">
            <input
              id="kg-input"
              type="number"
              value={kg}
              onChange={(e) => handleKgChange(e.target.value)}
              placeholder="0"
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
              kg
            </span>
          </div>
        </div>
      </div>

      {lbs && kg && (
        <div
          className="p-4 rounded-lg text-center text-sm"
          style={{ backgroundColor: "var(--color-canvas-soft-2)", color: "var(--color-body)" }}
        >
          {lbs} lbs = {kg} kg &nbsp;|&nbsp; {kg} kg = {lbs} lbs
        </div>
      )}
    </div>
  );
}
