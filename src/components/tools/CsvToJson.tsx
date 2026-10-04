import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useEffect, useCallback, useMemo } from "react";
import ErrorBanner from "../ErrorBanner";
import { parseCsv, csvToRecords } from "../../helpers/csv-conversion";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";

export default function CsvToJson() {
  const { markInteraction, recordSuccess, clearInteraction } = useToolTelemetry();
  const [input, setInput] = useState(
    "id,name,role,email\n1,Alex Rivera,Developer,alex@example.com\n2,Jordan Lee,Designer,jordan@example.com\n3,Taylor Chen,Product Manager,taylor@example.com"
  );
  const [output, setOutput] = useState("");
  const [delimiter, setDelimiter] = useState(",");
  const [hasHeader, setHasHeader] = useState(true);
  const [minify, setMinify] = useState(false);
  const [error, setError] = useState("");
  const [copied, handleCopyToClipboard] = useCopyToClipboard();

  // Run conversion
  useEffect(() => {
    if (!input.trim()) {
      setOutput("");
      setError("");
      return;
    }

    try {
      const parsed = parseCsv(input, delimiter);
      if (parsed.length === 0) {
        setOutput("");
        setError("No valid CSV rows found.");
        return;
      }

      setError("");
      const resultData = csvToRecords(parsed, hasHeader);

      const formatted = minify
        ? JSON.stringify(resultData)
        : JSON.stringify(resultData, null, 2);

      setOutput(formatted);
      if (resultData.length > 0) recordSuccess("convert");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to parse CSV data.");
      setOutput("");
    }
  }, [input, delimiter, hasHeader, minify, recordSuccess]);

  // Compute table preview (limit to first 10 rows for safety)
  const previewData = useMemo(() => {
    if (!input.trim() || error) return null;
    try {
      const parsed = parseCsv(input, delimiter);
      return parsed.slice(0, 10);
    } catch {
      return null;
    }
  }, [input, delimiter, error]);

  const handleCopy = useCallback(() => {
    handleCopyToClipboard(output);
  }, [output, handleCopyToClipboard]);

  const handleDownload = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "data.json";
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, [output]);

  const handleClear = () => {
    clearInteraction();
    setInput("");
    setOutput("");
    setError("");
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input area */}
        <div className="flex flex-col">
          <label htmlFor="csv-input" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            CSV Source Text
          </label>
          <textarea
            id="csv-input"
            value={input}
            onChange={(e) => { markInteraction(); setInput(e.target.value); }}
            placeholder="name,email,phone&#10;John,john@example.com,555-0199&#10;Jane,jane@example.com,555-0120"
            rows={10}
            className="w-full p-4 border rounded-lg text-sm resize-y outline-none transition-colors duration-150 flex-1 min-h-[260px]"
            style={{
              backgroundColor: "var(--color-canvas-soft)",
              borderColor: "var(--color-hairline)",
              color: "var(--color-ink)",
              fontFamily: "var(--font-mono)",
            }}
            spellCheck={false}
          />
        </div>

        {/* Output Area */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>
              JSON Output
            </span>
            {output && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-xs px-2.5 py-1.5 rounded transition-colors duration-150"
                  style={{
                    color: copied ? "var(--color-success)" : "var(--color-link)",
                    backgroundColor: "var(--color-canvas-soft-2)",
                  }}
                >
                  {copied ? "Copied" : "Copy JSON"}
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="text-xs px-2.5 py-1.5 rounded transition-colors duration-150 border"
                  style={{
                    borderColor: "var(--color-hairline)",
                    color: "var(--color-body)",
                    backgroundColor: "var(--color-canvas)",
                  }}
                >
                  Download
                </button>
              </div>
            )}
          </div>
          <textarea
            readOnly
            value={output}
            placeholder="Your structured JSON array of objects will appear here..."
            rows={10}
            className="w-full p-4 border rounded-lg text-sm resize-y outline-none transition-colors duration-150 flex-1 min-h-[260px]"
            style={{
              backgroundColor: "var(--color-canvas-soft-2)",
              borderColor: error ? "var(--color-error)" : "var(--color-hairline)",
              color: "var(--color-ink)",
              fontFamily: "var(--font-mono)",
            }}
            spellCheck={false}
          />
        </div>
      </div>

      <ErrorBanner message={error} />

      {/* Configurations panel */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-lg border" style={{ borderColor: "var(--color-hairline)", backgroundColor: "var(--color-canvas)" }}>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <label htmlFor="csv-delimiter" className="text-xs font-medium" style={{ color: "var(--color-mute)" }}>
              Delimiter:
            </label>
            <select
              id="csv-delimiter"
              value={delimiter}
              onChange={(e) => setDelimiter(e.target.value)}
              className="text-xs px-2 py-1.5 rounded border outline-none"
              style={{
                backgroundColor: "var(--color-canvas)",
                borderColor: "var(--color-hairline)",
                color: "var(--color-ink)",
              }}
            >
              <option value=",">Comma (,)</option>
              <option value=";">Semicolon (;)</option>
              <option value="&#9;">Tab (\t)</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-xs font-medium cursor-pointer" style={{ color: "var(--color-ink)" }}>
            <input
              type="checkbox"
              checked={hasHeader}
              onChange={(e) => setHasHeader(e.target.checked)}
              className="rounded"
              style={{ accentColor: "var(--color-violet)" }}
            />
            <span>First Row is Header</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-medium cursor-pointer" style={{ color: "var(--color-ink)" }}>
            <input
              type="checkbox"
              checked={minify}
              onChange={(e) => setMinify(e.target.checked)}
              className="rounded"
              style={{ accentColor: "var(--color-violet)" }}
            />
            <span>Minify JSON</span>
          </label>
        </div>

        <button
          type="button"
          onClick={handleClear}
          className="text-xs px-3 py-1.5 rounded transition-colors duration-150 border"
          style={{
            borderColor: "var(--color-hairline)",
            color: "var(--color-mute)",
          }}
        >
          Clear
        </button>
      </div>

      {/* Grid Live Preview */}
      {previewData && previewData.length > 0 && (
        <div className="space-y-2">
          <span className="block text-sm font-medium" style={{ color: "var(--color-ink)" }}>
            Data Table Preview (First {previewData.length} Rows)
          </span>
          <div className="border rounded-lg overflow-hidden max-w-full overflow-x-auto" style={{ borderColor: "var(--color-hairline)" }}>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr style={{ backgroundColor: "var(--color-canvas-soft-2)", borderBottom: "1px solid var(--color-hairline)" }}>
                  {hasHeader ? (
                    previewData[0].map((header, idx) => (
                      <th key={idx} className="p-3 font-semibold" style={{ color: "var(--color-ink)" }}>{header || `field_${idx + 1}`}</th>
                    ))
                  ) : (
                    previewData[0].map((_, idx) => (
                      <th key={idx} className="p-3 font-semibold" style={{ color: "var(--color-ink)" }}>Column {idx + 1}</th>
                    ))
                  )}
                </tr>
              </thead>
              <tbody>
                {(hasHeader ? previewData.slice(1) : previewData).map((row, rIdx) => (
                  <tr key={rIdx} style={{ borderBottom: "1px solid var(--color-hairline)", backgroundColor: "var(--color-canvas)" }}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-3 font-mono truncate max-w-[180px]" style={{ color: "var(--color-body)" }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
