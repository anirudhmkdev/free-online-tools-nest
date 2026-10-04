import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useMemo, useEffect } from "react";

function linearize(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex: string): number {
  const clean = hex.replace(/^#/, "");
  if (!/^[0-9a-f]{6}$/i.test(clean)) return 0;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

export function contrastRatio(fgHex: string, bgHex: string): number {
  const fg = relativeLuminance(fgHex);
  const bg = relativeLuminance(bgHex);
  const lighter = Math.max(fg, bg);
  const darker = Math.min(fg, bg);
  return (lighter + 0.05) / (darker + 0.05);
}

function isValidHex(hex: string): boolean {
  return /^#[0-9a-f]{6}$/i.test(hex);
}

interface CheckResult {
  label: string;
  threshold: number;
  pass: boolean;
}

export function getChecks(ratio: number): CheckResult[] {
  return [
    { label: "AA Normal Text", threshold: 4.5, pass: ratio >= 4.5 },
    { label: "AA Large Text", threshold: 3, pass: ratio >= 3 },
    { label: "AAA Normal Text", threshold: 7, pass: ratio >= 7 },
    { label: "AAA Large Text", threshold: 4.5, pass: ratio >= 4.5 },
    { label: "UI Components", threshold: 3, pass: ratio >= 3 },
  ];
}

function suggestAdjustment(
  fgHex: string,
  bgHex: string,
  ratio: number
): string {
  if (ratio >= 4.5) return "";
  const fgClean = fgHex.replace(/^#/, "");
  const bgClean = bgHex.replace(/^#/, "");
  const fgLum = relativeLuminance(fgHex);
  const bgLum = relativeLuminance(bgHex);
  if (fgLum > bgLum) {
    return `Try darkening the background (${bgHex}) or lightening the text (${fgHex}).`;
  }
  return `Try lightening the background (${bgHex}) or darkening the text (${fgHex}).`;
}

export default function ColorContrastChecker() {
  const { markInteraction, recordSuccess } = useToolTelemetry();
  const [fgColor, setFgColor] = useState("#171717");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [fgHexInput, setFgHexInput] = useState("#171717");
  const [bgHexInput, setBgHexInput] = useState("#ffffff");

  const ratio = useMemo(() => {
    if (!isValidHex(fgColor) || !isValidHex(bgColor)) return 0;
    return contrastRatio(fgColor, bgColor);
  }, [fgColor, bgColor]);

  const checks = useMemo(() => getChecks(ratio), [ratio]);

  const suggestion = useMemo(
    () => suggestAdjustment(fgColor, bgColor, ratio),
    [fgColor, bgColor, ratio]
  );

  const passCount = useMemo(() => checks.filter((c) => c.pass).length, [checks]);

  const handleFgChange = (hex: string) => {
    markInteraction();
    setFgHexInput(hex);
    if (isValidHex(hex)) setFgColor(hex);
  };

  const handleBgChange = (hex: string) => {
    markInteraction();
    setBgHexInput(hex);
    if (isValidHex(hex)) setBgColor(hex);
  };

  const swapColors = () => {
    markInteraction();
    const tmpFg = fgColor;
    const tmpBg = bgColor;
    setFgColor(tmpBg);
    setBgColor(tmpFg);
    setFgHexInput(tmpBg);
    setBgHexInput(tmpFg);
  };

  useEffect(() => {
    if (isValidHex(fgHexInput) && isValidHex(bgHexInput) && Number.isFinite(ratio)) recordSuccess("check");
  }, [ratio, fgHexInput, bgHexInput, recordSuccess]);

  return (
    <div className="space-y-6">
      {/* Color inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="fg-color" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            Foreground (Text)
          </label>
          <div className="flex gap-3 items-center">
            <input
              id="fg-color"
              type="color"
              value={fgColor}
              onChange={(e) => handleFgChange(e.target.value)}
              className="w-12 h-12 rounded-lg border cursor-pointer shrink-0"
              style={{ borderColor: "var(--color-hairline)", backgroundColor: "var(--color-canvas)" }}
            />
            <input
              type="text"
              value={fgHexInput}
              onChange={(e) => handleFgChange(e.target.value)}
              placeholder="#171717"
              className="w-full h-12 px-4 border rounded-lg text-base font-mono outline-none"
              style={{
                backgroundColor: "var(--color-canvas-soft)",
                borderColor: "var(--color-hairline)",
                color: "var(--color-ink)",
              }}
              spellCheck={false}
              maxLength={7}
            />
          </div>
        </div>
        <div>
          <label htmlFor="bg-color" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            Background
          </label>
          <div className="flex gap-3 items-center">
            <input
              id="bg-color"
              type="color"
              value={bgColor}
              onChange={(e) => handleBgChange(e.target.value)}
              className="w-12 h-12 rounded-lg border cursor-pointer shrink-0"
              style={{ borderColor: "var(--color-hairline)", backgroundColor: "var(--color-canvas)" }}
            />
            <input
              type="text"
              value={bgHexInput}
              onChange={(e) => handleBgChange(e.target.value)}
              placeholder="#ffffff"
              className="w-full h-12 px-4 border rounded-lg text-base font-mono outline-none"
              style={{
                backgroundColor: "var(--color-canvas-soft)",
                borderColor: "var(--color-hairline)",
                color: "var(--color-ink)",
              }}
              spellCheck={false}
              maxLength={7}
            />
          </div>
        </div>
      </div>

      {/* Swap button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={swapColors}
          className="px-4 py-2 text-sm rounded-full border transition-all duration-150"
          style={{
            backgroundColor: "var(--color-canvas)",
            color: "var(--color-body)",
            borderColor: "var(--color-hairline)",
          }}
        >
          ⇄ Swap Colors
        </button>
      </div>

      {/* Visual preview */}
      <div
        className="p-6 rounded-lg min-h-[120px] flex flex-col justify-center"
        style={{ backgroundColor: bgColor, border: "1px solid var(--color-hairline)" }}
      >
        <p
          className="text-lg font-medium mb-1"
          style={{ color: fgColor }}
        >
          The quick brown fox jumps over the lazy dog.
        </p>
        <p
          className="text-sm"
          style={{ color: fgColor, opacity: 0.7 }}
        >
          Small text sample for visual comparison.
        </p>
      </div>

      {/* Contrast ratio */}
      {ratio > 0 && (
        <div className="p-6 rounded-lg text-center" style={{ backgroundColor: "var(--color-canvas-soft-2)" }}>
          <div className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--color-mute)", fontFamily: "var(--font-mono)" }}>
            Contrast Ratio
          </div>
          <div className="text-4xl font-semibold" style={{ color: "var(--color-ink)", letterSpacing: "-1.28px" }}>
            {ratio.toFixed(2)}:1
          </div>
          <div className="mt-2 text-sm" style={{ color: passCount === 5 ? "var(--color-success)" : "var(--color-warning)" }}>
            {passCount === 5 ? "All WCAG checks passed" : `${passCount}/5 WCAG checks passed`}
          </div>
        </div>
      )}

      {/* WCAG checks */}
      <div className="space-y-2">
        <h3 className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--color-mute)", fontFamily: "var(--font-mono)" }}>
          WCAG 2.1 Compliance
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {checks.map((check) => (
            <div
              key={check.label}
              className="flex items-center justify-between px-4 py-3 rounded-lg"
              style={{ backgroundColor: "var(--color-canvas-soft-2)" }}
            >
              <div>
                <span className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>
                  {check.label}
                </span>
                <span className="text-xs ml-2" style={{ color: "var(--color-mute)" }}>
                  (≥ {check.threshold}:1)
                </span>
              </div>
              <span
                className="text-sm font-semibold"
                style={{ color: check.pass ? "var(--color-success)" : "var(--color-error)" }}
              >
                {check.pass ? "PASS" : "FAIL"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Suggestion */}
      {suggestion && (
        <div className="p-4 rounded-lg text-sm" style={{ backgroundColor: "var(--color-canvas-soft-2)", color: "var(--color-body)", borderLeft: "3px solid var(--color-warning)" }}>
          {suggestion}
        </div>
      )}
    </div>
  );
}
