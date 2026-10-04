import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useCallback, useMemo, useEffect } from "react";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";

type Mode = "ts-to-date" | "date-to-ts";

const MODES: { key: Mode; label: string }[] = [
  { key: "ts-to-date", label: "Timestamp → Date" },
  { key: "date-to-ts", label: "Date → Timestamp" },
];

function detectPrecision(value: string): { multiplier: number; label: string } {
  const clean = value.replace(/[^0-9]/g, "");
  if (clean.length >= 16) return { multiplier: 1e-6, label: "Microseconds" };
  if (clean.length >= 13) return { multiplier: 1, label: "Milliseconds" };
  return { multiplier: 1000, label: "Seconds" };
}

function formatRelative(ms: number): string {
  const diff = Date.now() - ms;
  const abs = Math.abs(diff);
  const suffix = diff >= 0 ? "ago" : "from now";
  const seconds = Math.floor(abs / 1000);
  if (seconds < 60) return `${seconds}s ${suffix}`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${suffix}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${suffix}`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ${suffix}`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ${suffix}`;
  const years = Math.floor(days / 365);
  return `${years}y ${suffix}`;
}

interface DateFields {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  second: string;
}

export function dateFieldsToTimestamp(fields: DateFields): number | null {
  if (!Object.values(fields).every(value => /^\d+$/.test(value))) return null;
  const y = Number(fields.year), m = Number(fields.month), d = Number(fields.day);
  const h = Number(fields.hour), min = Number(fields.minute), sec = Number(fields.second);
  if (![y, m, d, h, min, sec].every(Number.isSafeInteger)
    || m < 1 || m > 12 || d < 1 || d > 31 || h > 23 || min > 59 || sec > 59) return null;
  const result = new Date(0);
  result.setUTCFullYear(y, m - 1, d);
  result.setUTCHours(h, min, sec, 0);
  if (!Number.isFinite(result.getTime()) || result.getUTCFullYear() !== y
    || result.getUTCMonth() !== m - 1 || result.getUTCDate() !== d) return null;
  return result.getTime();
}

function formatDateInput(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${h}:${min}`;
}

