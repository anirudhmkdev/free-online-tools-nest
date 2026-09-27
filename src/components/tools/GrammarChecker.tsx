import { useState, useCallback } from "react";

import { checkGrammar, type GrammarIssue, type CategoryCount } from "../../helpers/grammar-checker";

export default function GrammarChecker() {
  const [text, setText] = useState("");
  const [issues, setIssues] = useState<GrammarIssue[]>([]);
  const [categories, setCategories] = useState<CategoryCount[]>([]);
  const [checked, setChecked] = useState(false);

  const handleCheck = useCallback(() => {
    if (!text.trim()) {
      setIssues([]);
      setCategories([]);
      setChecked(true);
      return;
    }
    const result = checkGrammar(text);
    setIssues(result.issues);
    setCategories(result.categories);
    setChecked(true);
  }, [text]);

  const totalIssues = issues.length;

  return (
    <div className="space-y-6">
      <p className="text-sm">English-only checks for repeated words, selected misspellings, line capitalization, spacing and repeated filler words. Suggestions may be wrong; this is not a complete grammar checker. Edit the original text yourself and check again.</p>
      {/* Input */}
      <div>
        <label htmlFor="gc-input" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
          Text to Check
        </label>
        <textarea
          id="gc-input"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setChecked(false);
          }}
          placeholder="Paste or type text here to check for grammar, spelling, and style issues..."
          rows={8}
          className="w-full p-4 border rounded-lg text-base resize-y outline-none transition-colors duration-150"
          style={{
            backgroundColor: "var(--color-canvas-soft)",
            borderColor: "var(--color-hairline)",
            color: "var(--color-ink)",
            fontFamily: "var(--font-sans)",
          }}
        />
        <div className="mt-1 text-xs" style={{ color: "var(--color-mute)" }}>
          {text.length} characters | {text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0} words
        </div>
      </div>

      {/* Check button */}
      <button
        type="button"
        onClick={handleCheck}
        className="px-6 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150"
        style={{ backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)" }}
      >
        Check Grammar
      </button>

      {/* Results */}
      {checked && (
        <>
          {totalIssues > 0 ? (
            <div className="space-y-6">
              {/* Summary */}
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-sm font-semibold" style={{ color: "var(--color-ink)" }}>
                  Review <span style={{ color: "var(--color-error)" }}>{totalIssues}</span> suggestion{totalIssues !== 1 ? "s" : ""}
                </span>
                {categories.map((cat) => (
                  <span
                    key={cat.label}
                    className="text-xs px-2.5 py-1 rounded-full"
                    style={{
                      backgroundColor: cat.color + "18",
                      color: cat.color,
                      border: `1px solid ${cat.color}40`,
                    }}
                  >
                    {cat.label}: {cat.count}
                  </span>
                ))}
              </div>

              {/* Issues list */}
              <div className="space-y-2.5">
                {issues.map((issue, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border text-sm"
                    style={{
                      backgroundColor: "var(--color-canvas-soft)",
                      borderColor: "var(--color-hairline)",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
                        style={{
                          backgroundColor: (() => {
                            const m: Record<string, string> = {
                              "Repeated Words": "#ef4444",
                              "Misspellings": "#f59e0b",
                              "Capitalization": "#3b82f6",
                              "Double Spaces": "#8b5cf6",
                              "Missing Punctuation": "#10b981",
                              "Overused Words": "#ec4899",
                            };
                            return (m[issue.type] || "var(--color-mute)") + "20";
                          })(),
                          color: (() => {
                            const m: Record<string, string> = {
                              "Repeated Words": "#ef4444",
                              "Misspellings": "#f59e0b",
                              "Capitalization": "#3b82f6",
                              "Double Spaces": "#8b5cf6",
                              "Missing Punctuation": "#10b981",
                              "Overused Words": "#ec4899",
                            };
                            return m[issue.type] || "var(--color-mute)";
                          })(),
                        }}
                      >
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="text-xs font-semibold uppercase tracking-wider"
                            style={{ color: (() => {
                              const m: Record<string, string> = {
                                "Repeated Words": "#ef4444",
                                "Misspellings": "#f59e0b",
                                "Capitalization": "#3b82f6",
                                "Double Spaces": "#8b5cf6",
                                "Missing Punctuation": "#10b981",
                                "Overused Words": "#ec4899",
                              };
                              return m[issue.type] || "var(--color-mute)";
                            })() }}
                          >
                            {issue.type}
                          </span>
                          <span style={{ color: "var(--color-mute)" }}>
                            Line {issue.line}
                          </span>
                        </div>
                        <div className="mb-1 font-mono text-xs break-all" style={{ color: "var(--color-body)" }}>
                          "...{issue.context}..."
                        </div>
                        <div style={{ color: "var(--color-ink)" }}>
                          <span className="font-medium">Suggestion: </span>{issue.suggestion}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div
              className="p-6 rounded-lg text-center"
              style={{ backgroundColor: "var(--color-canvas-soft-2)" }}
            >
              <div className="text-xl mb-1">👍</div>
              <div className="text-sm font-medium" style={{ color: "#22c55e" }}>
                No issues found by these checks.
              </div>
              <div className="text-xs mt-1" style={{ color: "var(--color-mute)" }}>
                This limited English rule checker can miss grammar and spelling errors. Review the text yourself.
              </div>
            </div>
          )}
        </>
      )}

      {!checked && (
        <div className="py-8 text-center text-sm" style={{ color: "var(--color-mute)" }}>
          Enter text and click "Check Grammar" to scan for issues.
        </div>
      )}
    </div>
  );
}
