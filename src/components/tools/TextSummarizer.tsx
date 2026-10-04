import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useCallback } from "react";

const STOP_WORDS: Set<string> = new Set([
  "the","a","an","and","or","but","in","on","at","to","for","of","by","with","from",
  "is","are","was","were","be","been","being","have","has","had","do","does","did",
  "will","would","shall","should","may","might","must","i","you","he","she","it",
  "we","they","this","that","these","those","am","its","my","your","his","her",
  "our","their","me","him","us","them","not","no","nor","so","if","as","than",
  "then","up","down","out","off","over","under","again","further","once","here",
  "there","when","where","why","how","all","each","every","both","few","more",
  "most","other","some","such","only","own","same","too","very","just","about",
  "above","after","before","between","through","during","without","within","along",
  "around","among","because","into","onto","upon","also","any","into","now",
]);

function splitSentences(text: string): string[] {
  const raw = text.match(/[^.!?\n]+[.!?\n]*/g);
  return (raw || []).map((s) => s.trim()).filter((s) => s.length > 0);
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 0 && !STOP_WORDS.has(w));
}

interface ScoredSentence {
  text: string;
  score: number;
}

export function summarize(text: string, sentenceCount: number): ScoredSentence[] {
  const sentences = splitSentences(text);
  if (sentences.length === 0) return [];

  // Count word frequencies across the entire text
  const wordFreq: Record<string, number> = {};
  sentences.forEach((s) => {
    tokenize(s).forEach((w) => {
      wordFreq[w] = (wordFreq[w] || 0) + 1;
    });
  });

  // Score each sentence by sum of word frequencies
  const maxFreq = Math.max(...Object.values(wordFreq), 1);
  const scored: ScoredSentence[] = sentences.map((s) => {
    const words = tokenize(s);
    if (words.length === 0) return { text: s, score: 0 };
    const rawScore = words.reduce((sum, w) => sum + (wordFreq[w] || 0), 0);
    const score = rawScore / words.length; // normalize by sentence length
    return { text: s, score };
  });

  // Sort by score descending, take top N, then restore original order
  const topN = [...scored]
    .sort((a, b) => b.score - a.score)
    .slice(0, sentenceCount);
  // Select occurrences, so repeated sentence text cannot expand the requested count.
  const topSet = new Set(topN);
  return scored.filter((sentence) => topSet.has(sentence));
}

export default function TextSummarizer() {
  const { markInteraction, recordSuccess } = useToolTelemetry();
  const [input, setInput] = useState("");
  const [summary, setSummary] = useState<ScoredSentence[]>([]);
  const [sentenceCount, setSentenceCount] = useState(6);
  const [copied, setCopied] = useState(false);

  const handleSummarize = useCallback(() => {
    markInteraction();
    if (!input.trim()) return;
    const result = summarize(input, sentenceCount);
    setSummary(result);
    if (result.length > 0) recordSuccess("analyze");
  }, [input, sentenceCount]);

  const handleCopy = useCallback(() => {
    const text = summary.map((s) => s.text).join(" ");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [summary]);

  const inputWords = input.trim() ? input.trim().split(/\s+/).length : 0;
  const summaryWords = summary.reduce((sum, s) => sum + s.text.split(/\s+/).length, 0);
  const compressionPct =
    inputWords > 0 ? Math.round((1 - summaryWords / inputWords) * 100) : 0;

  return (
    <div onChangeCapture={markInteraction} className="space-y-6">
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
          onChange={(e) => setInput(e.target.value)}
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
            onChange={(e) => setSentenceCount(Number(e.target.value))}
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
