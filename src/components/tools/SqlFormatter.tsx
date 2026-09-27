import { useState, useCallback } from "react";
import ErrorBanner from "../ErrorBanner";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";

import { formatSql } from "../../helpers/sql-formatter";

export default function SqlFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [indentSize, setIndentSize] = useState(2);
  const [error, setError] = useState("");
  const [copied, handleCopy] = useCopyToClipboard();

  const format = useCallback(() => {
    if (!input.trim()) {
      setOutput("");
      setError("");
      return;
    }
    try {
      const formatted = formatSql(input.trim(), indentSize);
      setOutput(formatted);
      setError("");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to format SQL.");
      setOutput("");
    }
  }, [input, indentSize]);

  const handleClear = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  return (
    <div className="space-y-6">
      <p className="text-sm">Heuristic SQL formatting, not syntax validation or execution. Quoted values and comments are preserved. Dollar quotes, nested comments and backslash-escaped strings are rejected; use your database’s dialect-aware formatter for those features.</p>
      <div>
        <label htmlFor="sql-input" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
          Paste your SQL query
        </label>
        <textarea
          id="sql-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="SELECT id, name, email FROM users WHERE status = 'active' ORDER BY created_at DESC;"
          rows={8}
          className="w-full p-4 border rounded-lg text-sm resize-y outline-none transition-colors duration-150"
          style={{
            backgroundColor: "var(--color-canvas-soft)",
            borderColor: "var(--color-hairline)",
            color: "var(--color-ink)",
            fontFamily: "var(--font-mono)",
          }}
          spellCheck={false}
        />
      </div>

      <ErrorBanner message={error} />

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
          onClick={handleClear}
          className="text-xs px-3 py-1.5 rounded transition-colors duration-150 border"
          style={{
            borderColor: "var(--color-hairline)",
            color: "var(--color-mute)",
          }}
        >
          Clear
        </button>

        <div className="flex items-center gap-2 ml-auto">
          <label htmlFor="sql-indent" className="text-xs" style={{ color: "var(--color-mute)" }}>
            Indent
          </label>
          <select
            id="sql-indent"
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
          </select>
        </div>
      </div>

      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>Formatted SQL</span>
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
