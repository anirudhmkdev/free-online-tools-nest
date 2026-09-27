import { useState, useCallback } from "react";

import { summarize, type ScoredSentence } from "../../helpers/text-summarizer";
import ErrorBanner from "../ErrorBanner";

export default function TextSummarizer() {
  const [error, setError] = useState("");
  const [input, setInput] = useState("");
  const [summary, setSummary] = useState<ScoredSentence[]>([]);
  const [sentenceCount, setSentenceCount] = useState(6);
  const [copied, setCopied] = useState(false);

  const handleSummarize = useCallback(() => {
    setSummary([]);
    setError("");
    try {
      if (!input.trim()) throw new Error("Enter English text to select sentences.");
      const result = summarize(input, sentenceCount);
      if (!result.length) throw new Error("Enter at least one sentence containing words.");
      setSummary(result);
    } catch (error) { setError(error instanceof Error ? error.message : "Unable to select sentences."); }
  }, [input, sentenceCount]);

  const handleCopy = useCallback(() => {
    const text = summary.map((s) => s.text).join(" ");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => setError("Copy failed. Select the summary text and copy it manually."));
  }, [summary]);

  const inputWords = input.trim() ? input.trim().split(/\s+/).length : 0;
  const summaryWords = summary.reduce((sum, s) => sum + s.text.split(/\s+/).length, 0);
  const compressionPct =
    inputWords > 0 ? Math.round((1 - summaryWords / inputWords) * 100) : 0;

  return (
    <div className="space-y-6">
      <p className="text-sm">Selects existing English sentences by word frequency and preserves their order. It does not understand meaning or rewrite text. Check omitted context, quotations and facts against your source. Abbreviations can split sentences incorrectly.</p>
      <ErrorBanner message={error} />
      {/* Input */}
      <div>
        <label
          htmlFor="summarize-input"
          className="block text-sm font-medium mb-2"
          style={{ color: "var(--color-ink)" }}
        >
          Text to Summarize
        </label>
        <textarea
          id="summarize-input"
          rows={8}
          value={input}
          onChange={(e) => { setInput(e.target.value); setSummary([]); setError(""); }}
          placeholder="Paste or type a long article, document, or paragraph here..."
          className="w-full p-4 border rounded-lg text-base outline-none resize-y transition-colors duration-150 font-sans"
          style={{
            backgroundColor: "var(--color-canvas-soft)",
            borderColor: "var(--color-hairline)",
            color: "var(--color-ink)",
          }}
        />
        <div
          className="text-xs mt-1"
          style={{ color: "var(--color-mute)" }}
        >
          {inputWords.toLocaleString()} words
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <label
            htmlFor="summary-length"
            className="block text-xs font-medium mb-1"
            style={{ color: "var(--color-body)" }}
          >
            Summary length
          </label>
          <select
            id="summary-length"
            value={sentenceCount}
            onChange={(e) => { setSentenceCount(Number(e.target.value)); setSummary([]); }}
            className="h-10 px-3 border rounded-lg text-sm outline-none"
            style={{
              backgroundColor: "var(--color-canvas-soft)",
              borderColor: "var(--color-hairline)",
              color: "var(--color-ink)",
            }}
          >
            <option value={3}>Short (3 sentences)</option>
            <option value={6}>Medium (6 sentences)</option>
            <option value={10}>Long (10 sentences)</option>
          </select>
        </div>

        <button
          type="button"
          onClick={handleSummarize}
          className="btn-primary btn-sm self-end"
          style={{
            backgroundColor: "var(--color-primary)",
            color: "var(--color-on-primary)",
          }}
        >
          Summarize
        </button>
      </div>

      {/* Results */}
      {summary.length > 0 && (
        <div
          className="p-6 rounded-lg"
          style={{ backgroundColor: "var(--color-canvas-soft-2)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <span
              className="text-xs uppercase tracking-wider"
              style={{
                color: "var(--color-mute)",
                fontFamily: "var(--font-mono)",
              }}
            >
              Summary
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="text-xs font-medium px-3 py-1 rounded-full border transition-colors duration-150"
              style={{
                color: copied ? "var(--color-success)" : "var(--color-body)",
                borderColor: copied
                  ? "var(--color-success)"
                  : "var(--color-hairline)",
              }}
            >
              {copied ? "Copied!" : "Copy summary"}
            </button>
          </div>

          <div
            className="text-base leading-relaxed space-y-3"
            style={{ color: "var(--color-ink)" }}
          >
            {summary.map((s, i) => (
              <p key={i}>{s.text}</p>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-4 pt-4 border-t flex flex-wrap gap-6 text-sm">
            <div>
              <span style={{ color: "var(--color-mute)" }}>Original: </span>
              <span
                className="font-semibold"
                style={{ color: "var(--color-ink)" }}
              >
                {inputWords.toLocaleString()} words
              </span>
            </div>
            <div>
              <span style={{ color: "var(--color-mute)" }}>Summary: </span>
              <span
                className="font-semibold"
                style={{ color: "var(--color-ink)" }}
              >
                {summaryWords.toLocaleString()} words
              </span>
            </div>
            <div>
              <span style={{ color: "var(--color-mute)" }}>Compression: </span>
              <span
                className="font-semibold"
                style={{ color: "var(--color-success)" }}
              >
                -{compressionPct}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
