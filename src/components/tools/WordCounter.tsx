import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useMemo, useEffect } from "react";

/**
 * WordCounter — counts words, characters, sentences, paragraphs, and reading time.
 */
export default function WordCounter() {
  const { markInteraction, recordSuccess, clearInteraction } = useToolTelemetry();
  const [text, setText] = useState("");

  const s = useMemo(() => {
    const trimmed = text.trim();
    if (!trimmed) return { words: 0, characters: 0, charsNoSpaces: 0, sentences: 0, paragraphs: 0, readingTime: "0 min" };

    const words = trimmed.split(/\s+/).filter(Boolean).length;
    const characters = text.length;
    const charsNoSpaces = text.replace(/\s/g, "").length;
    const sentences = trimmed.split(/[.!?]+/).filter((s) => s.trim()).length;
    const paragraphs = trimmed.split(/\n\s*\n/).filter((p) => p.trim()).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    const readingTime = `${minutes} min`;

    return { words, characters, charsNoSpaces, sentences, paragraphs, readingTime };
  }, [text]);

  useEffect(() => {
    if (text.trim().length > 0 && s.words > 0) recordSuccess("analyze");
  }, [text, s, recordSuccess]);

  return (
    <div onChangeCapture={markInteraction} className="space-y-6">
      <div>
        <label htmlFor="wc-input" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
          Enter your text
        </label>
        <textarea
          id="wc-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or type your text here…"
          rows={8}
          className="w-full p-4 border rounded-lg text-base resize-y outline-none transition-colors duration-150"
          style={{
            backgroundColor: "var(--color-canvas-soft)",
            borderColor: "var(--color-hairline)",
            color: "var(--color-ink)",
            fontFamily: "var(--font-sans)",
          }}
          spellCheck={false}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Words", value: s.words },
          { label: "Characters", value: s.characters },
          { label: "No spaces", value: s.charsNoSpaces },
          { label: "Sentences", value: s.sentences },
          { label: "Paragraphs", value: s.paragraphs },
          { label: "Reading time", value: s.readingTime },
        ].map((item) => (
          <div
            key={item.label}
            className="p-3 rounded-lg text-center"
            style={{
              backgroundColor: "var(--color-canvas-soft-2)",
            }}
          >
            <div className="text-2xl font-semibold" style={{ color: "var(--color-ink)", letterSpacing: "-0.96px" }}>
              {item.value}
            </div>
            <div className="text-xs mt-1" style={{ color: "var(--color-mute)" }}>
              {item.label}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => { clearInteraction(); setText(""); }}
          className="btn-secondary btn-sm"
          style={{ borderColor: "var(--color-hairline)", color: "var(--color-ink)", backgroundColor: "var(--color-canvas)" }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