export default function EpochConverter() {
  const { markInteraction, recordSuccess, clearInteraction } = useToolTelemetry();
  const [mode, setMode] = useState<Mode>("ts-to-date");
  const [tsInput, setTsInput] = useState("");
  const [dateFields, setDateFields] = useState<DateFields>(() => {
    const now = new Date();
    return {
      year: now.getUTCFullYear().toString(),
      month: String(now.getUTCMonth() + 1).padStart(2, "0"),
      day: String(now.getUTCDate()).padStart(2, "0"),
      hour: "12",
      minute: "00",
      second: "00",
    };
  });
  const [dtInput, setDtInput] = useState(() => formatDateInput(new Date()));
  const [copied, handleCopy] = useCopyToClipboard();
  const [now, setNow] = useState(Date.now());

  const refreshNow = useCallback(() => setNow(Date.now()), []);

  const precision = useMemo(() => detectPrecision(tsInput), [tsInput]);

  const tsResult = useMemo(() => {
    if (!tsInput.trim()) return null;
    const clean = tsInput.trim();
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(clean)) return null;
    const num = parseFloat(clean);
    if (isNaN(num)) return null;
    let ms: number;
    if (precision.multiplier === 1) {
      ms = num;
    } else if (precision.multiplier === 1000) {
      ms = num * 1000;
    } else {
      ms = num / 1000;
    }
    const d = new Date(ms);
    if (isNaN(d.getTime())) return null;
    return {
      utc: d.toUTCString(),
      iso: d.toISOString(),
      local: d.toLocaleString(),
      relative: formatRelative(d.getTime()),
      ms: d.getTime(),
    };
  }, [tsInput, precision]);

  const dtResult = useMemo(() => {
    let ms: number | null;
    if (dtInput) {
      const parsed = Date.parse(dtInput);
      ms = isNaN(parsed) ? null : parsed;
    } else {
      ms = dateFieldsToTimestamp(dateFields);
    }
    if (ms === null || !Number.isFinite(ms)) return null;
    return {
      seconds: Math.floor(ms / 1000),
      milliseconds: ms,
    };
  }, [dtInput, dateFields]);

  const handleFieldChange = (field: keyof DateFields, value: string) => {
    markInteraction();
    setDateFields((prev) => ({ ...prev, [field]: value }));
    setDtInput("");
  };

  const handleDtChange = (value: string) => {
    if (value) markInteraction(); else clearInteraction();
    setDtInput(value);
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setDateFields({
          year: d.getUTCFullYear().toString(),
          month: String(d.getUTCMonth() + 1).padStart(2, "0"),
          day: String(d.getUTCDate()).padStart(2, "0"),
          hour: String(d.getUTCHours()).padStart(2, "0"),
          minute: String(d.getUTCMinutes()).padStart(2, "0"),
          second: String(d.getUTCSeconds()).padStart(2, "0"),
        });
      }
    }
  };

  useEffect(() => {
    if (mode === "ts-to-date" ? tsResult !== null : dtResult !== null) recordSuccess("convert");
  }, [mode, tsResult, dtResult, recordSuccess]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => { clearInteraction(); setMode(m.key); }}
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

      {mode === "ts-to-date" ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="epoch-ts" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
              Enter Unix Timestamp
            </label>
            <input
              id="epoch-ts"
              type="text"
              value={tsInput}
              onChange={(e) => { markInteraction(); setTsInput(e.target.value); }}
              placeholder="1700000000"
              className="w-full h-12 px-4 border rounded-lg text-base outline-none font-mono transition-colors duration-150"
              style={{
                backgroundColor: "var(--color-canvas-soft)",
                borderColor: "var(--color-hairline)",
                color: "var(--color-ink)",
                fontFamily: "var(--font-mono)",
              }}
              spellCheck={false}
              inputMode="numeric"
            />
          </div>

          {tsInput.trim() && (
            <div className="text-xs" style={{ color: "var(--color-mute)" }}>
              Detected as {precision.label}
            </div>
          )}

          {tsResult && (
            <div className="space-y-2">
              {[
                { label: "UTC", value: tsResult.utc },
                { label: "ISO 8601", value: tsResult.iso },
                { label: "Local Time", value: tsResult.local },
                { label: "Relative Time", value: tsResult.relative },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg gap-1"
                  style={{ backgroundColor: "var(--color-canvas-soft-2)" }}
                >
                  <span
                    className="text-xs uppercase tracking-wider"
                    style={{ color: "var(--color-mute)", fontFamily: "var(--font-mono)" }}
                  >
                    {item.label}
                  </span>
                  <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                    <code className="text-sm break-all" style={{ color: "var(--color-ink)", fontFamily: "var(--font-mono)" }}>
                      {item.value}
                    </code>
                    <button
                      type="button"
                      onClick={() => handleCopy(item.value)}
                      className="text-xs px-2 py-1 rounded transition-colors duration-150 shrink-0"
                      style={{ color: copied ? "var(--color-success)" : "var(--color-link)" }}
                    >
                      {copied ? "\u2713" : "Copy"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label htmlFor="epoch-dt" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
              Pick Date & Time
            </label>
            <input
              id="epoch-dt"
              type="datetime-local"
              value={dtInput}
              onChange={(e) => handleDtChange(e.target.value)}
              className="w-full h-12 px-4 border rounded-lg text-base outline-none transition-colors duration-150"
              style={{
                backgroundColor: "var(--color-canvas-soft)",
                borderColor: "var(--color-hairline)",
                color: "var(--color-ink)",
              }}
            />
          </div>

          <div className="text-xs text-center" style={{ color: "var(--color-mute)" }}>
            — or enter individual fields —
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { key: "year" as const, label: "Year", placeholder: "2024" },
              { key: "month" as const, label: "Month", placeholder: "1" },
              { key: "day" as const, label: "Day", placeholder: "15" },
              { key: "hour" as const, label: "Hour", placeholder: "12" },
              { key: "minute" as const, label: "Minute", placeholder: "0" },
              { key: "second" as const, label: "Second", placeholder: "0" },
            ].map((field) => (
              <div key={field.key}>
                <label htmlFor={`epoch-${field.key}`} className="block text-xs font-medium mb-1" style={{ color: "var(--color-ink)" }}>
                  {field.label}
                </label>
                <input
                  id={`epoch-${field.key}`}
                  type="number"
                  value={dateFields[field.key]}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full h-10 px-3 border rounded-lg text-sm outline-none transition-colors duration-150 font-mono"
                  style={{
                    backgroundColor: "var(--color-canvas-soft)",
                    borderColor: "var(--color-hairline)",
                    color: "var(--color-ink)",
                    fontFamily: "var(--font-mono)",
                  }}
                  inputMode="numeric"
                />
              </div>
            ))}
          </div>

          {dtResult && (
            <div className="space-y-2">
              {[
                { label: "Seconds (10-digit)", value: dtResult.seconds.toString() },
                { label: "Milliseconds (13-digit)", value: dtResult.milliseconds.toString() },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg gap-1"
                  style={{ backgroundColor: "var(--color-canvas-soft-2)" }}
                >
                  <span
                    className="text-xs uppercase tracking-wider"
                    style={{ color: "var(--color-mute)", fontFamily: "var(--font-mono)" }}
                  >
                    {item.label}
                  </span>
                  <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                    <code className="text-sm break-all" style={{ color: "var(--color-ink)", fontFamily: "var(--font-mono)" }}>
                      {item.value}
                    </code>
                    <button
                      type="button"
                      onClick={() => handleCopy(item.value)}
                      className="text-xs px-2 py-1 rounded transition-colors duration-150 shrink-0"
                      style={{ color: copied ? "var(--color-success)" : "var(--color-link)" }}
                    >
                      {copied ? "\u2713" : "Copy"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="p-4 rounded-lg flex items-center justify-between gap-4" style={{ backgroundColor: "var(--color-canvas-soft-2)" }}>
        <div>
          <span className="text-xs uppercase tracking-wider" style={{ color: "var(--color-mute)", fontFamily: "var(--font-mono)" }}>
            Current Timestamp (ms)
          </span>
          <div suppressHydrationWarning className="text-lg font-semibold font-mono" style={{ color: "var(--color-ink)", fontFamily: "var(--font-mono)" }}>
            {now}
          </div>
        </div>
        <button
          type="button"
          onClick={refreshNow}
          className="btn-secondary btn-sm shrink-0"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
