import { minifyCss } from "../../helpers/quality-converters";
import ErrorBanner from "../ErrorBanner";
import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useMemo, useEffect } from "react";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";

export default function CssMinifier() {
  const { markInteraction, recordSuccess } = useToolTelemetry();
  const [input, setInput] = useState(
    "/* Primary styles */\n.container {\n  display: flex;\n  flex-direction: row;\n  justify-content: center;\n  align-items: center;\n  margin: 0 auto;\n  padding: 20px;\n}\n\n/* Heading */\n.title {\n  font-size: 24px;\n  font-weight: bold;\n  color: #333333;\n}\n"
  );
  const [copied, handleCopy] = useCopyToClipboard();

  const converted = useMemo(() => { try { return {output:minifyCss(input), error:""}; } catch (error) { return {output:"", error:error instanceof Error ? error.message : "Unable to compact CSS."}; } }, [input]);
  const { output, error } = converted;

  const stats = useMemo(() => {
    const original = input.length;
    const minified = output.length;
    const ratio = original > 0 ? ((original - minified) / original) * 100 : 0;
    const savings = original - minified;
    return {
      original,
      minified,
      ratio: parseFloat(ratio.toFixed(2)),
      savings,
    };
  }, [input, output]);

  useEffect(() => {
    if (input.trim() && output) recordSuccess("format");
  }, [input, output, recordSuccess]);

  return (
    <div className="space-y-6">
      <p className="text-sm">Conservative whitespace compaction. Strings, escapes and CSS math spacing are preserved; comments become empty token separators. This does not validate or optimize CSS rules.</p>
      <ErrorBanner message={error} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="flex flex-col">
          <label htmlFor="css-input" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            Source CSS
          </label>
          <textarea
            id="css-input"
            value={input}
            onChange={(e) => { markInteraction(); setInput(e.target.value); }}
            placeholder="Paste your CSS here..."
            rows={12}
            className="w-full p-4 border rounded-lg text-sm resize-y outline-none transition-colors duration-150 flex-1 min-h-[300px]"
            style={{
              backgroundColor: "var(--color-canvas-soft)",
              borderColor: "var(--color-hairline)",
              color: "var(--color-ink)",
              fontFamily: "var(--font-mono)",
            }}
            spellCheck={false}
          />
        </div>

        {/* Output */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>
              Minified CSS
            </span>
            {output && (
              <button
                type="button"
                onClick={() => handleCopy(output)}
                className="text-xs px-2.5 py-1.5 rounded transition-colors duration-150"
                style={{
                  color: copied ? "var(--color-success)" : "var(--color-link)",
                  backgroundColor: "var(--color-canvas-soft-2)",
                }}
              >
                {copied ? "Copied" : "Copy Output"}
              </button>
            )}
          </div>
          <textarea
            readOnly
            value={output}
            placeholder="Minified CSS will appear here..."
            rows={12}
            className="w-full p-4 border rounded-lg text-sm resize-y outline-none transition-colors duration-150 flex-1 min-h-[300px]"
            style={{
              backgroundColor: "var(--color-canvas-soft-2)",
              borderColor: "var(--color-hairline)",
              color: "var(--color-ink)",
              fontFamily: "var(--font-mono)",
            }}
            spellCheck={false}
          />
        </div>
      </div>

      {/* Stats */}
      {input.trim() && !error && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg text-center" style={{ backgroundColor: "var(--color-canvas-soft-2)" }}>
            <div className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--color-mute)", fontFamily: "var(--font-mono)" }}>
              Original Size
            </div>
            <div className="text-lg font-semibold" style={{ color: "var(--color-ink)" }}>
              {stats.original.toLocaleString()} <span className="text-xs" style={{ color: "var(--color-mute)" }}>chars</span>
            </div>
          </div>
          <div className="p-4 rounded-lg text-center" style={{ backgroundColor: "var(--color-canvas-soft-2)" }}>
            <div className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--color-mute)", fontFamily: "var(--font-mono)" }}>
              Minified Size
            </div>
            <div className="text-lg font-semibold" style={{ color: "var(--color-ink)" }}>
              {stats.minified.toLocaleString()} <span className="text-xs" style={{ color: "var(--color-mute)" }}>chars</span>
            </div>
          </div>
          <div className="p-4 rounded-lg text-center" style={{ backgroundColor: "var(--color-canvas-soft-2)" }}>
            <div className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--color-mute)", fontFamily: "var(--font-mono)" }}>
              Compression Ratio
            </div>
            <div className="text-lg font-semibold" style={{ color: "var(--color-ink)" }}>
              {stats.original > 0 && stats.minified > 0
                ? (stats.original / stats.minified).toFixed(2) + "x"
                : "—"}
            </div>
          </div>
          <div className="p-4 rounded-lg text-center" style={{ backgroundColor: "var(--color-canvas-soft-2)" }}>
            <div className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--color-mute)", fontFamily: "var(--font-mono)" }}>
              Savings
            </div>
            <div className="text-lg font-semibold" style={{ color: "var(--color-success)" }}>
              {stats.ratio}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
