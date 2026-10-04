import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useCallback } from "react";
import { formatHtmlNodes } from "../../helpers/html-formatting";
import ErrorBanner from "../ErrorBanner";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";

export default function HtmlFormatter() {
  const { markInteraction, recordSuccess, clearInteraction } = useToolTelemetry();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [indentSize, setIndentSize] = useState("2");
  const [error, setError] = useState("");
  const [copied, handleCopy] = useCopyToClipboard();

  const processHtmlString = useCallback((htmlStr: string, indentVal: string, minify = false) => {
    markInteraction();
    if (!htmlStr.trim()) {
      setOutput("");
      setError("");
      return;
    }
    try {
      const indent = indentVal === "tab" ? "\t" : " ".repeat(parseInt(indentVal, 10));
      const doc = new DOMParser().parseFromString(htmlStr, "text/html");
      const fullDocument = /<(?:html|body|head)\b/i.test(htmlStr);
      const nodes = fullDocument
        ? [doc.doctype, doc.documentElement].filter((node): node is DocumentType | HTMLElement => Boolean(node))
        : [...Array.from(doc.head.childNodes), ...Array.from(doc.body.childNodes)];
      const formatted = formatHtmlNodes(nodes, indent, minify);
      setOutput(formatted);
      setError("");
      if (formatted) recordSuccess("format");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to format HTML.");
      setOutput("");
    }
  }, [markInteraction, recordSuccess]);

  const handleClear = () => {
    clearInteraction();
    setInput("");
    setOutput("");
    setError("");
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Card */}
        <div className="flex flex-col">
          <label htmlFor="html-input" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            Source HTML
          </label>
          <textarea
            id="html-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="<div class='hero'><h1>Hello World</h1><p>Messy HTML code here...</p></div>"
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

        {/* Output Card */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>
              Formatted HTML
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
            placeholder="Your beautified or minified HTML output will appear here..."
            rows={12}
            className="w-full p-4 border rounded-lg text-sm resize-y outline-none transition-colors duration-150 flex-1 min-h-[300px]"
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

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-lg border" style={{ borderColor: "var(--color-hairline)", backgroundColor: "var(--color-canvas)" }}>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="indent-size" className="text-xs font-medium" style={{ color: "var(--color-mute)" }}>
              Indentation:
            </label>
            <select
              id="indent-size"
              value={indentSize}
              onChange={(e) => setIndentSize(e.target.value)}
              className="text-xs px-2 py-1.5 rounded border outline-none"
              style={{
                backgroundColor: "var(--color-canvas)",
                borderColor: "var(--color-hairline)",
                color: "var(--color-ink)",
              }}
            >
              <option value="2">2 Spaces</option>
              <option value="4">4 Spaces</option>
              <option value="8">8 Spaces</option>
              <option value="tab">Tab</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => processHtmlString(input, indentSize)}
              className="btn-primary btn-sm"
              style={{ backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)" }}
            >
              Beautify
            </button>
            <button
              type="button"
              onClick={() => processHtmlString(input, indentSize, true)}
              className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-150 border"
              style={{
                backgroundColor: "var(--color-canvas)",
                borderColor: "var(--color-hairline)",
                color: "var(--color-body)",
              }}
            >
              Minify
            </button>
          </div>
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
    </div>
  );
}
