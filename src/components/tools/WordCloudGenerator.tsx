import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useCallback, useRef, useEffect } from "react";
import ErrorBanner from "../ErrorBanner";

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of",
  "by", "with", "from", "as", "is", "was", "are", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could", "should",
  "may", "might", "shall", "can", "need", "dare", "ought", "used",
  "it", "its", "it's", "this", "that", "these", "those", "i", "me", "my", "we",
  "our", "you", "your", "he", "him", "his", "she", "her", "they", "them", "their",
  "what", "which", "who", "whom", "when", "where", "why", "how",
  "not", "no", "nor", "neither", "so", "if", "then", "than", "too", "very",
  "just", "about", "above", "after", "again", "all", "also", "any", "because",
  "before", "between", "both", "each", "few", "more", "most", "much", "must",
  "other", "over", "same", "some", "such", "only", "own", "into", "through",
  "during", "before", "after", "up", "down", "out", "off", "under", "again",
  "further", "once", "here", "there", "every", "don't", "doesn't", "didn't",
  "won't", "wouldn't", "shouldn't", "can't", "couldn't", "isn't", "aren't",
  "wasn't", "weren't", "haven't", "hasn't", "hadn't", "let's",
]);

const PALETTES: Record<string, string[]> = {
  Ocean: ["#1e3a5f", "#3b7dd8", "#6ab0e6", "#9ac8eb", "#c5e0f5"],
  Forest: ["#1b4332", "#2d6a4f", "#40916c", "#52b788", "#95d5b2"],
  Sunset: ["#6b1a2a", "#c0392b", "#e67e22", "#f39c12", "#f1c40f"],
  Monochrome: ["#1a1a2e", "#16213e", "#0f3460", "#533483", "#e94560"],
  Pastel: ["#f8edd9", "#e8d2c4", "#d6b4b0", "#b5a8b1", "#a5a3b6"],
};

const CANVAS_SIZE = 600;

interface WordEntry {
  text: string;
  count: number;
  size: number;
}

function getWordFrequencies(text: string, maxWords: number): WordEntry[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z\s'-]/g, "")
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));

  const freq = new Map<string, number>();
  words.forEach(w => {
    const clean = w.replace(/^['-]+|['-]+$/g, "");
    if (clean.length > 2) freq.set(clean, (freq.get(clean) || 0) + 1);
  });

  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxWords)
    .map(([text, count]) => ({ text, count, size: 0 }));
}

function drawWordCloud(
  canvas: HTMLCanvasElement,
  words: WordEntry[],
  palette: string[],
  bgColor: string,
  textColor: string
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;

  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, w, h);

  if (words.length === 0) {
    ctx.fillStyle = textColor;
    ctx.font = "16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("No words to display. Enter some text to generate a word cloud.", w / 2, h / 2);
    return false;
  }

  const maxCount = words[0].count;
  const minCount = words[words.length - 1].count;
  const range = Math.max(maxCount - minCount, 1);

  const placed: { x: number; y: number; width: number; height: number; text: string; color: string }[] = [];

  for (let i = 0; i < words.length; i++) {
    const ratio = (words[i].count - minCount) / range;
    const fontSize = 14 + ratio * 52;
    const font = `${Math.round(fontSize * 1.2)}px "Segoe UI", Arial, sans-serif`;

    ctx.font = font;
    const metrics = ctx.measureText(words[i].text);
    const textWidth = metrics.width;
    const textHeight = fontSize * 1.2;

    const color = palette[i % palette.length];

    let x: number;
    let y: number;
    let placedOk = false;

    for (let attempt = 0; attempt < 400; attempt++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 60 + attempt * 8;
      x = w / 2 + Math.cos(angle) * radius - textWidth / 2;
      y = h / 2 + Math.sin(angle) * radius;

      const pad = 4;
      let overlap = false;
      for (const p of placed) {
        if (
          x + pad < p.x + p.width &&
          x + textWidth + pad > p.x &&
          y + pad < p.y + p.height &&
          y + textHeight + pad > p.y
        ) {
          overlap = true;
          break;
        }
      }

      if (!overlap && x > 0 && x + textWidth < w && y > 0 && y + textHeight < h) {
        placedOk = true;
        break;
      }
    }

    if (!placedOk) continue;

    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textBaseline = "top";
    ctx.fillText(words[i].text, x!, y!);

    placed.push({ x: x!, y: y!, width: textWidth, height: textHeight, text: words[i].text, color });
  }
  return placed.length > 0;
}

