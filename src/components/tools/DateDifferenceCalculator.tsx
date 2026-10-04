import { computeAge } from "../../helpers/age-calculator";
import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useCallback } from "react";

interface DiffResult {
  years: number;
  months: number;
  weeks: number;
  days: number;
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
  isFuture: boolean;
}

export default function DateDifferenceCalculator() {
  const { markInteraction, recordSuccess } = useToolTelemetry();
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [result, setResult] = useState<DiffResult | null>(null);
  const [error, setError] = useState("");

  const calculate = useCallback(() => {
    markInteraction();
    setError("");
    if (!startDate || !endDate) {
      setError("Please select both dates.");
      setResult(null);
      return;
    }
    const sd = new Date(startDate);
    const ed = new Date(endDate);
    if (isNaN(sd.getTime()) || isNaN(ed.getTime())) {
      setError("Please enter valid dates.");
      setResult(null);
      return;
    }
    const [start,end] = sd <= ed ? [sd,ed] : [ed,sd];
    const calendar = computeAge(start,end);
    const totalDays = Math.round((end.getTime() - start.getTime()) / 86400000);
    setResult({years:calendar.years,months:calendar.months,weeks:calendar.weeks,days:calendar.days,totalDays,totalHours:totalDays*24,totalMinutes:totalDays*1440,totalSeconds:totalDays*86400,isFuture:sd>ed});
    recordSuccess("calculate");
  }, [startDate, endDate, markInteraction, recordSuccess]);

  return (
    <div className="space-y-6">
      <p className="text-sm">Elapsed calendar dates, excluding the end date. Calendar months use clamped month-end anniversaries. Hours and seconds assume 24-hour days; business days and time zones are not calculated.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="start-date" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            Start Date
          </label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => { markInteraction(); setStartDate(e.target.value); setResult(null); setError(""); }}
            className="w-full h-12 px-4 border rounded-lg text-base outline-none transition-colors duration-150"
            style={{
              backgroundColor: "var(--color-canvas-soft)",
              borderColor: "var(--color-hairline)",
              color: "var(--color-ink)",
            }}
          />
        </div>
        <div>
          <label htmlFor="end-date" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            End Date
          </label>
          <input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => { markInteraction(); setEndDate(e.target.value); setResult(null); setError(""); }}
            className="w-full h-12 px-4 border rounded-lg text-base outline-none transition-colors duration-150"
            style={{
              backgroundColor: "var(--color-canvas-soft)",
              borderColor: "var(--color-hairline)",
              color: "var(--color-ink)",
            }}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={calculate}
        className="btn-primary btn-sm"
        style={{ backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)" }}
      >
        Calculate Difference
      </button>

      {error && (
        <div className="p-4 rounded-lg text-sm" style={{ backgroundColor: "var(--color-canvas-soft-2)", color: "var(--color-body)" }}>
          {error}
        </div>
      )}

      {result && !error && (
        <div className="p-6 rounded-lg space-y-4" style={{ backgroundColor: "var(--color-canvas-soft-2)" }}>
          <div className="text-xs uppercase tracking-wider" style={{ color: "var(--color-mute)", fontFamily: "var(--font-mono)" }}>
            {result.isFuture ? "Time Until Start Date" : "Duration Between Dates"}
          </div>

          {/* Calendar breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                <div className="text-xs mt-1" style={{ color: "var(--color-mute)" }}>{item.label}</div>
              </div>
            ))}
          </div>

          {/* Total breakdown */}
          <div className="border-t pt-4" style={{ borderColor: "var(--color-hairline)" }}>
            <div className="text-xs uppercase tracking-wider mb-3" style={{ color: "var(--color-mute)", fontFamily: "var(--font-mono)" }}>
              Total
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              {[
                { label: "Days", value: result.totalDays.toLocaleString() },
                { label: "Hours", value: result.totalHours.toLocaleString() },
                { label: "Minutes", value: result.totalMinutes.toLocaleString() },
                { label: "Seconds", value: result.totalSeconds.toLocaleString() },
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
