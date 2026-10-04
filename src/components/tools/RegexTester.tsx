import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useEffect, useMemo } from "react";

interface MatchResult {
  text: string;
  index: number;
  length: number;
  groups: string[];
}

export default function RegexTester() {
  const { markInteraction, recordSuccess } = useToolTelemetry();
  const [pattern, setPattern] = useState("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");
  const [testText, setTestText] = useState(
    "Hello! Please contact us at support@example.com or info@freeonlinetoolsnest.com for more info."
  );
  
  // Flags state
  const [flagG, setFlagG] = useState(true);
  const [flagI, setFlagI] = useState(true);
  const [flagM, setFlagM] = useState(false);
  const [flagS, setFlagS] = useState(false);

  const [regexError, setRegexError] = useState("");
  const [matches, setMatches] = useState<MatchResult[]>([]);

  // Compute flags string
  const flags = useMemo(() => {
    let f = "";
    if (flagG) f += "g";
    if (flagI) f += "i";
    if (flagM) f += "m";
    if (flagS) f += "s";
    return f;
  }, [flagG, flagI, flagM, flagS]);

  // Compute matches and validate regex
  useEffect(() => {
    if (!pattern) {
      setRegexError("");
      setMatches([]);
      return;
    }

    try {
      const regex = new RegExp(pattern, flags);
      setRegexError("");

      const found: MatchResult[] = [];
      if (flags.includes("g")) {
        let match;
        // Avoid infinite loops for zero-width matches (like ^, $, or a*)
        let lastIndex = -1;
        while ((match = regex.exec(testText)) !== null) {
          if (regex.lastIndex === lastIndex) {
            regex.lastIndex++; // force advance
          }
          lastIndex = regex.lastIndex;

          found.push({
            text: match[0],
            index: match.index,
            length: match[0].length,
            groups: match.slice(1).map((g) => g || ""),
          });

          // safety check to prevent infinite loop
          if (found.length > 500) break;
        }
      } else {
        const match = testText.match(regex);
        if (match) {
          found.push({
            text: match[0],
            index: match.index || 0,
            length: match[0].length,
            groups: match.slice(1).map((g) => g || ""),
          });
        }
      }
      setMatches(found);
      if (testText.trim()) recordSuccess("check");
    } catch (err: unknown) {
      setRegexError(err instanceof Error ? err.message : "Invalid regular expression.");
      setMatches([]);
    }
  }, [pattern, testText, flags, recordSuccess]);

  // Generate highlighted text output safely
  const highlightedHTML = useMemo(() => {
    if (!pattern || regexError || matches.length === 0) {
      // Escape HTML to prevent injection
      return testText.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    try {
      const regex = new RegExp(pattern, flags);
      // We will perform a custom string replacement that inserts marked tags
      // Let's do it by index slices to avoid nested matching issues or regex replacement edge cases.
      let resultHTML = "";
      let lastIndex = 0;

      // We need sorted matches by their index
      const sortedMatches = [...matches].sort((a, b) => a.index - b.index);

      for (const m of sortedMatches) {
        // If matches overlap or out of sequence due to edge cases
        if (m.index < lastIndex) continue;

        // Text before the match
        const before = testText.slice(lastIndex, m.index);
        resultHTML += before.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

        // The matched text
        const matched = testText.slice(m.index, m.index + m.length);
        resultHTML += `<mark class="bg-violet-500/20 text-violet-300 border-b-2 border-violet-500/80 px-0.5 rounded-sm">${matched.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</mark>`;

        lastIndex = m.index + m.length;
      }

      // Remaining text
      const remaining = testText.slice(lastIndex);
      resultHTML += remaining.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

      return resultHTML;
    } catch {
      return testText.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
  }, [pattern, testText, matches, regexError, flags]);

  return (
    <div onChangeCapture={markInteraction} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor pane */}
        <div className="space-y-4">
          <div>
            <label htmlFor="regex-pattern" className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-ink)" }}>
              Expression
            </label>
            <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: regexError ? "var(--color-error)" : "var(--color-hairline)" }}>
              <span className="flex items-center px-3 text-sm font-mono border-r select-none" style={{ backgroundColor: "var(--color-canvas-soft-2)", color: "var(--color-mute)", borderColor: "var(--color-hairline)" }}>
                /
              </span>
              <input
                id="regex-pattern"
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="[a-z]+"
                className="flex-1 px-4 py-2.5 text-sm font-mono outline-none"
                style={{ backgroundColor: "var(--color-canvas)", color: "var(--color-ink)" }}
                spellCheck={false}
              />
              <span className="flex items-center px-3 text-sm font-mono border-l select-none" style={{ backgroundColor: "var(--color-canvas-soft-2)", color: "var(--color-mute)", borderColor: "var(--color-hairline)" }}>
                /{flags}
              </span>
            </div>
            {regexError && (
              <p className="mt-1.5 text-xs font-medium" style={{ color: "var(--color-error)" }}>
                {regexError}
              </p>
            )}
          </div>

          {/* Flags Selection */}
          <div className="space-y-2">
            <span className="block text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-mute)" }}>
              Flags
            </span>
            <div className="flex flex-wrap gap-4 p-3 rounded-lg border" style={{ borderColor: "var(--color-hairline)", backgroundColor: "var(--color-canvas)" }}>
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer" style={{ color: "var(--color-ink)" }}>
                <input
                  type="checkbox"
                  checked={flagG}
                  onChange={(e) => setFlagG(e.target.checked)}
                  className="rounded"
                  style={{ accentColor: "var(--color-violet)" }}
                />
                <span>Global (g)</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer" style={{ color: "var(--color-ink)" }}>
                <input
                  type="checkbox"
                  checked={flagI}
                  onChange={(e) => setFlagI(e.target.checked)}
                  className="rounded"
                  style={{ accentColor: "var(--color-violet)" }}
                />
                <span>Case Insensitive (i)</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer" style={{ color: "var(--color-ink)" }}>
                <input
                  type="checkbox"
                  checked={flagM}
                  onChange={(e) => setFlagM(e.target.checked)}
                  className="rounded"
                  style={{ accentColor: "var(--color-violet)" }}
                />
                <span>Multiline (m)</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer" style={{ color: "var(--color-ink)" }}>
                <input
                  type="checkbox"
                  checked={flagS}
                  onChange={(e) => setFlagS(e.target.checked)}
                  className="rounded"
                  style={{ accentColor: "var(--color-violet)" }}
                />
                <span>Dotall (s)</span>
              </label>
            </div>
          </div>

          {/* Test text */}
          <div>
            <label htmlFor="regex-test" className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-ink)" }}>
              Test String
            </label>
            <textarea
              id="regex-test"
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="Paste text here to search and match..."
              rows={6}
              className="w-full p-4 border rounded-lg text-sm resize-y outline-none transition-colors duration-150"
              style={{
                backgroundColor: "var(--color-canvas-soft)",
                borderColor: "var(--color-hairline)",
                color: "var(--color-ink)",
                fontFamily: "var(--font-mono)",
              }}
              spellCheck={false}
            />
          </div>
        </div>

        {/* Highlight & Live Match display */}
        <div className="flex flex-col space-y-4">
          <div>
            <span className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-ink)" }}>
              Highlighted Matches
            </span>
            <div
              className="w-full p-4 border rounded-lg text-sm min-h-[160px] whitespace-pre-wrap break-all overflow-y-auto"
              style={{
                backgroundColor: "var(--color-canvas-soft-2)",
                borderColor: "var(--color-hairline)",
                color: "var(--color-ink)",
                fontFamily: "var(--font-mono)",
              }}
              dangerouslySetInnerHTML={{ __html: highlightedHTML }}
            />
          </div>

          <div className="flex-1 flex flex-col min-h-[160px]">
            <span className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-ink)" }}>
              Match Details ({matches.length})
            </span>
            <div className="flex-1 border rounded-lg overflow-hidden flex flex-col" style={{ borderColor: "var(--color-hairline)" }}>
              <div className="overflow-x-auto overflow-y-auto max-h-[220px] flex-1">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr style={{ backgroundColor: "var(--color-canvas-soft-2)", borderBottom: "1px solid var(--color-hairline)", color: "var(--color-mute)" }}>
                      <th className="p-2.5 font-medium">Match</th>
                      <th className="p-2.5 font-medium">Index</th>
                      <th className="p-2.5 font-medium">Length</th>
                      <th className="p-2.5 font-medium">Captures</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matches.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-sm" style={{ color: "var(--color-mute)" }}>
                          No matches found.
                        </td>
                      </tr>
                    ) : (
                      matches.map((m, idx) => (
                        <tr key={idx} style={{ borderBottom: "1px solid var(--color-hairline)", backgroundColor: "var(--color-canvas)" }}>
                          <td className="p-2.5 font-mono font-semibold" style={{ color: "var(--color-primary)" }}>{m.text}</td>
                          <td className="p-2.5" style={{ color: "var(--color-body)" }}>{m.index}</td>
                          <td className="p-2.5" style={{ color: "var(--color-body)" }}>{m.length}</td>
                          <td className="p-2.5 font-mono" style={{ color: "var(--color-body)" }}>
                            {m.groups.length > 0 ? (
                              <div className="flex flex-col gap-1">
                                {m.groups.map((group, gIdx) => (
                                  <span key={gIdx} className="bg-canvas-soft-2 px-1 py-0.5 rounded border text-[10px]" style={{ borderColor: "var(--color-hairline)" }}>
                                    Group {gIdx + 1}: "{group}"
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="italic">None</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
