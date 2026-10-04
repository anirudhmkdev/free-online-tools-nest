import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useEffect } from "react";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";

/**
 * CaseConverter — convert text between 5 case modes.
 */
type CaseMode = "upper" | "lower" | "title" | "sentence" | "camel";

const MODES: { key: CaseMode; label: string }[] = [
  { key: "upper", label: "UPPERCASE" },
  { key: "lower", label: "lowercase" },
  { key: "title", label: "Title Case" },
  { key: "sentence", label: "Sentence case" },
  { key: "camel", label: "camelCase" },
];

function convertCase(text: string, mode: CaseMode): string {
  switch (mode) {
    case "upper":
      return text.toUpperCase();
    case "lower":
      return text.toLowerCase();
    case "title":
      return text.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    case "sentence":
      return text.toLowerCase().replace(/(^\s*|[.!?]\s+)(\w)/g, (_, pre, ch) => pre + ch.toUpperCase());
    case "camel":
      return text
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)/g, (_, ch) => ch.toUpperCase())
        .replace(/^[A-Z]/, (ch) => ch.toLowerCase());
    default:
      return text;
  }
}

export default function CaseConverter() {
  const { markInteraction, recordSuccess } = useToolTelemetry();
  const [text, setText] = useState("");
  const [mode, setMode] = useState<CaseMode>("upper");
  const [copied, handleCopy] = useCopyToClipboard();

  const result = convertCase(text, mode);

  useEffect(() => {
    if (text.trim() && result) recordSuccess("convert");
  }, [text, result, recordSuccess]);

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="case-input" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
          Enter your text
        </label>
        <textarea
          id="case-input"
          value={text}
          onChange={(e) => { markInteraction(); setText(e.target.value); }}
          placeholder="Type or paste text to convert…"
          rows={5}
          className="w-full p-4 border rounded-lg text-base resize-y outline-none transition-colors duration-150"
          style={{
            backgroundColor: "var(--color-canvas-soft)",
            borderColor: "var(--color-hairline)",
            color: "var(--color-ink)",
            fontFamily: "var(--font-sans)",
          }}
        />
      </div>

      {/* Mode selector */}
      <div className="flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => setMode(m.key)}
            className="px-3 py-1.5 text-sm rounded-full border transition-all duration-150"
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

      {/* Output */}
      {text && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>Result</span>
            <button
              type="button"
              onClick={() => handleCopy(result)}
              className="text-sm px-3 py-1 rounded-md transition-colors duration-150"
              style={{
                color: copied ? "var(--color-success)" : "var(--color-link)",
                backgroundColor: "var(--color-canvas-soft-2)",
              }}
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <div
            className="p-4 rounded-lg text-base whitespace-pre-wrap break-words"
            style={{
              backgroundColor: "var(--color-canvas-soft-2)",
              color: "var(--color-ink)",
              fontFamily: "var(--font-sans)",
              minHeight: "80px",
            }}
          >
            {result}
          </div>
        </div>
      )}
    </div>
  );
}
