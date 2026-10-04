import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useCallback, useMemo, useEffect } from "react";
import ErrorBanner from "../ErrorBanner";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";

type Delimiter = "," | ";" | "\t";

function jsonToCsv(
  data: Record<string, unknown>[],
  delimiter: Delimiter,
  includeHeaders: boolean
): string {
  if (data.length === 0) return "";
  const keys = Object.keys(data[0]);
  const lines: string[] = [];

  if (includeHeaders) {
    lines.push(keys.join(delimiter));
  }

  for (const row of data) {
    const values = keys.map((key) => {
      const val = row[key];
      if (val === null || val === undefined) return "";
      const str = String(val);
      if (str.includes(delimiter) || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    });
    lines.push(values.join(delimiter));
  }

  return lines.join("\n");
}

export default function JsonToCsv() {
  const { markInteraction, recordSuccess } = useToolTelemetry();
  const [input, setInput] = useState("");
  const [delimiter, setDelimiter] = useState<Delimiter>(",");
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [error, setError] = useState("");
  const [copied, handleCopy] = useCopyToClipboard();

  const parsed = useMemo(() => {
    if (!input.trim()) return null;
    try {
      const result = JSON.parse(input);
      if (!Array.isArray(result)) {
        setError("Input must be a JSON array of objects.");
        return null;
      }
      if (result.length === 0) {
        setError("Array is empty.");
        return null;
      }
      if (result.some(row => typeof row !== "object" || row === null || Array.isArray(row))) {
        setError("Array must contain objects.");
        return null;
      }
      setError("");
      return result as Record<string, unknown>[];
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Invalid JSON";
      setError(msg);
      return null;
    }
  }, [input]);

  const csv = useMemo(() => {
    if (!parsed) return "";
    return jsonToCsv(parsed, delimiter, includeHeaders);
  }, [parsed, delimiter, includeHeaders]);

  const previewRows = useMemo(() => {
    if (!parsed) return [];
    return parsed.slice(0, 5);
  }, [parsed]);

  const keys = useMemo(() => {
    if (!parsed || parsed.length === 0) return [];
    return Object.keys(parsed[0]);
  }, [parsed]);

  useEffect(() => {
    if (parsed && !error && csv && parsed.every(row => row !== null && typeof row === "object" && !Array.isArray(row))) recordSuccess("convert");
  }, [parsed, error, csv, recordSuccess]);

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="json-csv-input" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
          JSON Input
        </label>
        <textarea
          id="json-csv-input"
          value={input}
          onChange={(e) => { markInteraction(); setInput(e.target.value); }}
          placeholder='[{"name": "Alice", "age": 30}, {"name": "Bob", "age": 25}]'
          rows={6}
          className="w-full p-4 border rounded-lg text-sm resize-y outline-none transition-colors duration-150"
          style={{
            backgroundColor: "var(--color-canvas-soft)",
            borderColor: error ? "var(--color-error)" : "var(--color-hairline)",
            color: "var(--color-ink)",
            fontFamily: "var(--font-mono)",
          }}
          spellCheck={false}
        />
      </div>

      <ErrorBanner message={error} />

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="csv-delimiter" className="text-sm" style={{ color: "var(--color-body)" }}>
            Delimiter
          </label>
          <select
            id="csv-delimiter"
            value={delimiter}
            onChange={(e) => setDelimiter(e.target.value as Delimiter)}
            className="h-8 px-2 text-sm border rounded-md outline-none"
            style={{
              backgroundColor: "var(--color-canvas)",
              borderColor: "var(--color-hairline)",
              color: "var(--color-ink)",
            }}
          >
            <option value=",">Comma</option>
            <option value=";">Semicolon</option>
            <option value="\t">Tab</option>
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm" style={{ color: "var(--color-body)" }}>
          <input
            type="checkbox"
            checked={includeHeaders}
            onChange={(e) => setIncludeHeaders(e.target.checked)}
            className="w-4 h-4 rounded"
            style={{ accentColor: "var(--color-primary)" }}
          />
          Include headers
        </label>
      </div>

      {previewRows.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            Preview ({Math.min(previewRows.length, parsed?.length ?? 0)} of {parsed?.length ?? 0} rows)
          </h3>
          <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--color-hairline)" }}>
            <table className="w-full text-sm" style={{ color: "var(--color-ink)" }}>
              <thead>
                <tr style={{ backgroundColor: "var(--color-canvas-soft-2)" }}>
                  {keys.map((key) => (
                    <th
                      key={key}
                      className="px-3 py-2 text-left font-medium text-xs uppercase tracking-wider"
                      style={{ color: "var(--color-mute)", borderBottom: "1px solid var(--color-hairline)" }}
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, i) => (
                  <tr
                    key={i}
                    style={{
                      backgroundColor: i % 2 === 0 ? "var(--color-canvas)" : "var(--color-canvas-soft)",
                      borderTop: i > 0 ? "1px solid var(--color-hairline)" : undefined,
                    }}
                  >
                    {keys.map((key) => (
                      <td key={key} className="px-3 py-2" style={{ borderTop: i > 0 ? "1px solid var(--color-hairline)" : undefined }}>
                        {row[key] != null ? String(row[key]) : ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {csv && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>CSV Output</span>
            <button
              type="button"
              onClick={() => handleCopy(csv)}
              className="text-sm px-3 py-1 rounded-md transition-colors duration-150"
              style={{
                color: copied ? "var(--color-success)" : "var(--color-link)",
                backgroundColor: "var(--color-canvas-soft-2)",
              }}
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <textarea
            readOnly
            value={csv}
            rows={6}
            className="w-full p-4 border rounded-lg text-sm resize-y outline-none"
            style={{
              backgroundColor: "var(--color-canvas-soft-2)",
              borderColor: "var(--color-hairline)",
              color: "var(--color-ink)",
              fontFamily: "var(--font-mono)",
            }}
            spellCheck={false}
          />
        </div>
      )}
    </div>
  );
}
