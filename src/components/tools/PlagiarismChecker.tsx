import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import React, { useState, useCallback } from "react";
import ErrorBanner from "../ErrorBanner";

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^\w\s']/g, "").replace(/\s+/g, " ").trim();
}

function getNGrams(text: string, n: number): Map<string, number[]> {
  const words = text.split(" ");
  const ngrams = new Map<string, number[]>();
  for (let i = 0; i <= words.length - n; i++) {
    const phrase = words.slice(i, i + n).join(" ");
    const positions = ngrams.get(phrase) || [];
    positions.push(i);
    ngrams.set(phrase, positions);
  }
  return ngrams;
}

function findMatchingRanges(
  textA: string,
  textB: string,
  minGram: number = 3
): { rangesA: Set<number>; rangesB: Set<number>; similarity: number } {
  const normA = normalizeText(textA);
  const normB = normalizeText(textB);

  if (!normA || !normB) {
    return { rangesA: new Set(), rangesB: new Set(), similarity: 0 };
  }

  const wordsA = normA.split(" ");
  const wordsB = normB.split(" ");

  const ngramsA = getNGrams(normA, minGram);
  const ngramsB = getNGrams(normB, minGram);

  const rangesA = new Set<number>();
  const rangesB = new Set<number>();

  let matchCount = 0;
  for (const [phrase, positionsA] of ngramsA) {
    const positionsB = ngramsB.get(phrase);
    if (positionsB) {
      const words = phrase.split(" ");
      for (const posA of positionsA) {
        for (let w = 0; w < words.length; w++) rangesA.add(posA + w);
      }
      for (const posB of positionsB) {
        for (let w = 0; w < words.length; w++) rangesB.add(posB + w);
      }
      matchCount += words.length * Math.min(positionsA.length, positionsB.length);
    }
  }

  const totalWords = Math.max(wordsA.length, wordsB.length);
  const similarity = totalWords > 0 ? Math.round((matchCount / totalWords) * 100) : 0;

  return { rangesA, rangesB, similarity: Math.min(similarity, 100) };
}

function renderHighlightedText(
  text: string,
  matchedRanges: Set<number>
): (string | React.ReactNode)[] {
  const words = normalizeText(text).split(" ");
  const originalWords = text.split(/\s+/);
  const result: (string | React.ReactNode)[] = [];
  let inMatch = false;
  let span: React.ReactNode = null;
  let spanWords: string[] = [];

  for (let i = 0; i < words.length; i++) {
    if (matchedRanges.has(i)) {
      if (!inMatch) {
        inMatch = true;
        spanWords = [originalWords[i]];
      } else {
        spanWords.push(originalWords[i]);
      }
    } else {
      if (inMatch) {
        result.push(
          <mark key={`m-${i}`} className="rounded px-0.5" style={{ backgroundColor: "rgba(234, 179, 8, 0.35)", color: "inherit" }}>
            {spanWords.join(" ")}
          </mark>
        );
        inMatch = false;
      }
      result.push(<span key={`w-${i}`}> {originalWords[i]} </span>);
    }
  }
  if (inMatch) {
    result.push(
      <mark key="m-last" className="rounded px-0.5" style={{ backgroundColor: "rgba(234, 179, 8, 0.35)", color: "inherit" }}>
        {spanWords.join(" ")}
      </mark>
    );
  }
  return result;
}

