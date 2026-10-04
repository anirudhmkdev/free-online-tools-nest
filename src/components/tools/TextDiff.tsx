import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useCallback, useMemo } from "react";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";

/**
 * TextDiff — compare two texts line by line using an LCS-based diff.
 * Displays additions (green), deletions (red), and unchanged lines.
 */

type DiffLine = {
  type: "added" | "removed" | "unchanged";
  leftLine: string;
  rightLine: string;
  leftNum: number | null;
  rightNum: number | null;
};

function computeDiff(left: string[], right: string[]): DiffLine[] {
  const m = left.length;
  const n = right.length;

  // Build LCS table
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (left[i - 1] === right[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to produce diff
  const result: DiffLine[] = [];
  let i = m, j = n;
  const temp: DiffLine[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && left[i - 1] === right[j - 1]) {
      temp.push({ type: "unchanged", leftLine: left[i - 1], rightLine: right[j - 1], leftNum: i, rightNum: j });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      temp.push({ type: "added", leftLine: "", rightLine: right[j - 1], leftNum: null, rightNum: j });
      j--;
    } else if (i > 0) {
      temp.push({ type: "removed", leftLine: left[i - 1], rightLine: "", leftNum: i, rightNum: null });
      i--;
    }
  }

  // Reverse to get chronological order
  for (let k = temp.length - 1; k >= 0; k--) {
    result.push(temp[k]);
  }

  return result;
}

export default function TextDiff() {
  const { markInteraction, recordSuccess, clearInteraction } = useToolTelemetry();
  const [leftText, setLeftText] = useState("");
  const [rightText, setRightText] = useState("");
  const [diffResult, setDiffResult] = useState<DiffLine[] | null>(null);
  const [showDiff, setShowDiff] = useState(false);
  const [copied, handleCopy] = useCopyToClipboard();

  const stats = useMemo(() => {
    if (!diffResult) return null;
    let additions = 0;
    let deletions = 0;
    let unchanged = 0;
    for (const line of diffResult) {
      if (line.type === "added") additions++;
      else if (line.type === "removed") deletions++;
      else unchanged++;
    }
    return { total: diffResult.length, additions, deletions, unchanged };
  }, [diffResult]);

  const handleCompare = useCallback(() => {
    markInteraction();
    const leftLines = leftText.split("\n");
    const rightLines = rightText.split("\n");
    // Remove trailing empty line if the text doesn't end with a newline
    if (leftText.length > 0 && !leftText.endsWith("\n") && leftLines[leftLines.length - 1] === "") {
      leftLines.pop();
    }
    if (rightText.length > 0 && !rightText.endsWith("\n") && rightLines[rightLines.length - 1] === "") {
      rightLines.pop();
    }
    const diff = computeDiff(leftLines, rightLines);
    setDiffResult(diff);
    setShowDiff(true);
    if (leftText.trim() || rightText.trim()) recordSuccess("analyze");
  }, [leftText, rightText]);

  const diffText = useMemo(() => {
    if (!diffResult) return "";
    return diffResult
      .map((line) => {
        switch (line.type) {
          case "added": return `+ ${line.rightLine}`;
          case "removed": return `- ${line.leftLine}`;
          case "unchanged": return `  ${line.leftLine}`;
        }
      })
      .join("\n");
  }, [diffResult]);

  return (
    <div onChangeCapture={markInteraction} className="space-y-6">
      {/* Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label htmlFor="diff-left" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            Original Text
          </label>
          <textarea
            id="diff-left"
            value={leftText}
            onChange={(e) => { setLeftText(e.target.value); setShowDiff(false); }}
            placeholder="Paste original text here…"
            rows={8}
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
        <div>
          <label htmlFor="diff-right" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            Changed Text
          </label>
          <textarea
            id="diff-right"
            value={rightText}
            onChange={(e) => { setRightText(e.target.value); setShowDiff(false); }}
            placeholder="Paste changed text here…"
            rows={8}
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

      {/* Compare button */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleCompare}
          className="btn-primary btn-sm"
          style={{ backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)" }}
        >
          Compare
        </button>
        {diffResult && (
          <button
            type="button"
            onClick={() => { clearInteraction(); setLeftText(""); setRightText(""); setDiffResult(null); setShowDiff(false); }}
            className="btn-secondary btn-sm"
            style={{ borderColor: "var(--color-hairline)", color: "var(--color-ink)", backgroundColor: "var(--color-canvas)" }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Stats */}
      {stats && showDiff && (
        <div className="flex flex-wrap gap-4 text-sm">
          <span style={{ color: "var(--color-ink)" }}>
            Total lines: <strong>{stats.total}</strong>
          </span>
          <span style={{ color: "#22c55e" }}>
            Additions: <strong>{stats.additions}</strong>
          </span>
          <span style={{ color: "var(--color-error)" }}>
            Deletions: <strong>{stats.deletions}</strong>
          </span>
          <span style={{ color: "var(--color-mute)" }}>
            Unchanged: <strong>{stats.unchanged}</strong>
          </span>
        </div>
      )}

      {/* Diff result */}
      {diffResult && showDiff && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>
              Diff Result
            </span>
            <button
              type="button"
              onClick={() => handleCopy(diffText)}
              className="text-sm px-3 py-1 rounded-md transition-colors duration-150"
              style={{
                color: copied ? "var(--color-success)" : "var(--color-link)",
                backgroundColor: "var(--color-canvas-soft-2)",
              }}
            >
              {copied ? "Copied" : "Copy Diff"}
            </button>
          </div>

          <div
            className="border rounded-lg overflow-hidden text-sm font-mono"
            style={{ borderColor: "var(--color-hairline)" }}
          >
            <div className="max-h-96 overflow-y-auto">
              {diffResult.length === 0 ? (
                <div className="p-4 text-center" style={{ color: "var(--color-mute)" }}>
                  No differences — texts are identical.
                </div>
              ) : (
                diffResult.map((line, idx) => (
                  <div
                    key={idx}
                    className="flex min-h-[28px]"
                    style={{
                      backgroundColor:
                        line.type === "added"
                          ? "rgba(34,197,94,0.1)"
                          : line.type === "removed"
                            ? "rgba(239,68,68,0.1)"
                            : "transparent",
                      borderBottom: "1px solid var(--color-hairline)",
                    }}
                  >
                    {/* Line numbers */}
                    <div
                      className="flex-shrink-0 w-12 text-right px-2 py-1 text-xs select-none border-r"
                      style={{
                        color: "var(--color-mute)",
                        borderColor: "var(--color-hairline)",
                        backgroundColor: "var(--color-canvas)",
                      }}
                    >
                      {line.leftNum ?? ""}
                    </div>
                    <div
                      className="flex-shrink-0 w-12 text-right px-2 py-1 text-xs select-none border-r"
                      style={{
                        color: "var(--color-mute)",
                        borderColor: "var(--color-hairline)",
                        backgroundColor: "var(--color-canvas)",
                      }}
                    >
                      {line.rightNum ?? ""}
                    </div>
                    {/* Content */}
                    <div
                      className="flex-1 px-3 py-1 whitespace-pre-wrap break-all"
                      style={{
                        color: line.type === "added"
                          ? "#22c55e"
                          : line.type === "removed"
                            ? "var(--color-error)"
                            : "var(--color-ink)",
                      }}
                    >
                      {line.type === "added" && "+ "}
                      {line.type === "removed" && "- "}
                      {line.type === "unchanged" && "  "}
                      {line.type === "added" ? line.rightLine : line.leftLine}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
