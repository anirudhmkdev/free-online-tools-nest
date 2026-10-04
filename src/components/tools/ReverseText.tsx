import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useMemo, useEffect } from "react";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";

function reverseChars(text: string): string {
  return text.split("").reverse().join("");
}

function reverseWords(text: string): string {
  return text.split(/\s+/).reverse().join(" ");
}

function reverseBoth(text: string): string {
  return text
    .split(/\s+/)
    .reverse()
    .map((word) => word.split("").reverse().join(""))
    .join(" ");
}

export default function ReverseText() {
  const { markInteraction, recordSuccess } = useToolTelemetry();
  const [text, setText] = useState("");
  const [copiedChar, handleCopyChar] = useCopyToClipboard();
  const [copiedWords, handleCopyWords] = useCopyToClipboard();
  const [copiedBoth, handleCopyBoth] = useCopyToClipboard();

  const resultChar = useMemo(() => reverseChars(text), [text]);
  const resultWords = useMemo(() => reverseWords(text), [text]);
  const resultBoth = useMemo(() => reverseBoth(text), [text]);

  useEffect(() => {
    if (text.trim().length > 0 && resultChar.length > 0) recordSuccess("convert");
  }, [text, resultChar, recordSuccess]);

  return (
    <div onChangeCapture={markInteraction} className="space-y-6">
      <div>
        <label htmlFor="reverse-input" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
          Enter text to reverse
        </label>
        <textarea
          id="reverse-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Hello World"
          rows={4}
          className="w-full p-4 border rounded-lg text-base resize-y outline-none transition-colors duration-150"
          style={{
            backgroundColor: "var(--color-canvas-soft)",
            borderColor: "var(--color-hairline)",
            color: "var(--color-ink)",
          }}
          spellCheck={false}
        />
      </div>

      {text && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--color-canvas-soft-2)" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--color-mute)" }}>
                Reverse Characters
              </span>
              <button
                type="button"
                onClick={() => handleCopyChar(resultChar)}
                className="text-xs px-2 py-1 rounded transition-colors duration-150"
                style={{
                  color: copiedChar ? "var(--color-success)" : "var(--color-link)",
                }}
              >
                {copiedChar ? "Copied" : "Copy"}
              </button>
            </div>
            <code className="text-base break-all" style={{ color: "var(--color-ink)", fontFamily: "var(--font-mono)" }}>
              {resultChar}
            </code>
          </div>

          <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--color-canvas-soft-2)" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--color-mute)" }}>
                Reverse Words
              </span>
              <button
                type="button"
                onClick={() => handleCopyWords(resultWords)}
                className="text-xs px-2 py-1 rounded transition-colors duration-150"
                style={{
                  color: copiedWords ? "var(--color-success)" : "var(--color-link)",
                }}
              >
                {copiedWords ? "Copied" : "Copy"}
              </button>
            </div>
            <code className="text-base break-all" style={{ color: "var(--color-ink)", fontFamily: "var(--font-mono)" }}>
              {resultWords}
            </code>
          </div>

          <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--color-canvas-soft-2)" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--color-mute)" }}>
                Reverse Both
              </span>
              <button
                type="button"
                onClick={() => handleCopyBoth(resultBoth)}
                className="text-xs px-2 py-1 rounded transition-colors duration-150"
                style={{
                  color: copiedBoth ? "var(--color-success)" : "var(--color-link)",
                }}
              >
                {copiedBoth ? "Copied" : "Copy"}
              </button>
            </div>
            <code className="text-base break-all" style={{ color: "var(--color-ink)", fontFamily: "var(--font-mono)" }}>
              {resultBoth}
            </code>
          </div>
        </div>
      )}
    </div>
  );
}
