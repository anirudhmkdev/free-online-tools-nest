import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useMemo, useEffect } from "react";

interface CharPair {
  a: string;
  b: string;
  match: boolean;
}

function normalize(text: string, ignoreCase: boolean, ignoreSpaces: boolean, ignorePunctuation: boolean): string {
  let result = text;
  if (ignoreCase) result = result.toLowerCase();
  if (ignoreSpaces) result = result.replace(/\s+/g, "");
  if (ignorePunctuation) result = result.replace(/[^\w\s]|_/g, "");
  return result;
}

function buildCharPairs(normalized: string): CharPair[] {
  const pairs: CharPair[] = [];
  const len = normalized.length;
  for (let i = 0; i < Math.floor(len / 2); i++) {
    pairs.push({
      a: normalized[i],
      b: normalized[len - 1 - i],
      match: normalized[i] === normalized[len - 1 - i],
    });
  }
  if (len % 2 !== 0) {
    pairs.push({
      a: normalized[Math.floor(len / 2)],
      b: normalized[Math.floor(len / 2)],
      match: true,
    });
  }
  return pairs;
}

export default function PalindromeChecker() {
  const { markInteraction, recordSuccess } = useToolTelemetry();
  const [text, setText] = useState("");
  const [ignoreCase, setIgnoreCase] = useState(true);
  const [ignoreSpaces, setIgnoreSpaces] = useState(true);
  const [ignorePunctuation, setIgnorePunctuation] = useState(true);

  const normalized = useMemo(
    () => normalize(text, ignoreCase, ignoreSpaces, ignorePunctuation),
    [text, ignoreCase, ignoreSpaces, ignorePunctuation]
  );

  const reversed = useMemo(() => normalized.split("").reverse().join(""), [normalized]);

  const isPalindrome = useMemo(
    () => normalized.length > 0 && normalized === reversed,
    [normalized, reversed]
  );

  const charPairs = useMemo(() => buildCharPairs(normalized), [normalized]);

  useEffect(() => {
    if (normalized.length > 0) recordSuccess("check");
  }, [normalized, isPalindrome, recordSuccess]);

  return (
    <div onChangeCapture={markInteraction} className="space-y-6">
      <div>
        <label htmlFor="palindrome-input" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
          Enter text to check
        </label>
        <input
          id="palindrome-input"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="racecar"
          className="w-full h-12 px-4 border rounded-lg text-base outline-none"
          style={{
            backgroundColor: "var(--color-canvas-soft)",
            borderColor: "var(--color-hairline)",
            color: "var(--color-ink)",
          }}
          autoComplete="off"
        />
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm" style={{ color: "var(--color-body)" }}>
          <input
            type="checkbox"
            checked={ignoreCase}
            onChange={(e) => setIgnoreCase(e.target.checked)}
            className="w-4 h-4 rounded"
            style={{ accentColor: "var(--color-primary)" }}
          />
          Ignore case
        </label>
        <label className="flex items-center gap-2 text-sm" style={{ color: "var(--color-body)" }}>
          <input
            type="checkbox"
            checked={ignoreSpaces}
            onChange={(e) => setIgnoreSpaces(e.target.checked)}
            className="w-4 h-4 rounded"
            style={{ accentColor: "var(--color-primary)" }}
          />
          Ignore spaces
        </label>
        <label className="flex items-center gap-2 text-sm" style={{ color: "var(--color-body)" }}>
          <input
            type="checkbox"
            checked={ignorePunctuation}
            onChange={(e) => setIgnorePunctuation(e.target.checked)}
            className="w-4 h-4 rounded"
            style={{ accentColor: "var(--color-primary)" }}
          />
          Ignore punctuation
        </label>
      </div>

      {text.trim() && (
        <>
          <div className="flex items-center gap-3">
            <span
              className="text-2xl font-bold"
              style={{ color: isPalindrome ? "var(--color-success)" : "var(--color-error)" }}
            >
              {isPalindrome ? "\u2713 Palindrome" : "\u2717 Not a palindrome"}
            </span>
          </div>

          <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--color-canvas-soft-2)" }}>
            <span className="text-xs font-medium uppercase tracking-wider block mb-1" style={{ color: "var(--color-mute)" }}>
              Normalized
            </span>
            <code className="text-base" style={{ color: "var(--color-ink)", fontFamily: "var(--font-mono)" }}>
              {normalized || "\u2014"}
            </code>
          </div>

          <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--color-canvas-soft-2)" }}>
            <span className="text-xs font-medium uppercase tracking-wider block mb-1" style={{ color: "var(--color-mute)" }}>
              Reversed
            </span>
            <code className="text-base" style={{ color: "var(--color-ink)", fontFamily: "var(--font-mono)" }}>
              {reversed}
            </code>
          </div>

          {charPairs.length > 0 && (
            <div>
              <span className="text-xs font-medium uppercase tracking-wider block mb-2" style={{ color: "var(--color-mute)" }}>
                Character comparison
              </span>
              <div className="flex flex-wrap gap-1.5">
                {charPairs.map((pair, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-mono"
                    style={{
                      backgroundColor: pair.match ? "rgba(0, 112, 243, 0.1)" : "rgba(238, 0, 0, 0.1)",
                      color: pair.match ? "var(--color-success)" : "var(--color-error)",
                    }}
                  >
                    <span>{pair.a}</span>
                    <span style={{ opacity: 0.5 }}>{"\u2194"}</span>
                    <span>{pair.b}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
