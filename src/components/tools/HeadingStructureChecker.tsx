import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useMemo, useEffect } from "react";

interface HeadingEntry {
  level: number;
  tag: string;
  text: string;
}

interface Warning {
  type: "missing-h1" | "multiple-h1" | "skipped-level" | "empty-heading" | "too-many";
  message: string;
}

function extractHeadings(html: string): HeadingEntry[] {
  const tagRegex = /<h([1-6])(?:\s[^>]*)?>(.*?)<\/h\1>/gi;
  const entries: HeadingEntry[] = [];
  let match: RegExpExecArray | null;
  while ((match = tagRegex.exec(html)) !== null) {
    const level = parseInt(match[1], 10);
    const inner = match[2].replace(/<[^>]*>/g, "").trim();
    entries.push({ level, tag: `H${level}`, text: inner });
  }
  return entries;
}

function analyzeWarnings(headings: HeadingEntry[]): Warning[] {
  const warnings: Warning[] = [];

  const h1s = headings.filter((h) => h.level === 1);
  if (h1s.length === 0) {
    warnings.push({ type: "missing-h1", message: "Missing H1 tag — each page should have exactly one H1" });
  } else if (h1s.length > 1) {
    warnings.push({ type: "multiple-h1", message: `Found ${h1s.length} H1 tags — pages should typically have only one H1` });
  }

  if (headings.length > 50) {
    warnings.push({ type: "too-many", message: `Found ${headings.length} headings — consider consolidating for better structure` });
  }

  for (let i = 1; i < headings.length; i++) {
    const prev = headings[i - 1].level;
    const curr = headings[i].level;
    if (curr > prev + 1) {
      warnings.push({
        type: "skipped-level",
        message: `Skipped heading level: ${headings[i - 1].tag} → ${headings[i].tag}`,
      });
    }
  }

  for (const h of headings) {
    if (!h.text) {
      warnings.push({ type: "empty-heading", message: `Empty ${h.tag} tag found` });
    }
  }

  return warnings;
}

export default function HeadingStructureChecker() {
  const { markInteraction, recordSuccess } = useToolTelemetry();
  const [html, setHtml] = useState("");

  const headings = useMemo(() => extractHeadings(html), [html]);
  const warnings = useMemo(() => analyzeWarnings(headings), [headings]);

  const countByLevel = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    for (const h of headings) {
      counts[h.level] = (counts[h.level] || 0) + 1;
    }
    return counts;
  }, [headings]);

  const indentClass = (level: number) => {
    const indents: Record<number, string> = {
      1: "ml-0",
      2: "ml-4",
      3: "ml-8",
      4: "ml-12",
      5: "ml-16",
      6: "ml-20",
    };
    return indents[level] || "ml-0";
  };

  const tagColors: Record<number, string> = {
    1: "#dc2626",
    2: "#2563eb",
    3: "#059669",
    4: "#d97706",
    5: "#7c3aed",
    6: "#db2777",
  };

  useEffect(() => {
    if (html.trim()) recordSuccess("check");
  }, [html, headings, recordSuccess]);

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="hs-html" className="block text-sm font-medium mb-1" style={{ color: "var(--color-ink)" }}>
          Paste HTML Content
        </label>
        <textarea
          id="hs-html"
          value={html}
          onChange={(e) => { markInteraction(); setHtml(e.target.value); }}
          placeholder="<h1>Page Title</h1><h2>Section</h2><h3>Subsection</h3>..."
          rows={8}
          className="w-full p-3 border rounded-lg text-sm font-mono resize-y outline-none"
          style={{ backgroundColor: "var(--color-canvas-soft)", borderColor: "var(--color-hairline)", color: "var(--color-ink)" }}
        />
      </div>

      {html && (
        <>
          <div className="grid grid-cols-6 gap-2">
            {[1, 2, 3, 4, 5, 6].map((level) => (
              <div
                key={level}
                className="p-3 rounded-lg text-center"
                style={{ backgroundColor: "var(--color-canvas-soft)" }}
              >
                <div className="text-xs font-medium" style={{ color: "var(--color-mute)" }}>H{level}</div>
                <div className="text-lg font-bold" style={{ color: tagColors[level] }}>{countByLevel[level] || 0}</div>
              </div>
            ))}
          </div>

          {warnings.length > 0 && (
            <div className="p-3 rounded-lg border" style={{ backgroundColor: "var(--color-canvas-soft)", borderColor: "var(--color-error)" }}>
              <span className="text-sm font-medium" style={{ color: "var(--color-error)" }}>
                {warnings.length === 1 ? "1 Issue Found" : `${warnings.length} Issues Found`}
              </span>
              <ul className="mt-2 space-y-1">
                {warnings.map((w, i) => (
                  <li key={i} className="text-sm flex items-start gap-2" style={{ color: "var(--color-ink)" }}>
                    <span style={{ color: "var(--color-error)" }}>⚠</span>
                    {w.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {headings.length === 0 && (
            <div className="p-4 rounded-lg text-center" style={{ backgroundColor: "var(--color-canvas-soft)" }}>
              <span className="text-sm" style={{ color: "var(--color-mute)" }}>No heading tags found in the provided HTML</span>
            </div>
          )}

          {headings.length > 0 && (
            <div>
              <span className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
                Heading Outline ({headings.length} headings)
              </span>
              <div className="p-4 rounded-lg border" style={{ backgroundColor: "var(--color-canvas)", borderColor: "var(--color-hairline)" }}>
                {headings.map((h, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 py-1 ${indentClass(h.level)}`}
                  >
                    <span
                      className="inline-flex items-center justify-center w-8 h-5 text-xs font-bold rounded"
                      style={{ backgroundColor: tagColors[h.level], color: "#fff" }}
                    >
                      {h.tag}
                    </span>
                    <span
                      className="text-sm truncate"
                      style={{
                        color: h.text ? "var(--color-ink)" : "var(--color-error)",
                        fontStyle: h.text ? "normal" : "italic",
                      }}
                    >
                      {h.text || "(empty)"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
