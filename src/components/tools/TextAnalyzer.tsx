import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useMemo, useEffect } from "react";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";

type CaseMode = "upper" | "lower" | "title" | "sentence" | "camel" | "alternating";

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
    case "alternating":
      return [...text].map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join("");
    default:
      return text;
  }
}

export default function TextAnalyzer() {
  const { markInteraction, recordSuccess } = useToolTelemetry();
  const [text, setText] = useState("");
  const [activeMode, setActiveMode] = useState<CaseMode | null>(null);
  const [copied, handleCopy] = useCopyToClipboard();

  const stats = useMemo(() => {
    const trimmed = text.trim();
    if (!trimmed) {
      return {
        words: 0,
        characters: 0,
        charsNoSpaces: 0,
        sentences: 0,
        paragraphs: 0,
        readingTime: "0 min",
        speakingTime: "0 min",
      };
    }
    const words = trimmed.split(/\s+/).filter(Boolean).length;
    const characters = text.length;
    const charsNoSpaces = text.replace(/\s/g, "").length;
    const sentences = trimmed.split(/[.!?]+/).filter((s) => s.trim()).length;
    const paragraphs = trimmed.split(/\n\s*\n/).filter((p) => p.trim()).length;
    const readingMinutes = Math.max(1, Math.ceil(words / 200));
    const speakingMinutes = Math.max(1, Math.ceil(words / 130));
    return {
      words,
      characters,
      charsNoSpaces,
      sentences,
      paragraphs,
      readingTime: `${readingMinutes} min`,
      speakingTime: `${speakingMinutes} min`,
    };
  }, [text]);

  const resultText = useMemo(() => {
    if (!activeMode || !text) return "";
    return convertCase(text, activeMode);
  }, [text, activeMode]);

  const modes: { key: CaseMode; label: string }[] = [
    { key: "upper", label: "UPPERCASE" },
    { key: "lower", label: "lowercase" },
    { key: "title", label: "Title Case" },
    { key: "sentence", label: "Sentence case" },
    { key: "camel", label: "camelCase" },
    { key: "alternating", label: "aLtErNaTiNg" },
  ];

  useEffect(() => {
    if (text.trim().length > 0 && stats.words > 0) recordSuccess("analyze");
  }, [text, stats, recordSuccess]);

  return (
    <div onChangeCapture={markInteraction} className="space-y-6">
      {/* Input */}
      <div>
        <label htmlFor="ta-input" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
          Enter your text
        </label>
        <textarea
          id="ta-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your text here..."
          rows={8}
          className="w-full p-4 border rounded-lg text-base resize-y outline-none transition-colors duration-150"
          style={{
            backgroundColor: "var(--color-canvas-soft)",
            borderColor: "var(--color-hairline)",
            color: "var(--color-ink)",
            fontFamily: "var(--font-sans)",
          }}
        />
      </div>

      {/* Stats grid */}
      <div>
        <span className="block text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--color-mute)", fontFamily: "var(--font-mono)" }}>
          Text Statistics
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Words", value: stats.words },
            { label: "Characters", value: stats.characters },
            { label: "No spaces", value: stats.charsNoSpaces },
            { label: "Sentences", value: stats.sentences },
            { label: "Paragraphs", value: stats.paragraphs },
            { label: "Reading time", value: stats.readingTime },
          ].map((item) => (
            <div
              key={item.label}
              className="p-3 rounded-lg text-center"
              style={{ backgroundColor: "var(--color-canvas-soft-2)" }}
            >
              <div className="text-xl font-semibold" style={{ color: "var(--color-ink)", letterSpacing: "-0.96px" }}>
                {item.value}
              </div>
              <div className="text-xs mt-1" style={{ color: "var(--color-mute)" }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional stats row */}
      {text.trim() && (
        <div className="flex flex-wrap gap-6 text-sm" style={{ color: "var(--color-body)" }}>
          <span>Speaking time: <strong style={{ color: "var(--color-ink)" }}>{stats.speakingTime}</strong></span>
          <span>Paragraphs: <strong style={{ color: "var(--color-ink)" }}>{stats.paragraphs}</strong></span>
        </div>
      )}

      {/* Case conversion */}
      <div>
        <span className="block text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--color-mute)", fontFamily: "var(--font-mono)" }}>
          Convert Case
        </span>
        <div className="flex flex-wrap gap-2">
          {modes.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setActiveMode(m.key)}
              className="px-3 py-1.5 text-sm rounded-full border transition-all duration-150"
              style={{
                backgroundColor: activeMode === m.key ? "var(--color-primary)" : "var(--color-canvas)",
                color: activeMode === m.key ? "var(--color-on-primary)" : "var(--color-body)",
                borderColor: activeMode === m.key ? "var(--color-primary)" : "var(--color-hairline)",
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Result */}
      {resultText && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>
              Converted Text
            </span>
            <button
              type="button"
              onClick={() => handleCopy(resultText)}
              className="text-sm px-3 py-1 rounded-md transition-colors duration-150"
              style={{
                color: copied ? "var(--color-success)" : "var(--color-link)",
                backgroundColor: "var(--color-canvas-soft-2)",
              }}
            >
              {copied ? "Copied" : "Copy Result"}
            </button>
          </div>
          <div
            className="p-4 rounded-lg text-base whitespace-pre-wrap break-words"
            style={{
              backgroundColor: "var(--color-canvas-soft-2)",
              color: "var(--color-ink)",
              fontFamily: "var(--font-sans)",
              border: "1px solid var(--color-hairline)",
              minHeight: "80px",
            }}
          >
            {resultText}
          </div>
        </div>
      )}
    </div>
  );
}
