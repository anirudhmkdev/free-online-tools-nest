import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useCallback } from "react";
import ErrorBanner from "../ErrorBanner";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";
import { formatSql as formatSqlCode } from "../../helpers/sql-formatter";

/** Preserve literal, identifier and comment bytes while formatting surrounding SQL. */
function protectSqlSegments(sql: string): { code: string; restore: (value: string) => string } {
  let prefix = "\uE000";
  while (sql.includes(prefix)) prefix += "\uE000";
  const segments: string[] = [];
  let code = "";
  let i = 0;
  while (i < sql.length) {
    const start = i;
    const quote = sql[i];
    if (quote === "'" || quote === '"' || quote === "`" || quote === "[") {
      const closing = quote === "[" ? "]" : quote;
      let closed = false;
      i++;
      while (i < sql.length) {
        if (sql[i] === "\\" && quote !== "[") { i += 2; continue; }
        if (sql[i] === closing) {
          if (sql[i + 1] === closing) { i += 2; continue; }
          i++;
          closed = true;
          break;
        }
        i++;
      }
      if (!closed) throw new Error("Unterminated SQL quote or identifier.");
    } else if (sql.startsWith("--", i) || (quote === "#" && (i === 0 || /\s/.test(sql[i - 1])))) {
      // Include the original line ending, so a following statement cannot enter the comment.
      while (i < sql.length && sql[i] !== "\n" && sql[i] !== "\r") i++;
      if (sql[i] === "\r") i++;
      if (sql[i] === "\n") i++;
    } else if (sql.startsWith("/*", i)) {
      let depth = 1;
      i += 2;
      while (i < sql.length && depth > 0) {
        if (sql.startsWith("/*", i)) { depth++; i += 2; }
        else if (sql.startsWith("*/", i)) { depth--; i += 2; }
        else i++;
      }
      if (depth > 0) throw new Error("Unterminated SQL comment.");
    } else if (quote === "$" && /^\$(?:[A-Za-z_][A-Za-z0-9_]*)?\$/.test(sql.slice(i))) {
      const delimiter = sql.slice(i).match(/^\$(?:[A-Za-z_][A-Za-z0-9_]*)?\$/)![0];
      const closing = sql.indexOf(delimiter, i + delimiter.length);
      if (closing < 0) throw new Error("Unterminated dollar-quoted SQL string.");
      i = closing + delimiter.length;
    } else {
      code += sql[i++];
      continue;
    }
    const index = segments.push(sql.slice(start, i)) - 1;
    code += `${prefix}${index}\uE001`;
  }
  return {
    code,
    restore: value => value.replace(new RegExp(`${prefix}(\\d+)\uE001`, "g"), (_, index: string) => segments[Number(index)]),
  };
}

export function formatSql(sql: string, indentSpaces: number): string {
  // The shared formatter retains its restricted dialect contract. Mask opaque
  // segments first so its code formatting cannot inspect or alter their bytes.
  const protectedSql = protectSqlSegments(sql);
  return protectedSql.restore(formatSqlCode(protectedSql.code, indentSpaces));
}

export default function SqlFormatter() {
  const { markInteraction, recordSuccess, clearInteraction } = useToolTelemetry();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [indentSize, setIndentSize] = useState(2);
  const [error, setError] = useState("");
  const [copied, handleCopy] = useCopyToClipboard();

  const format = useCallback(() => {
    markInteraction();
    if (!input.trim()) {
      setOutput("");
      setError("");
      return;
    }
    try {
      const formatted = formatSql(input, indentSize);
      setOutput(formatted);
      if (formatted.trim()) recordSuccess("format");
      setError("");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to format SQL.");
      setOutput("");
    }
  }, [input, indentSize, markInteraction, recordSuccess]);

  const handleClear = () => {
    clearInteraction();
    setInput("");
    setOutput("");
    setError("");
  };

  return (
    <div onChangeCapture={markInteraction} className="space-y-6">
      <p className="text-sm">Heuristic SQL formatting, not syntax validation or execution. Quoted values, identifiers, comments and dollar-quoted bodies are preserved as entered. Unterminated segments are rejected. Check dialect-specific syntax with your database’s formatter.</p>
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
