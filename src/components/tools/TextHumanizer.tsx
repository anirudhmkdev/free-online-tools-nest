import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useCallback } from "react";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";

type Tone = "formal" | "casual" | "professional" | "creative";

const TONE_OPTIONS: { key: Tone; label: string }[] = [
  { key: "formal", label: "Formal" },
  { key: "casual", label: "Casual" },
  { key: "professional", label: "Professional" },
  { key: "creative", label: "Creative" },
];

const AI_PHRASES: [RegExp, string][] = [
  [/delve (into|deeper)/gi, "explore"],
  [/navigate (the|through|across|this)/gi, "work through"],
  [/landscape/gi, "field"],
  [/leverage/gi, "use"],
  [/synergy/gi, "collaboration"],
  [/paradigm shift/gi, "major change"],
  [/cutting-edge/gi, "modern"],
  [/state-of-the-art/gi, "top-quality"],
  [/seamless/gi, "smooth"],
  [/holistic/gi, "complete"],
  [/game-changer/gi, "breakthrough"],
  [/ecosystem/gi, "system"],
  [/utilize/gi, "use"],
  [/in order to/gi, "to"],
  [/commence/gi, "begin"],
  [/endeavor/gi, "try"],
  [/facilitate/gi, "help"],
  [/implement/gi, "set up"],
  [/optimize/gi, "improve"],
  [/streamline/gi, "simplify"],
  [/robust/gi, "strong"],
  [/scalable/gi, "growing"],
  [/actionable/gi, "useful"],
  [/bespoke/gi, "custom"],
  [/drill down/gi, "go deeper"],
  [/circle back/gi, "revisit"],
  [/touch base/gi, "check in"],
  [/deep dive/gi, "close look"],
  [/bandwidth/gi, "capacity"],
  [/move the needle/gi, "make a difference"],
  [/bleeding-edge/gi, "latest"],
];

const TRANSITIONAL_PHRASES = [
  "Here's the thing: ",
  "What that means is ",
  "So, ",
  "The truth is, ",
  "Think of it this way: ",
  "Let me break that down: ",
  "",
  "",
  "",
];

