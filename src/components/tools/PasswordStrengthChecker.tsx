import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useCallback, useEffect } from "react";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const DIGITS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";
const AMBIGUOUS = "0OIl1|";

interface StrengthResult {
  score: number;
  label: string;
  color: string;
  segments: StrengthSegment[];
}

interface StrengthSegment {
  label: string;
  score: number;
  max: number;
  color: string;
}

function analyzeStrength(password: string): StrengthResult {
  const length = password.length;
  let totalScore = 0;

  const segments: StrengthSegment[] = [];

  const lengthScore = Math.min(40, Math.floor((length / 64) * 40));
  segments.push({ label: "Length", score: lengthScore, max: 40, color: "var(--color-primary)" });
  totalScore += lengthScore;

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);
  const varietyCount = [hasUpper, hasLower, hasDigit, hasSymbol].filter(Boolean).length;
  const varietyScore = Math.min(25, varietyCount * 6.25);
  segments.push({ label: "Character Variety", score: varietyScore, max: 25, color: "#8b5cf6" });
  totalScore += varietyScore;

  let patternScore = 25;
  const commonPatterns = [
    /12345|password|qwerty|abcde|letmein|admin|welcome|login/i,
    /(.)\1{2,}/,
    /0123|abcd|9876|dcba/i,
  ];
  for (const pat of commonPatterns) {
    if (pat.test(password)) {
      patternScore -= 8;
    }
  }
  if (length < 8) patternScore -= 5;
  if (varietyCount < 2) patternScore -= 5;
  patternScore = Math.max(0, patternScore);
  segments.push({ label: "Pattern Detection", score: patternScore, max: 25, color: "#f59e0b" });
  totalScore += patternScore;

  const entropyScore = Math.min(10, Math.floor(Math.log2(Math.max(26, 4 ** varietyCount)) * length / 8));
  segments.push({ label: "Entropy", score: entropyScore, max: 10, color: "#10b981" });
  totalScore += entropyScore;

  const capped = Math.min(100, Math.round(totalScore));
  const label =
    capped < 25 ? "Very Weak" :
    capped < 50 ? "Weak" :
    capped < 65 ? "Fair" :
    capped < 80 ? "Strong" :
    "Very Strong";
  const color =
    capped < 25 ? "var(--color-error)" :
    capped < 50 ? "#ef4444" :
    capped < 65 ? "#f59e0b" :
    capped < 80 ? "#22c55e" :
    "#16a34a";

  return { score: capped, label, color, segments };
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

