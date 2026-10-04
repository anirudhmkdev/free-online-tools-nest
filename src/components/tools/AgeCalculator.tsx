import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useCallback } from "react";

import { computeAge, type AgeResult } from "../../helpers/age-calculator";

export default function AgeCalculator() {
  const { markInteraction, recordSuccess } = useToolTelemetry();
  const [birthDate, setBirthDate] = useState("");
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);
  const [result, setResult] = useState<AgeResult | null>(null);
  const [error, setError] = useState("");

  const calculate = useCallback(() => {
    markInteraction();
    setError("");
    if (!birthDate) {
      setError("Please enter your date of birth.");
      setResult(null);
      return;
    }
    const bd = new Date(birthDate);
    const td = new Date(toDate);
    if (isNaN(bd.getTime()) || isNaN(td.getTime())) {
      setError("Please enter valid dates.");
      setResult(null);
      return;
    }
    if (bd > td) {
      setError("Date of birth cannot be after the target date.");
      setResult(null);
      return;
    }
    setResult(computeAge(bd, td));
    recordSuccess("calculate");
  }, [birthDate, toDate, markInteraction, recordSuccess]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="birthdate" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            Date of Birth
          </label>
          <input
            id="birthdate"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full h-12 px-4 border rounded-lg text-base outline-none transition-colors duration-150"
            style={{
              backgroundColor: "var(--color-canvas-soft)",
              borderColor: "var(--color-hairline)",
              color: "var(--color-ink)",
            }}
          />
        </div>
        <div>
          <label htmlFor="targetdate" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            As of Date
          </label>
          <input
            id="targetdate"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full h-12 px-4 border rounded-lg text-base outline-none transition-colors duration-150"
            style={{
              backgroundColor: "var(--color-canvas-soft)",
              borderColor: "var(--color-hairline)",
              color: "var(--color-ink)",
            }}
          />
        </div>
      </div>

      <p className="text-sm text-body">Calendar months use their last day when the birth day is missing. Weeks and days are the remainder after complete years and months.</p>

      <button
        type="button"
        onClick={calculate}
        className="btn-primary btn-sm"
        style={{ backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)" }}
      >
        Calculate Age
      </button>

      {error && (
        <div className="p-4 rounded-lg text-sm" style={{ backgroundColor: "var(--color-canvas-soft-2)", color: "var(--color-body)" }}>
          {error}
        </div>
      )}

      {result && !error && (
        <div className="p-6 rounded-lg" style={{ backgroundColor: "var(--color-canvas-soft-2)" }}>
          <div className="text-xs uppercase tracking-wider mb-4" style={{ color: "var(--color-mute)", fontFamily: "var(--font-mono)" }}>
            Your Age
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Years", value: result.years },
              { label: "Months", value: result.months },
              { label: "Weeks", value: result.weeks },
              { label: "Days", value: result.days },
            ].map((item) => (
              <div key={item.label} className="text-center p-3 rounded-lg" style={{ backgroundColor: "var(--color-canvas)" }}>
                <div className="text-2xl font-semibold" style={{ color: "var(--color-primary)" }}>
                  {item.value}
                </div>
                <div className="text-xs" style={{ color: "var(--color-mute)" }}>{item.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--color-hairline)" }}>
            <div className="text-xs uppercase tracking-wider mb-3" style={{ color: "var(--color-mute)", fontFamily: "var(--font-mono)" }}>
              Total Duration
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              {[
                { label: "Hours", value: result.hours.toLocaleString() },
                { label: "Minutes", value: result.minutes.toLocaleString() },
                { label: "Seconds", value: result.seconds.toLocaleString() },
              ].map((item) => (
                <div key={item.label} className="text-sm">
                  <span className="font-semibold" style={{ color: "var(--color-ink)" }}>{item.value}</span>{" "}
                  <span style={{ color: "var(--color-mute)" }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
