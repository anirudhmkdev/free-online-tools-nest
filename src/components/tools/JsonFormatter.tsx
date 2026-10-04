import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useCallback } from "react";
import ErrorBanner from "../ErrorBanner";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";

/**
 * JsonFormatter — format, validate, and beautify JSON with error reporting.
 */
export default function JsonFormatter() {
  const { markInteraction, recordSuccess } = useToolTelemetry();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [indentSize, setIndentSize] = useState(2);
  const [copied, handleCopy] = useCopyToClipboard();

  const format = useCallback(() => {
    markInteraction();
    if (!input.trim()) {
      setOutput("");
      setError("");
      return;
    }
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, indentSize));
      recordSuccess("format");
      setError("");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Invalid JSON";
      setError(msg);
      setOutput("");
    }
  }, [input, indentSize, markInteraction, recordSuccess]);

  const minify = useCallback(() => {
    markInteraction();
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      recordSuccess("format");
      setError("");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Invalid JSON";
      setError(msg);
      setOutput("");
    }
  }, [input, markInteraction, recordSuccess]);

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="json-input" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
          Paste your JSON
        </label>
        <textarea
          id="json-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='{"key": "value", "array": [1, 2, 3]}'
          rows={8}
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

      {/* Error display */}
      <ErrorBanner message={error} />

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={format}
          className="btn-primary btn-sm"
          style={{ backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)" }}
        >
          Format
        </button>
        <button
          type="button"
          onClick={minify}
          className="btn-secondary btn-sm"
          style={{ borderColor: "var(--color-hairline)", color: "var(--color-ink)", backgroundColor: "var(--color-canvas)" }}
        >
          Minify
        </button>

        <div className="flex items-center gap-2 ml-auto">
          <label htmlFor="json-indent" className="text-xs" style={{ color: "var(--color-mute)" }}>
            Indent
          </label>
          <select
            id="json-indent"
            value={indentSize}
            onChange={(e) => setIndentSize(parseInt(e.target.value))}
            className="h-8 px-2 text-xs border rounded-md outline-none"
            style={{
              backgroundColor: "var(--color-canvas)",
              borderColor: "var(--color-hairline)",
              color: "var(--color-ink)",
            }}
          >
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
            <option value={1}>Tab</option>
          </select>
        </div>
      </div>

      {/* Output */}
      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>Formatted output</span>
            <button
              type="button"
              onClick={() => handleCopy(output)}
              className="text-sm px-3 py-1 rounded-md transition-colors duration-150"
              style={{
                color: copied ? "var(--color-success)" : "var(--color-link)",
                backgroundColor: "var(--color-canvas-soft-2)",
              }}
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <pre
            className="p-4 rounded-lg text-sm overflow-x-auto max-h-96"
            style={{
              backgroundColor: "var(--color-canvas-soft-2)",
              color: "var(--color-ink)",
              fontFamily: "var(--font-mono)",
              lineHeight: "1.6",
            }}
          >
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}
