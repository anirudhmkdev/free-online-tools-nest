import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useEffect } from "react";
import { marked } from "marked";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";
import { sanitizeHtml } from "../../helpers/utils";
import ErrorBanner from "../ErrorBanner";

export default function MarkdownToHtml() {
  const { markInteraction, recordSuccess, clearInteraction } = useToolTelemetry();
  const [input, setInput] = useState(
    "# Markdown Guide\n\nWrite your **markdown** content here! You can add:\n\n* Bulleted lists\n* Bold and italic styling\n* [Links](https://freeonlinetoolsnest.com)\n\n## Custom Table Example\n\n| Tool Name | Speed | Usefulness |\n| :--- | :--- | :--- |\n| Markdown to HTML | Instant | 10/10 |\n| CSV to JSON | Fast | 10/10 |\n\n```javascript\n// Code highlight blocks\nconst greeting = 'Hello, developer!';\nconsole.log(greeting);\n```"
  );
  const [outputHtml, setOutputHtml] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"preview" | "html">("preview");
  const [copied, handleCopy] = useCopyToClipboard();

  // Compile Markdown to HTML
  useEffect(() => {
    let active = true;
    if (!input.trim()) {
      setOutputHtml("");
      setError("");
      return;
    }
    try {
      // Configure marked to break lines; sanitize the generated HTML before previewing it.
      const parsed = marked.parse(input, {
        gfm: true,
        breaks: true,
      });
      // Resolve potential Promise (marked.parse can return string or Promise depending on options/async plugins)
      if (typeof parsed === "string") {
        const html = sanitizeHtml(parsed);
        setOutputHtml(html);
        setError("");
        if (html.trim()) recordSuccess("convert");
      } else {
        parsed.then((res) => {
          if (!active) return;
          const html = sanitizeHtml(res);
          setOutputHtml(html); setError("");
          if (html.trim()) recordSuccess("convert");
        }).catch(() => {
          if (!active) return;
          setOutputHtml("");
          setError("Error parsing markdown content.");
        });
      }
    } catch {
      setOutputHtml("");
      setError("Error parsing markdown content.");
    }
    return () => { active = false; };
  }, [input, recordSuccess]);



  const handleClear = () => {
    clearInteraction();
    setInput("");
    setOutputHtml("");
  };

  return (
    <div onChangeCapture={markInteraction} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor (Markdown Input) */}
        <div className="flex flex-col">
          <label htmlFor="md-input" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            Markdown Input
          </label>
          <textarea
            id="md-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your markdown here..."
            rows={12}
            className="w-full p-4 border rounded-lg text-sm resize-y outline-none transition-colors duration-150 flex-1 min-h-[350px]"
            style={{
              backgroundColor: "var(--color-canvas-soft)",
              borderColor: "var(--color-hairline)",
              color: "var(--color-ink)",
              fontFamily: "var(--font-mono)",
            }}
            spellCheck={false}
          />
        </div>

        {/* Viewer (HTML Output or Preview) */}
        <div className="flex flex-col">
          {/* Header tabs */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex rounded-lg overflow-hidden border text-xs" style={{ borderColor: "var(--color-hairline)" }}>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className="px-3 py-1.5 font-medium transition-colors duration-150"
                style={{
                  backgroundColor: activeTab === "preview" ? "var(--color-primary)" : "var(--color-canvas)",
                  color: activeTab === "preview" ? "var(--color-on-primary)" : "var(--color-body)",
                }}
              >
                Live Preview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("html")}
                className="px-3 py-1.5 font-medium transition-colors duration-150"
                style={{
                  backgroundColor: activeTab === "html" ? "var(--color-primary)" : "var(--color-canvas)",
                  color: activeTab === "html" ? "var(--color-on-primary)" : "var(--color-body)",
                }}
              >
                HTML Source
              </button>
            </div>

            {outputHtml && (
              <button
                type="button"
                onClick={() => handleCopy(outputHtml)}
                className="text-xs px-2.5 py-1.5 rounded transition-colors duration-150"
                style={{
                  color: copied ? "var(--color-success)" : "var(--color-link)",
                  backgroundColor: "var(--color-canvas-soft-2)",
                }}
              >
                {copied ? "Copied" : "Copy HTML"}
              </button>
            )}
          </div>

          {activeTab === "preview" ? (
            <div
              className="w-full p-6 border rounded-lg text-sm overflow-y-auto overflow-x-auto flex-1 min-h-[350px] max-h-[500px]"
              style={{
                backgroundColor: "var(--color-canvas)",
                borderColor: "var(--color-hairline)",
                color: "var(--color-ink)",
              }}
            >
              {outputHtml ? (
                <div
                  className="prose dark:prose-invert max-w-none text-left"
                  style={{
                    lineHeight: "1.6",
                  }}
                  dangerouslySetInnerHTML={{ __html: outputHtml }}
                />
              ) : (
                <span className="italic" style={{ color: "var(--color-mute)" }}>
                  Preview output will appear here...
                </span>
              )}
            </div>
          ) : (
            <textarea
              readOnly
              value={outputHtml}
              placeholder="Your compiled HTML code will appear here..."
              rows={12}
              className="w-full p-4 border rounded-lg text-sm resize-y outline-none transition-colors duration-150 flex-1 min-h-[350px]"
              style={{
                backgroundColor: "var(--color-canvas-soft-2)",
                borderColor: "var(--color-hairline)",
                color: "var(--color-ink)",
                fontFamily: "var(--font-mono)",
              }}
              spellCheck={false}
            />
          )}
        </div>
      </div>

      <ErrorBanner message={error} />

      {/* Footer controls */}
      <div className="flex justify-end gap-3">
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
