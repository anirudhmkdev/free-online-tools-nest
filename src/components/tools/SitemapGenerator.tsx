import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { isAbsoluteHttpUrl } from "../../helpers/tool-output-validity";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";

interface UrlEntry {
  id: number;
  url: string;
  priority: string;
  changeFreq: string;
  lastmod: string;
}

const DEFAULT_PRIORITY = "0.5";
const CHANGE_FREQS = ["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"];

let nextId = 4;

function createEntry(id: number): UrlEntry {
  return { id, url: "", priority: DEFAULT_PRIORITY, changeFreq: "weekly", lastmod: "" };
}

export default function SitemapGenerator() {
  const { markInteraction, recordSuccess } = useToolTelemetry();
  const [entries, setEntries] = useState<UrlEntry[]>([
    createEntry(1),
    createEntry(2),
    createEntry(3),
  ]);
  const [copied, handleCopy] = useCopyToClipboard();

  const addEntry = useCallback(() => {
    setEntries((prev) => [...prev, createEntry(nextId++)]);
  }, []);

  const removeEntry = useCallback((id: number) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const updateEntry = useCallback((id: number, field: keyof UrlEntry, value: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  }, []);

  const xmlOutput = useMemo(() => {
    const hasContent = entries.some((e) => e.url.trim().length > 0);
    if (!hasContent) return "";

    const lines: string[] = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ];

    for (const entry of entries) {
      if (!entry.url.trim()) continue;
      const url = escapeXml(entry.url.trim());
      lines.push("  <url>");
      lines.push(`    <loc>${url}</loc>`);
      if (entry.lastmod) {
        lines.push(`    <lastmod>${entry.lastmod}</lastmod>`);
      }
      lines.push(`    <changefreq>${entry.changeFreq}</changefreq>`);
      lines.push(`    <priority>${entry.priority}</priority>`);
      lines.push("  </url>");
    }

    lines.push("</urlset>");
    return lines.join("\n");
  }, [entries]);

  const handleGenerateCopy = useCallback(() => {
    if (xmlOutput) handleCopy(xmlOutput);
  }, [handleCopy, xmlOutput]);

  useEffect(() => {
    if (xmlOutput && entries.filter(entry => entry.url.trim()).every(entry => isAbsoluteHttpUrl(entry.url))) recordSuccess("generate");
  }, [xmlOutput, entries, recordSuccess]);

  return (
    <div onChangeCapture={markInteraction} className="space-y-6">
      <div className="space-y-3">
        {entries.map((entry, index) => (
          <div
            key={entry.id}
            className="p-4 rounded-lg border"
            style={{ backgroundColor: "var(--color-canvas)", borderColor: "var(--color-hairline)" }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: "var(--color-mute)" }}>
                URL #{index + 1}
              </span>
              {entries.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEntry(entry.id)}
                  className="text-xs px-2 py-1 rounded transition-colors"
                  style={{ color: "var(--color-error)", backgroundColor: "var(--color-canvas-soft-2)" }}
                >
                  Remove
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs mb-1" style={{ color: "var(--color-mute)" }}>URL</label>
                <input
                  type="url"
                  value={entry.url}
                  onChange={(e) => updateEntry(entry.id, "url", e.target.value)}
                  placeholder="https://example.com/page"
                  className="w-full h-9 px-3 border rounded-md text-sm outline-none"
                  style={{ backgroundColor: "var(--color-canvas-soft)", borderColor: "var(--color-hairline)", color: "var(--color-ink)" }}
                />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "var(--color-mute)" }}>Priority</label>
                <select
                  value={entry.priority}
                  onChange={(e) => updateEntry(entry.id, "priority", e.target.value)}
                  className="w-full h-9 px-2 border rounded-md text-sm outline-none"
                  style={{ backgroundColor: "var(--color-canvas-soft)", borderColor: "var(--color-hairline)", color: "var(--color-ink)" }}
                >
                  {[0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0].map((p) => (
                    <option key={p} value={p}>{p.toFixed(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "var(--color-mute)" }}>Change Frequency</label>
                <select
                  value={entry.changeFreq}
                  onChange={(e) => updateEntry(entry.id, "changeFreq", e.target.value)}
                  className="w-full h-9 px-2 border rounded-md text-sm outline-none"
                  style={{ backgroundColor: "var(--color-canvas-soft)", borderColor: "var(--color-hairline)", color: "var(--color-ink)" }}
                >
                  {CHANGE_FREQS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-2">
              <label className="block text-xs mb-1" style={{ color: "var(--color-mute)" }}>Last Modified</label>
              <input
                type="date"
                value={entry.lastmod}
                onChange={(e) => updateEntry(entry.id, "lastmod", e.target.value)}
                className="w-full h-9 px-3 border rounded-md text-sm outline-none"
                style={{ backgroundColor: "var(--color-canvas-soft)", borderColor: "var(--color-hairline)", color: "var(--color-ink)" }}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addEntry}
        className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
        style={{
          backgroundColor: "var(--color-canvas-soft-2)",
          color: "var(--color-link)",
          border: "1px dashed var(--color-hairline)",
        }}
      >
        + Add URL
      </button>

      {xmlOutput && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>Generated Sitemap XML</span>
            <button
              type="button"
              onClick={handleGenerateCopy}
              className="text-sm px-3 py-1 rounded-md transition-colors duration-150"
              style={{
                color: copied ? "var(--color-success)" : "var(--color-link)",
                backgroundColor: "var(--color-canvas-soft-2)",
              }}
            >
              {copied ? "Copied" : "Copy XML"}
            </button>
          </div>
          <pre
            className="p-4 rounded-lg text-sm overflow-x-auto max-h-96"
            style={{
              backgroundColor: "var(--color-canvas-soft-2)",
              color: "var(--color-ink)",
              fontFamily: "var(--font-mono)",
              lineHeight: "1.6",
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
            }}
          >
            {xmlOutput}
          </pre>
        </div>
      )}
    </div>
  );
}

function escapeXml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