export default function WordCloudGenerator() {
  const { markInteraction, recordSuccess, clearInteraction } = useToolTelemetry();
  const [input, setInput] = useState("");
  const [maxWords, setMaxWords] = useState(50);
  const [paletteName, setPaletteName] = useState("Ocean");
  const [error, setError] = useState("");
  const [wordEntries, setWordEntries] = useState<WordEntry[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const generate = useCallback(() => {
    markInteraction();
    if (!input.trim()) {
      setError("Please enter some text to generate a word cloud.");
      return;
    }
    setError("");
    const entries = getWordFrequencies(input, maxWords);
    if (entries.length === 0) {
      setError("No significant words found. Try entering longer or more text.");
      return;
    }
    setWordEntries(entries);
  }, [input, maxWords]);

  useEffect(() => {
    if (wordEntries.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const palette = PALETTES[paletteName] || PALETTES.Ocean;
    // Read CSS custom property values so the canvas adapts to dark mode
    const style = getComputedStyle(canvas);
    const bgColor = style.getPropertyValue("--color-canvas").trim() || "#ffffff";
    const textColor = style.getPropertyValue("--color-ink").trim() || "#333333";
    if (drawWordCloud(canvas, wordEntries, palette, bgColor, textColor)) recordSuccess("generate");
  }, [wordEntries, paletteName, recordSuccess]);

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "word-cloud.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, []);

  const handleClear = useCallback(() => {
    clearInteraction();
    setInput("");
    setWordEntries([]);
    setError("");
  }, []);

  return (
    <div onChangeCapture={markInteraction} className="space-y-6">
      <div>
        <label htmlFor="wc-input" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
          Paste your text
        </label>
        <textarea
          id="wc-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste or type text here to generate a word cloud..."
          rows={6}
          className="w-full p-4 border rounded-lg text-sm resize-y outline-none transition-colors duration-150"
          style={{
            backgroundColor: "var(--color-canvas-soft)",
            borderColor: "var(--color-hairline)",
            color: "var(--color-ink)",
          }}
        />
      </div>

      <ErrorBanner message={error} />

      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-lg border" style={{ borderColor: "var(--color-hairline)", backgroundColor: "var(--color-canvas)" }}>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="wc-palette" className="text-xs font-medium" style={{ color: "var(--color-mute)" }}>
              Palette:
            </label>
            <select
              id="wc-palette"
              value={paletteName}
              onChange={(e) => setPaletteName(e.target.value)}
              className="text-xs px-2 py-1.5 rounded border outline-none"
              style={{
                backgroundColor: "var(--color-canvas)",
                borderColor: "var(--color-hairline)",
                color: "var(--color-ink)",
              }}
            >
              {Object.keys(PALETTES).map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="wc-max" className="text-xs font-medium" style={{ color: "var(--color-mute)" }}>
              Max words:
            </label>
            <select
              id="wc-max"
              value={maxWords}
              onChange={(e) => setMaxWords(parseInt(e.target.value))}
              className="text-xs px-2 py-1.5 rounded border outline-none"
              style={{
                backgroundColor: "var(--color-canvas)",
                borderColor: "var(--color-hairline)",
                color: "var(--color-ink)",
              }}
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={75}>75</option>
              <option value={100}>100</option>
            </select>
          </div>
          <button
            type="button"
            onClick={generate}
            className="btn-primary btn-sm"
            style={{ backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)" }}
          >
            Generate
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
        {wordEntries.length > 0 && (
          <button
            type="button"
            onClick={handleDownload}
            className="btn-secondary btn-sm"
            style={{ borderColor: "var(--color-hairline)", color: "var(--color-ink)", backgroundColor: "var(--color-canvas)" }}
          >
            Download PNG
          </button>
        )}
      </div>

      {wordEntries.length > 0 && (
        <div>
          <div
            ref={containerRef}
            className="rounded-lg border overflow-hidden"
            style={{ borderColor: "var(--color-hairline)", maxWidth: CANVAS_SIZE }}
          >
            <canvas
              ref={canvasRef}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              className="w-full h-auto"
              style={{ display: "block" }}
            />
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {PALETTES[paletteName].map((color, i) => (
              <span
                key={i}
                className="w-5 h-5 rounded-full border"
                style={{ backgroundColor: color, borderColor: "var(--color-hairline)" }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