export default function PlagiarismChecker() {
  const { markInteraction, recordSuccess, clearInteraction } = useToolTelemetry();
  const [textA, setTextA] = useState("");
  const [textB, setTextB] = useState("");
  const [similarity, setSimilarity] = useState<number | null>(null);
  const [rangesA, setRangesA] = useState<Set<number>>(new Set());
  const [rangesB, setRangesB] = useState<Set<number>>(new Set());
  const [error, setError] = useState("");

  const handleCompare = useCallback(() => {
    markInteraction();
    if (!textA.trim() || !textB.trim()) {
      setError("Please enter text in both fields.");
      setSimilarity(null);
      return;
    }
    setError("");
    const result = findMatchingRanges(textA, textB, 3);
    setSimilarity(result.similarity);
    setRangesA(result.rangesA);
    setRangesB(result.rangesB);
    recordSuccess("analyze");
  }, [textA, textB]);

  const handleClear = useCallback(() => {
    clearInteraction();
    setTextA("");
    setTextB("");
    setSimilarity(null);
    setRangesA(new Set());
    setRangesB(new Set());
    setError("");
  }, []);

  const getSimilarityColor = (score: number): string => {
    if (score >= 75) return "var(--color-error)";
    if (score >= 40) return "rgb(234, 179, 8)";
    return "var(--color-success)";
  };

  const getSimilarityLabel = (score: number): string => {
    if (score >= 75) return "High similarity — review carefully";
    if (score >= 40) return "Moderate similarity — check highlighted sections";
    return "Low similarity — likely original";
  };

  return (
    <div onChangeCapture={markInteraction} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <label htmlFor="plag-text-a" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            Original text
          </label>
          <textarea
            id="plag-text-a"
            value={textA}
            onChange={(e) => setTextA(e.target.value)}
            placeholder="Paste the original text here..."
            rows={10}
            className="w-full p-4 border rounded-lg text-sm resize-y outline-none transition-colors duration-150 flex-1 min-h-[200px]"
            style={{
              backgroundColor: "var(--color-canvas-soft)",
              borderColor: "var(--color-hairline)",
              color: "var(--color-ink)",
            }}
            spellCheck={false}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="plag-text-b" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            Text to compare
          </label>
          <textarea
            id="plag-text-b"
            value={textB}
            onChange={(e) => setTextB(e.target.value)}
            placeholder="Paste the text you want to check..."
            rows={10}
            className="w-full p-4 border rounded-lg text-sm resize-y outline-none transition-colors duration-150 flex-1 min-h-[200px]"
            style={{
              backgroundColor: "var(--color-canvas-soft)",
              borderColor: "var(--color-hairline)",
              color: "var(--color-ink)",
            }}
            spellCheck={false}
          />
        </div>
      </div>

      <ErrorBanner message={error} />

      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-lg border" style={{ borderColor: "var(--color-hairline)", backgroundColor: "var(--color-canvas)" }}>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleCompare}
            className="btn-primary btn-sm"
            style={{ backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)" }}
          >
            Compare texts
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="text-xs px-3 py-1.5 rounded transition-colors duration-150 border"
            style={{ borderColor: "var(--color-hairline)", color: "var(--color-mute)" }}
          >
            Clear
          </button>
        </div>
      </div>

      {similarity !== null && (
        <div className="space-y-4">
          <div
            className="p-6 rounded-lg border space-y-4"
            style={{ borderColor: "var(--color-hairline)", backgroundColor: "var(--color-canvas-soft)" }}
          >
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold" style={{ color: "var(--color-ink)" }}>
                Similarity: {similarity}%
              </span>
              <span
                className="text-sm font-medium px-3 py-1 rounded-full"
                style={{
                  backgroundColor: getSimilarityColor(similarity) + "20",
                  color: getSimilarityColor(similarity),
                }}
              >
                {getSimilarityLabel(similarity)}
              </span>
            </div>

            <div
              className="w-full h-3 rounded-full overflow-hidden"
              style={{ backgroundColor: "var(--color-hairline)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${similarity}%`,
                  backgroundColor: getSimilarityColor(similarity),
                }}
              />
            </div>
          </div>

          {(rangesA.size > 0 || rangesB.size > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <span className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
                  Original text — <span className="text-xs" style={{ color: "var(--color-mute)" }}>highlighted matches</span>
                </span>
                <div
                  className="p-4 rounded-lg border text-sm leading-relaxed overflow-y-auto max-h-60"
                  style={{
                    backgroundColor: "var(--color-canvas-soft)",
                    borderColor: "var(--color-hairline)",
                    color: "var(--color-ink)",
                  }}
                >
                  {rangesA.size > 0
                    ? renderHighlightedText(textA, rangesA)
                    : textA.split(/\s+/).map((w, i) => <span key={i}> {w} </span>)}
                </div>
              </div>
              <div>
                <span className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
                  Compared text — <span className="text-xs" style={{ color: "var(--color-mute)" }}>highlighted matches</span>
                </span>
                <div
                  className="p-4 rounded-lg border text-sm leading-relaxed overflow-y-auto max-h-60"
                  style={{
                    backgroundColor: "var(--color-canvas-soft)",
                    borderColor: "var(--color-hairline)",
                    color: "var(--color-ink)",
                  }}
                >
                  {rangesB.size > 0
                    ? renderHighlightedText(textB, rangesB)
                    : textB.split(/\s+/).map((w, i) => <span key={i}> {w} </span>)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