function replaceAiPhrases(text: string): string {
  let result = text;
  for (const [pattern, replacement] of AI_PHRASES) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

function varySentenceStructures(text: string): string {
  const sentences = text.match(/[^.!?\n]+[.!?]*/g) || [text];
  return sentences
    .map((s, i) => {
      const trimmed = s.trim();
      if (!trimmed || i % 4 !== 0) return trimmed;
      const prefix = TRANSITIONAL_PHRASES[i % TRANSITIONAL_PHRASES.length];
      if (!prefix) return trimmed;
      return prefix + trimmed.charAt(0).toLowerCase() + trimmed.slice(1);
    })
    .filter(Boolean)
    .join(" ");
}

function removeRepetitiveStructures(text: string): string {
  const lines = text.split("\n");
  const seen = new Set<string>();
  return lines
    .filter((line) => {
      const key = line.trim().toLowerCase();
      if (seen.has(key) && key.length > 10) return false;
      seen.add(key);
      return true;
    })
    .join("\n");
}

function humanizeText(text: string, tone: Tone): string {
  let result = text;

  result = replaceAiPhrases(result);
  result = removeRepetitiveStructures(result);

  const textLower = result.toLowerCase();
  const avgWordLen = result.split(/\s+/).filter(Boolean).reduce((sum, w) => sum + w.length, 0) / Math.max(1, result.split(/\s+/).filter(Boolean).length);

  if (tone === "casual") {
    result = result.replace(/\b(cannot|could not|will not|do not|does not|is not|are not|have not|has not)\b/gi, (m) =>
      m === "cannot" ? "can't" : m.toLowerCase().replace(/\s/g, "").replace(/not/, "n't")
    );
    result = varySentenceStructures(result);
    result = result
      .split(". ")
      .map((s, i) => (i % 3 === 1 ? "Honestly, " + s.charAt(0).toLowerCase() + s.slice(1) : s))
      .join(". ");
  }

  if (tone === "formal") {
    result = result.replace(/\b(can't|won't|don't|doesn't|isn't|aren't|haven't|hasn't|didn't)\b/gi, (m) => {
      const map: Record<string, string> = {
        "can't": "cannot", "won't": "will not", "don't": "do not",
        "doesn't": "does not", "isn't": "is not", "aren't": "are not",
        "haven't": "have not", "hasn't": "has not", "didn't": "did not",
      };
      return map[m.toLowerCase()] || m;
    });
    if (avgWordLen < 4 && result.length < 200) {
      result = result.replace(/\b(get|use|make|do|put|take)\b/gi, (m) => {
        const syn: Record<string, string> = {
          get: "obtain", use: "utilize", make: "create", do: "perform",
          put: "place", take: "acquire",
        };
        return syn[m.toLowerCase()] || m;
      });
    }
  }

  if (tone === "professional") {
    const professionalPhrases: [RegExp, string][] = [
      [/^so,/i, "Therefore,"],
      [/^but/i, "However"],
      [/^and/i, "Additionally,"],
    ];
    for (const [pat, repl] of professionalPhrases) {
      result = result.replace(pat, repl);
    }
  }

  if (tone === "creative") {
    result = varySentenceStructures(result);
    result = result.replace(/([.!?])\s+/g, "$1\n\n");
  }

  return result;
}

export default function TextHumanizer() {
  const { markInteraction, recordSuccess } = useToolTelemetry();
  const [input, setInput] = useState("");
  const [tone, setTone] = useState<Tone>("casual");
  const [output, setOutput] = useState("");
  const [hasRun, setHasRun] = useState(false);
  const [copied, handleCopy] = useCopyToClipboard();

  const handleHumanize = useCallback(() => {
    markInteraction();
    if (!input.trim()) return;
    const result = humanizeText(input, tone);
    setOutput(result);
    setHasRun(true);
    if (result.trim()) recordSuccess("convert");
  }, [input, tone]);

  const inputWords = input.trim() ? input.trim().split(/\s+/).filter(Boolean).length : 0;
  const inputChars = input.length;
  const outputWords = output.trim() ? output.trim().split(/\s+/).filter(Boolean).length : 0;
  const outputChars = output.length;

  return (
    <div onChangeCapture={markInteraction} className="space-y-6">
      {/* Input */}
      <div>
        <label htmlFor="th-input" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
          Text to Humanize
        </label>
        <textarea
          id="th-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste AI-generated or stiff text here to make it sound more natural..."
          rows={6}
          className="w-full p-4 border rounded-lg text-base resize-y outline-none transition-colors duration-150"
          style={{
            backgroundColor: "var(--color-canvas-soft)",
            borderColor: "var(--color-hairline)",
            color: "var(--color-ink)",
            fontFamily: "var(--font-sans)",
          }}
        />
        <div className="flex items-center gap-4 mt-1 text-xs" style={{ color: "var(--color-mute)" }}>
          <span>{inputWords} words</span>
          <span>{inputChars} characters</span>
        </div>
      </div>

      {/* Tone selector */}
      <div>
        <span className="block text-xs font-semibold uppercase tracking-wider mb-2.5" style={{ color: "var(--color-mute)", fontFamily: "var(--font-mono)" }}>
          Tone
        </span>
        <div className="flex flex-wrap gap-2">
          {TONE_OPTIONS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTone(t.key)}
              className="px-4 py-2 text-sm rounded-lg border transition-all duration-150"
              style={{
                backgroundColor: tone === t.key ? "var(--color-primary)" : "var(--color-canvas)",
                color: tone === t.key ? "var(--color-on-primary)" : "var(--color-body)",
                borderColor: tone === t.key ? "var(--color-primary)" : "var(--color-hairline)",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Humanize button */}
      <button
        type="button"
        onClick={handleHumanize}
        className="px-6 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150"
        style={{ backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)" }}
      >
        Humanize
      </button>

      {/* Output */}
      {hasRun && output && (
        <div
          className="p-5 rounded-xl"
          style={{
            backgroundColor: "var(--color-canvas-soft)",
            border: "1px solid var(--color-hairline)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>
              Humanized Text
            </span>
            <button
              type="button"
              onClick={() => handleCopy(output)}
              className="text-sm px-3 py-1 rounded-md transition-colors duration-150"
              style={{
                color: copied ? "var(--color-success)" : "var(--color-link)",
                backgroundColor: "var(--color-canvas-soft-2)",
              }}
            >
              {copied ? "Copied" : "Copy Output"}
            </button>
          </div>
          <div
            className="text-base leading-relaxed whitespace-pre-wrap"
            style={{ color: "var(--color-ink)" }}
          >
            {output}
          </div>
          <div className="flex items-center gap-4 mt-3 pt-3 border-t text-xs" style={{ borderColor: "var(--color-hairline)", color: "var(--color-mute)" }}>
            <span>{outputWords} words</span>
            <span>{outputChars} characters</span>
            {inputWords > 0 && (
              <span style={{ color: "var(--color-body)" }}>
                Changed: {outputWords - inputWords > 0 ? "+" : ""}{outputWords - inputWords} words
              </span>
            )}
          </div>
        </div>
      )}

      {hasRun && !output && (
        <div className="py-8 text-center text-sm" style={{ color: "var(--color-mute)" }}>
          Enter text and click Humanize to see the result.
        </div>
      )}
    </div>
  );
}
