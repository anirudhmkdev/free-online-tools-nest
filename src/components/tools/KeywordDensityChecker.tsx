import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useMemo, useEffect } from "react";

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "as", "is", "was", "are", "were", "be",
  "been", "being", "have", "has", "had", "do", "does", "did", "will",
  "would", "could", "should", "may", "might", "shall", "can", "not",
  "no", "nor", "it", "its", "it's", "i", "you", "we", "they", "he",
  "she", "this", "that", "these", "those", "am", "so", "if", "than",
  "then", "just", "about", "above", "after", "again", "all", "also",
  "any", "because", "been", "before", "between", "both", "each",
  "few", "into", "like", "more", "most", "much", "my", "other",
  "our", "out", "own", "per", "some", "such", "than", "too", "up",
  "very", "what", "when", "where", "which", "who", "why", "how",
]);

interface KeywordData {
  keyword: string;
  frequency: number;
  density: number;
}

type SortKey = "frequency" | "density";
type SortDir = "asc" | "desc";

export default function KeywordDensityChecker() {
  const { markInteraction, recordSuccess } = useToolTelemetry();
  const [text, setText] = useState("");
  const [minLength, setMinLength] = useState(2);
  const [ignoreStopWords, setIgnoreStopWords] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("frequency");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const words = useMemo(() => {
    const tokens = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
    return tokens;
  }, [text]);

  const filteredWords = useMemo(() => {
    return words.filter((w) => {
      if (w.length < minLength) return false;
      if (ignoreStopWords && STOP_WORDS.has(w)) return false;
      return true;
    });
  }, [words, minLength, ignoreStopWords]);

  const totalWords = words.length;
  const uniqueWords = new Set(words).size;

  const keywordData = useMemo(() => {
    const freq: Record<string, number> = {};
    for (const w of filteredWords) {
      freq[w] = (freq[w] || 0) + 1;
    }
    const entries: KeywordData[] = Object.entries(freq).map(([keyword, frequency]) => ({
      keyword,
      frequency,
      density: totalWords > 0 ? ((frequency / totalWords) * 100) : 0,
    }));
    const multiplier = sortDir === "desc" ? -1 : 1;
    entries.sort((a, b) => {
      if (sortKey === "frequency") return (a.frequency - b.frequency) * multiplier;
      return (a.density - b.density) * multiplier;
    });
    return entries;
  }, [filteredWords, totalWords, sortKey, sortDir]);

  useEffect(() => { if (text.trim() && totalWords > 0) recordSuccess("analyze"); }, [text, totalWords, recordSuccess]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sortArrow = (key: SortKey) => {
    if (sortKey !== key) return "";
    return sortDir === "desc" ? " ↓" : " ↑";
  };

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="kd-input" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
          Paste your content
        </label>
        <textarea
          id="kd-input"
          value={text}
          onChange={(e) => { markInteraction(); setText(e.target.value); }}
          placeholder="Paste or type your text here for keyword density analysis…"
          rows={8}
          className="w-full p-4 border rounded-lg text-sm resize-y outline-none transition-colors duration-150"
          style={{
            backgroundColor: "var(--color-canvas-soft)",
            borderColor: "var(--color-hairline)",
            color: "var(--color-ink)",
          }}
          spellCheck={false}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4 p-3 rounded-lg border" style={{ borderColor: "var(--color-hairline)", backgroundColor: "var(--color-canvas)" }}>
        <div className="flex items-center gap-2">
          <label htmlFor="kd-minlen" className="text-sm" style={{ color: "var(--color-ink)" }}>Min word length:</label>
          <select
            id="kd-minlen"
            value={minLength}
            onChange={(e) => setMinLength(parseInt(e.target.value))}
            className="h-8 px-2 border rounded-md text-sm outline-none"
            style={{ backgroundColor: "var(--color-canvas-soft)", borderColor: "var(--color-hairline)", color: "var(--color-ink)" }}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none" style={{ color: "var(--color-ink)" }}>
          <input
            type="checkbox"
            checked={ignoreStopWords}
            onChange={(e) => setIgnoreStopWords(e.target.checked)}
            className="rounded"
            style={{ accentColor: "var(--color-primary)" }}
          />
          Ignore common words (stop words)
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Words", value: totalWords },
          { label: "Unique Words", value: uniqueWords },
          { label: "Filtered Words", value: filteredWords.length },
          { label: "Unique Keywords", value: keywordData.length },
        ].map((item) => (
          <div
            key={item.label}
            className="p-3 rounded-lg text-center"
            style={{ backgroundColor: "var(--color-canvas-soft-2)" }}
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

      {keywordData.length > 0 && (
        <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--color-hairline)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "var(--color-canvas-soft-2)" }}>
                <th className="px-4 py-2 text-left font-medium" style={{ color: "var(--color-ink)" }}>#</th>
                <th className="px-4 py-2 text-left font-medium" style={{ color: "var(--color-ink)" }}>Keyword</th>
                <th
                  className="px-4 py-2 text-right font-medium cursor-pointer select-none"
                  style={{ color: "var(--color-ink)" }}
                  onClick={() => toggleSort("frequency")}
                >
                  Frequency{sortArrow("frequency")}
                </th>
                <th
                  className="px-4 py-2 text-right font-medium cursor-pointer select-none"
                  style={{ color: "var(--color-ink)" }}
                  onClick={() => toggleSort("density")}
                >
                  Density{sortArrow("density")}
                </th>
                <th className="px-4 py-2 text-right font-medium" style={{ color: "var(--color-ink)" }}>Occurrences</th>
              </tr>
            </thead>
            <tbody>
              {keywordData.slice(0, 100).map((kd, i) => (
                <tr key={kd.keyword} className="border-t" style={{ borderColor: "var(--color-hairline)" }}>
                  <td className="px-4 py-2" style={{ color: "var(--color-mute)" }}>{i + 1}</td>
                  <td className="px-4 py-2 font-medium" style={{ color: "var(--color-ink)" }}>{kd.keyword}</td>
                  <td className="px-4 py-2 text-right" style={{ color: "var(--color-ink)" }}>{kd.frequency}</td>
                  <td className="px-4 py-2 text-right" style={{ color: "var(--color-ink)" }}>{kd.density.toFixed(1)}%</td>
                  <td className="px-4 py-2 text-right">
                    <span
                      className="inline-block h-2 rounded-full"
                      style={{
                        width: `${Math.min(kd.density * 3, 100)}%`,
                        backgroundColor: kd.density > 5 ? "var(--color-error)" : kd.density > 2 ? "var(--color-warning, #d97706)" : "var(--color-link)",
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {keywordData.length > 100 && (
            <div className="px-4 py-2 text-xs text-center" style={{ color: "var(--color-mute)" }}>
              Showing top 100 of {keywordData.length} keywords
            </div>
          )}
        </div>
      )}

      {text && keywordData.length === 0 && (
        <div className="text-sm" style={{ color: "var(--color-mute)" }}>
          No keywords found matching the current filter criteria.
        </div>
      )}
    </div>
  );
}
