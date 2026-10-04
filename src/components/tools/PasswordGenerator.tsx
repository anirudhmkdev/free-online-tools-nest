import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useCallback } from "react";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";

/**
 * PasswordGenerator — generate cryptographically random passwords
 * with configurable character sets and strength indicator.
 */

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const DIGITS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";
const AMBIGUOUS = "0OIl1|";

type Strength = { label: string; color: string; score: number };

function getStrength(length: number, charSetSize: number): Strength {
  const entropy = Math.log2(charSetSize) * length;
  if (entropy < 40) return { label: "Weak", color: "var(--color-error)", score: 1 };
  if (entropy < 60) return { label: "Medium", color: "#eab308", score: 2 };
  if (entropy < 80) return { label: "Strong", color: "#22c55e", score: 3 };
  return { label: "Very Strong", color: "#16a34a", score: 4 };
}

function generatePassword(length: number, charset: string): string {
  const random = new Uint32Array(length);
  crypto.getRandomValues(random);
  let pwd = "";
  for (let i = 0; i < length; i++) {
    pwd += charset[random[i] % charset.length];
  }
  return pwd;
}

export default function PasswordGenerator() {
  const { markInteraction, recordSuccess } = useToolTelemetry();
  const [length, setLength] = useState(16);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useDigits, setUseDigits] = useState(true);
  const [useSymbols, setUseSymbols] = useState(false);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [count, setCount] = useState(1);
  const [passwords, setPasswords] = useState<string[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copiedAll, handleCopyAll] = useCopyToClipboard();

  const handleCopy = useCallback(async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    } catch { /* ignore */ }
  }, []);

  const handleGenerate = useCallback(() => {
    markInteraction();
    let charset = "";
    if (useUpper) charset += UPPER;
    if (useLower) charset += LOWER;
    if (useDigits) charset += DIGITS;
    if (useSymbols) charset += SYMBOLS;

    if (excludeAmbiguous) {
      charset = charset.split("").filter((c) => !AMBIGUOUS.includes(c)).join("");
    }

    if (!charset) {
      // Fallback to lowercase if nothing selected
      charset = LOWER;
    }

    // Ensure at least one char from each selected type is included
    const generated: string[] = [];
    for (let i = 0; i < count; i++) {
      let pwd = generatePassword(length, charset);

      // Enforce at least one of each selected type
      if (useUpper && !pwd.split("").some((c) => UPPER.includes(c))) {
        pwd = pwd.slice(1) + UPPER[crypto.getRandomValues(new Uint32Array(1))[0] % UPPER.length];
      }
      if (useLower && !pwd.split("").some((c) => LOWER.includes(c))) {
        pwd = pwd.slice(1) + LOWER[crypto.getRandomValues(new Uint32Array(1))[0] % LOWER.length];
      }
      if (useDigits && !pwd.split("").some((c) => DIGITS.includes(c))) {
        pwd = pwd.slice(1) + DIGITS[crypto.getRandomValues(new Uint32Array(1))[0] % DIGITS.length];
      }
      if (useSymbols && !pwd.split("").some((c) => SYMBOLS.includes(c))) {
        pwd = pwd.slice(1) + SYMBOLS[crypto.getRandomValues(new Uint32Array(1))[0] % SYMBOLS.length];
      }

      generated.push(pwd);
    }
    setPasswords(generated);
    if (generated.length > 0) recordSuccess("generate");
  }, [length, useUpper, useLower, useDigits, useSymbols, excludeAmbiguous, count]);

  const charSetsUsed = [useUpper, useLower, useDigits, useSymbols].filter(Boolean).length;
  const charSetSizes = [
    useUpper ? UPPER.length : 0,
    useLower ? LOWER.length : 0,
    useDigits ? DIGITS.length : 0,
    useSymbols ? SYMBOLS.length : 0,
  ].reduce((a, b) => a + b, excludeAmbiguous ? -4 : 0);

  const strength = passwords.length > 0 ? getStrength(length, Math.max(charSetSizes, 26)) : null;

  return (
    <div onChangeCapture={markInteraction} className="space-y-6">
      {/* Length */}
      <div>
        <label htmlFor="pwd-length" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
          Length: <span className="font-mono font-semibold">{length}</span>
        </label>
        <div className="flex items-center gap-4">
          <input
            id="pwd-length"
            type="range"
            min={4}
            max={128}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
            style={{
              accentColor: "var(--color-primary)",
              backgroundColor: "var(--color-canvas-soft)",
            }}
          />
          <input
            type="number"
            min={4}
            max={128}
            value={length}
            onChange={(e) => setLength(Math.min(128, Math.max(4, parseInt(e.target.value) || 4)))}
            className="h-10 w-20 px-3 border rounded-md text-sm text-center outline-none"
            style={{
              backgroundColor: "var(--color-canvas)",
              borderColor: "var(--color-hairline)",
              color: "var(--color-ink)",
              fontFamily: "var(--font-mono)",
            }}
          />
        </div>
      </div>

      {/* Character types */}
      <div>
        <span className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--color-mute)" }}>
          Character Types
        </span>
        <div className="flex flex-wrap gap-4 p-3 rounded-lg border" style={{ borderColor: "var(--color-hairline)", backgroundColor: "var(--color-canvas)" }}>
          {[
            { key: "useUpper", label: "A–Z (Uppercase)", checked: useUpper, set: setUseUpper },
            { key: "useLower", label: "a–z (Lowercase)", checked: useLower, set: setUseLower },
            { key: "useDigits", label: "0–9 (Numbers)", checked: useDigits, set: setUseDigits },
            { key: "useSymbols", label: "!@#$%^&* (Symbols)", checked: useSymbols, set: setUseSymbols },
          ].map((opt) => (
            <label key={opt.key} className="flex items-center gap-2 text-sm cursor-pointer select-none" style={{ color: "var(--color-ink)" }}>
              <input
                type="checkbox"
                checked={opt.checked}
                onChange={(e) => opt.set(e.target.checked)}
                className="rounded"
                style={{ accentColor: "var(--color-primary)" }}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      {/* Exclude ambiguous & count */}
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none" style={{ color: "var(--color-ink)" }}>
          <input
            type="checkbox"
            checked={excludeAmbiguous}
            onChange={(e) => setExcludeAmbiguous(e.target.checked)}
            className="rounded"
            style={{ accentColor: "var(--color-primary)" }}
          />
          Exclude ambiguous characters (0, O, I, l, 1, |)
        </label>

        <div>
          <label htmlFor="pwd-count" className="block text-xs font-medium mb-1" style={{ color: "var(--color-mute)" }}>
            Generate count
          </label>
          <input
            id="pwd-count"
            type="number"
            min={1}
            max={20}
            value={count}
            onChange={(e) => setCount(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
            className="h-10 w-20 px-3 border rounded-md text-sm outline-none"
            style={{
              backgroundColor: "var(--color-canvas)",
              borderColor: "var(--color-hairline)",
              color: "var(--color-ink)",
            }}
          />
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          className="btn-primary btn-sm"
          style={{ backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)" }}
        >
          Generate
        </button>
      </div>

      {/* Results */}
      {passwords.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>
              Generated Passwords ({passwords.length})
            </span>
            {passwords.length > 1 && (
              <button
                type="button"
                onClick={() => handleCopyAll(passwords.join("\n"))}
                className="text-sm px-3 py-1 rounded-md transition-colors duration-150"
                style={{
                  color: copiedAll ? "var(--color-success)" : "var(--color-link)",
                  backgroundColor: "var(--color-canvas-soft-2)",
                }}
              >
                {copiedAll ? "Copied All" : "Copy All"}
              </button>
            )}
          </div>

          {/* Strength indicator */}
          {strength && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className="w-8 h-2 rounded-full transition-colors duration-200"
                    style={{
                      backgroundColor: level <= strength.score ? strength.color : "var(--color-hairline)",
                    }}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold" style={{ color: strength.color }}>
                {strength.label}
              </span>
            </div>
          )}

          {/* Password list */}
          <div className="space-y-2">
            {passwords.map((pwd, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-3 rounded-lg border"
                style={{
                  backgroundColor: "var(--color-canvas-soft-2)",
                  borderColor: "var(--color-hairline)",
                }}
              >
                <span
                  className="flex-1 text-sm font-mono break-all select-all"
                  style={{ color: "var(--color-ink)" }}
                >
                  {pwd}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(pwd, idx)}
                  className="text-xs px-2.5 py-1.5 rounded-md transition-colors duration-150 flex-shrink-0"
                  style={{
                    color: copiedIdx === idx ? "var(--color-success)" : "var(--color-link)",
                    backgroundColor: "var(--color-canvas)",
                    border: "1px solid var(--color-hairline)",
                  }}
                >
                  {copiedIdx === idx ? "Copied" : "Copy"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