export default function PasswordStrengthChecker() {
  const { markInteraction, recordSuccess } = useToolTelemetry();
  const [genLength, setGenLength] = useState(16);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useDigits, setUseDigits] = useState(true);
  const [useSymbols, setUseSymbols] = useState(false);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [generatedPwd, setGeneratedPwd] = useState("");
  const [copiedGen, handleCopyGen] = useCopyToClipboard();

  const [checkPwd, setCheckPwd] = useState("");
  const [copiedCheck, handleCopyCheck] = useCopyToClipboard();

  const strength = checkPwd ? analyzeStrength(checkPwd) : null;

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
    if (!charset) charset = LOWER;
    let pwd = generatePassword(genLength, charset);
    if (useUpper && ![...pwd].some((c) => UPPER.includes(c))) {
      pwd = pwd.slice(1) + UPPER[crypto.getRandomValues(new Uint32Array(1))[0] % UPPER.length];
    }
    if (useLower && ![...pwd].some((c) => LOWER.includes(c))) {
      pwd = pwd.slice(1) + LOWER[crypto.getRandomValues(new Uint32Array(1))[0] % LOWER.length];
    }
    if (useDigits && ![...pwd].some((c) => DIGITS.includes(c))) {
      pwd = pwd.slice(1) + DIGITS[crypto.getRandomValues(new Uint32Array(1))[0] % DIGITS.length];
    }
    if (useSymbols && ![...pwd].some((c) => SYMBOLS.includes(c))) {
      pwd = pwd.slice(1) + SYMBOLS[crypto.getRandomValues(new Uint32Array(1))[0] % SYMBOLS.length];
    }
    setGeneratedPwd(pwd);
    if (pwd.length > 0) recordSuccess("generate");
  }, [genLength, useUpper, useLower, useDigits, useSymbols, excludeAmbiguous]);

  const criteria = [
    { label: "At least 8 characters", pass: checkPwd.length >= 8 },
    { label: "Mixed case (upper + lower)", pass: /[a-z]/.test(checkPwd) && /[A-Z]/.test(checkPwd) },
    { label: "Includes numbers", pass: /[0-9]/.test(checkPwd) },
    { label: "Includes symbols", pass: /[^a-zA-Z0-9]/.test(checkPwd) },
    { label: "No common patterns", pass: !/(12345|password|qwerty|abcde|letmein|admin|welcome|login)/i.test(checkPwd) },
  ];

  useEffect(() => {
    if (strength !== null) recordSuccess("check");
  }, [strength, checkPwd, recordSuccess]);

  return (
    <div onChangeCapture={markInteraction} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Generator Card */}
      <div
        className="p-6 rounded-xl"
        style={{
          backgroundColor: "var(--color-canvas)",
          boxShadow: "var(--shadow-card)",
          border: "1px solid var(--color-hairline)",
        }}
      >
        <h2 className="text-base font-semibold mb-5" style={{ color: "var(--color-ink)" }}>
          Password Generator
        </h2>

        <div className="space-y-5">
          {/* Length slider */}
          <div>
            <label htmlFor="pwd-str-length" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
              Length: <span className="font-mono font-semibold">{genLength}</span>
            </label>
            <input
              id="pwd-str-length"
              type="range"
              min={4}
              max={64}
              value={genLength}
              onChange={(e) => setGenLength(Number(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{ accentColor: "var(--color-primary)", backgroundColor: "var(--color-canvas-soft)" }}
            />
          </div>

          {/* Character types */}
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--color-mute)" }}>
              Character Types
            </span>
            <div className="flex flex-wrap gap-3 p-3 rounded-lg border" style={{ borderColor: "var(--color-hairline)", backgroundColor: "var(--color-canvas-soft)" }}>
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

          {/* Exclude ambiguous */}
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

          {/* Generate + Copy */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleGenerate}
              className="px-5 py-2 rounded-lg text-sm font-medium transition-colors duration-150"
              style={{ backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)" }}
            >
              Generate
            </button>
            {generatedPwd && (
              <button
                type="button"
                onClick={() => handleCopyGen(generatedPwd)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150"
                style={{
                  color: copiedGen ? "var(--color-success)" : "var(--color-link)",
                  backgroundColor: "var(--color-canvas-soft-2)",
                  border: "1px solid var(--color-hairline)",
                }}
              >
                {copiedGen ? "Copied" : "Copy"}
              </button>
            )}
          </div>

          {/* Generated password display */}
          {generatedPwd && (
            <div
              className="p-4 rounded-lg text-sm font-mono break-all select-all"
              style={{
                backgroundColor: "var(--color-canvas-soft-2)",
                color: "var(--color-ink)",
                border: "1px solid var(--color-hairline)",
              }}
            >
              {generatedPwd}
            </div>
          )}
        </div>
      </div>

      {/* Strength Checker Card */}
      <div
        className="p-6 rounded-xl"
        style={{
          backgroundColor: "var(--color-canvas)",
          boxShadow: "var(--shadow-card)",
          border: "1px solid var(--color-hairline)",
        }}
      >
        <h2 className="text-base font-semibold mb-5" style={{ color: "var(--color-ink)" }}>
          Password Strength Checker
        </h2>

        <div className="space-y-5">
          <div>
            <label htmlFor="pwd-check" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
              Enter a password to analyze
            </label>
            <div className="flex gap-2">
              <input
                id="pwd-check"
                type="text"
                value={checkPwd}
                onChange={(e) => setCheckPwd(e.target.value)}
                placeholder="Type a password…"
                className="flex-1 h-10 px-4 border rounded-lg text-sm outline-none transition-colors duration-150"
                style={{
                  backgroundColor: "var(--color-canvas-soft)",
                  borderColor: "var(--color-hairline)",
                  color: "var(--color-ink)",
                  fontFamily: "var(--font-mono)",
                }}
              />
              {checkPwd && (
                <button
                  type="button"
                  onClick={() => handleCopyCheck(checkPwd)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150 flex-shrink-0"
                  style={{
                    color: copiedCheck ? "var(--color-success)" : "var(--color-link)",
                    backgroundColor: "var(--color-canvas-soft-2)",
                    border: "1px solid var(--color-hairline)",
                  }}
                >
                  {copiedCheck ? "Copied" : "Copy"}
                </button>
              )}
            </div>
          </div>

          {strength && (
            <>
              {/* Overall score */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>
                    Overall Strength
                  </span>
                  <span className="text-sm font-bold" style={{ color: strength.color }}>
                    {strength.score}% — {strength.label}
                  </span>
                </div>
                <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-canvas-soft-2)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${strength.score}%`, backgroundColor: strength.color }}
                  />
                </div>
              </div>

              {/* Segment scores */}
              <div className="space-y-2.5">
                {strength.segments.map((seg) => (
                  <div key={seg.label}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span style={{ color: "var(--color-body)" }}>{seg.label}</span>
                      <span style={{ color: "var(--color-mute)" }}>{Math.round(seg.score)}/{seg.max}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-canvas-soft-2)" }}>
                      <div
                        className="h-full rounded-full transition-all duration-200"
                        style={{ width: `${(seg.score / seg.max) * 100}%`, backgroundColor: seg.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Criteria checklist */}
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider mb-2.5" style={{ color: "var(--color-mute)" }}>
                  Criteria Checklist
                </span>
                <div className="space-y-1.5">
                  {criteria.map((c) => (
                    <div key={c.label} className="flex items-center gap-2 text-sm" style={{ color: "var(--color-ink)" }}>
                      <span style={{ color: c.pass ? "#22c55e" : "var(--color-mute)" }}>
                        {c.pass ? "✓" : "○"}
                      </span>
                      <span className={c.pass ? "" : "opacity-60"}>{c.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {!checkPwd && (
            <div className="py-8 text-center text-sm" style={{ color: "var(--color-mute)" }}>
              Enter a password above to see its strength analysis
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
