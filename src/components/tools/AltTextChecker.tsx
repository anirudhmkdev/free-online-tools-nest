import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useMemo, useCallback, useEffect } from "react";

interface ImageResult {
  index: number;
  tagSnippet: string;
  altText: string | null;
  lineNumber: number;
  status: "pass" | "warning" | "fail";
}

export default function AltTextChecker() {
  const { markInteraction, recordSuccess } = useToolTelemetry();
  const [html, setHtml] = useState("");
  const [checked, setChecked] = useState(false);

  const results = useMemo((): ImageResult[] => {
    if (!checked || !html.trim()) return [];

    const imgRegex = /<img[^>]*>/gi;
    const resultsArr: ImageResult[] = [];
    let match: RegExpExecArray | null;
    let index = 0;

    while ((match = imgRegex.exec(html)) !== null) {
      const tag = match[0];
      const lineNumber = html.substring(0, match.index).split("\n").length;

      const altMatch = tag.match(/alt\s*=\s*"([^"]*)"/i) || tag.match(/alt\s*=\s*'([^']*)'/i) || tag.match(/alt\s*=\s*([^\s>"']+)/i);
      const altValue = altMatch ? altMatch[1] : null;

      const hasRolePresentation = /\srole\s*=\s*"(?:presentation|none)"/i.test(tag);
      const hasAriaHidden = /\saria-hidden\s*=\s*"(?:true)"/i.test(tag);

      let status: "pass" | "warning" | "fail";
      let altText: string | null;

      if (altValue !== null && altValue.trim().length > 0) {
        status = "pass";
        altText = altValue.trim();
      } else if (altValue !== null && altValue.trim() === "") {
        if (hasRolePresentation || hasAriaHidden) {
          status = "pass";
          altText = '(empty: decorative)';
        } else {
          status = "warning";
          altText = '(empty)';
        }
      } else if (hasRolePresentation || hasAriaHidden) {
        status = "pass";
        altText = '(decorative)';
      } else {
        status = "fail";
        altText = null;
      }

      const tagSnippet = tag.length > 80 ? tag.slice(0, 77) + "..." : tag;

      resultsArr.push({ index: ++index, tagSnippet, altText, lineNumber, status });
    }

    return resultsArr;
  }, [html, checked]);

  const totalImages = results.length;
  const passCount = results.filter((r) => r.status === "pass").length;
  const warningCount = results.filter((r) => r.status === "warning").length;
  const failCount = results.filter((r) => r.status === "fail").length;

  const handleCheck = useCallback(() => {
    markInteraction();
    setChecked(true);
  }, [markInteraction]);

  const statusIcon = (status: string) => {
    switch (status) {
      case "pass": return "✓";
      case "warning": return "⚠";
      case "fail": return "✗";
      default: return "";
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "pass": return "var(--color-success, #22c55e)";
      case "warning": return "var(--color-warning, #d97706)";
      case "fail": return "var(--color-error)";
      default: return "var(--color-mute)";
    }
  };

  useEffect(() => {
    if (checked && html.trim()) recordSuccess("check");
  }, [checked, html, results, recordSuccess]);

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="atc-input" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
          Paste your HTML
        </label>
        <textarea
          id="atc-input"
          value={html}
          onChange={(e) => {
            setHtml(e.target.value);
            setChecked(false);
          }}
          placeholder={'<img src="photo.jpg" alt="A scenic view" />\n<img src="decorative.png" role="presentation" />\n<img src="icon.png" />'}
          rows={8}
          className="w-full p-4 border rounded-lg text-sm resize-y outline-none transition-colors duration-150 font-mono"
          style={{
            backgroundColor: "var(--color-canvas-soft)",
            borderColor: "var(--color-hairline)",
            color: "var(--color-ink)",
            fontFamily: "var(--font-mono)",
          }}
          spellCheck={false}
        />
      </div>

      <button
        type="button"
        onClick={handleCheck}
        className="px-5 py-2 text-sm font-medium rounded-lg transition-colors"
        style={{
          backgroundColor: "var(--color-primary)",
          color: "var(--color-on-primary)",
        }}
      >
        Check Images
      </button>

      {/* Summary */}
      {checked && html.trim() && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Images", value: totalImages, color: "var(--color-ink)" },
            { label: "With Alt Text", value: passCount, color: "var(--color-success, #22c55e)" },
            { label: "Missing Alt Text", value: failCount + warningCount, color: failCount > 0 ? "var(--color-error)" : "var(--color-warning, #d97706)" },
          ].map((item) => (
            <div
              key={item.label}
              className="p-3 rounded-lg text-center"
              style={{ backgroundColor: "var(--color-canvas-soft-2)" }}
            >
              <div className="text-2xl font-semibold" style={{ color: item.color, letterSpacing: "-0.96px" }}>
                {item.value}
              </div>
              <div className="text-xs mt-1" style={{ color: "var(--color-mute)" }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results table */}
      {checked && html.trim() && results.length > 0 && (
        <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--color-hairline)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "var(--color-canvas-soft-2)" }}>
                <th className="px-4 py-2 text-left font-medium" style={{ color: "var(--color-ink)", width: "48px" }}>#</th>
                <th className="px-4 py-2 text-left font-medium" style={{ color: "var(--color-ink)" }}>Image Tag</th>
                <th className="px-4 py-2 text-left font-medium" style={{ color: "var(--color-ink)" }}>Alt Text</th>
                <th className="px-4 py-2 text-center font-medium" style={{ color: "var(--color-ink)", width: "80px" }}>Line</th>
                <th className="px-4 py-2 text-center font-medium" style={{ color: "var(--color-ink)", width: "80px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {results.map((img) => (
                <tr key={img.index} className="border-t" style={{ borderColor: "var(--color-hairline)" }}>
                  <td className="px-4 py-2 text-xs" style={{ color: "var(--color-mute)" }}>{img.index}</td>
                  <td className="px-4 py-2" style={{ color: "var(--color-ink)", fontFamily: "var(--font-mono)", fontSize: "11px" }}>
                    {img.tagSnippet}
                  </td>
                  <td className="px-4 py-2" style={{ color: "var(--color-ink)" }}>
                    {img.altText !== null ? (
                      <span>{img.altText}</span>
                    ) : (
                      <span className="font-semibold" style={{ color: "var(--color-error)" }}>[MISSING]</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-center text-xs" style={{ color: "var(--color-mute)" }}>{img.lineNumber}</td>
                  <td className="px-4 py-2 text-center">
                    <span
                      className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: statusColor(img.status), color: "#fff" }}
                    >
                      {statusIcon(img.status)} {img.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* No images found */}
      {checked && html.trim() && results.length === 0 && (
        <div className="text-sm py-4 text-center" style={{ color: "var(--color-mute)" }}>
          No <code style={{ fontFamily: "var(--font-mono)" }}>&lt;img&gt;</code> tags found in the provided HTML.
        </div>
      )}

      {/* WCAG note */}
      <div
        className="p-3 rounded-lg text-xs leading-relaxed"
        style={{ backgroundColor: "var(--color-canvas-soft)", borderLeft: "4px solid var(--color-link)" }}
      >
        <strong style={{ color: "var(--color-ink)" }}>WCAG Compliance:</strong>{" "}
        <span style={{ color: "var(--color-body)" }}>
          WCAG 2.1 Success Criterion 1.1.1 (Non-text Content, Level A) requires all
          <code style={{ fontFamily: "var(--font-mono)" }}>&lt;img&gt;</code> elements to have meaningful alternative text.
          Decorative images should use either <code style={{ fontFamily: "var(--font-mono)" }}>alt=""</code> with
          <code style={{ fontFamily: "var(--font-mono)" }}>role="presentation"</code> or
          <code style={{ fontFamily: "var(--font-mono)" }}>aria-hidden="true"</code>.
        </span>
      </div>
    </div>
  );
}
