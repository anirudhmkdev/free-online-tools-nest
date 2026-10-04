import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useMemo, useEffect } from "react";

type GradientType = "linear" | "radial";

export default function GradientGenerator() {
  const { markInteraction, recordSuccess, clearInteraction } = useToolTelemetry();
  const [startColor, setStartColor] = useState("#0070f3");
  const [startInput, setStartInput] = useState("#0070f3");
  const [endColor, setEndColor] = useState("#00c6ff");
  const [endInput, setEndInput] = useState("#00c6ff");
  const [gradientType, setGradientType] = useState<GradientType>("linear");
  const [angle, setAngle] = useState(135);
  const [copied, setCopied] = useState(false);

  const isValidHex = (hex: string) => /^#[0-9a-f]{6}$/i.test(hex);

  const handleStartChange = (hex: string) => {
    markInteraction();
    setStartInput(hex);
    if (isValidHex(hex)) setStartColor(hex);
  };

  const handleEndChange = (hex: string) => {
    markInteraction();
    setEndInput(hex);
    if (isValidHex(hex)) setEndColor(hex);
  };

  const cssValue = useMemo(() => {
    if (gradientType === "linear") {
      return `background: linear-gradient(${angle}deg, ${startColor}, ${endColor});`;
    }
    return `background: radial-gradient(circle, ${startColor}, ${endColor});`;
  }, [startColor, endColor, gradientType, angle]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cssValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    if (isValidHex(startInput) && isValidHex(endInput) && Number.isFinite(angle)) recordSuccess("generate");
  }, [startInput, endInput, angle, cssValue, recordSuccess]);

  return (
    <div className="space-y-6">
      {/* Preview */}
      <div
        className="w-full h-48 rounded-xl border"
        style={{
          background: gradientType === "linear"
            ? `linear-gradient(${angle}deg, ${startColor}, ${endColor})`
            : `radial-gradient(circle, ${startColor}, ${endColor})`,
          borderColor: "var(--color-hairline)",
        }}
        aria-label="Gradient preview"
      />

      {/* Color inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="start-color" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            Start Color
          </label>
          <div className="flex gap-3 items-center">
            <input
              id="start-color"
              type="color"
              value={startColor}
              onChange={(e) => handleStartChange(e.target.value)}
              className="w-12 h-12 rounded-lg border cursor-pointer shrink-0"
              style={{ borderColor: "var(--color-hairline)", backgroundColor: "var(--color-canvas)" }}
            />
            <input
              type="text"
              value={startInput}
              onChange={(e) => handleStartChange(e.target.value)}
              placeholder="#0070f3"
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
          <label htmlFor="end-color" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            End Color
          </label>
          <div className="flex gap-3 items-center">
            <input
              id="end-color"
              type="color"
              value={endColor}
              onChange={(e) => handleEndChange(e.target.value)}
              className="w-12 h-12 rounded-lg border cursor-pointer shrink-0"
              style={{ borderColor: "var(--color-hairline)", backgroundColor: "var(--color-canvas)" }}
            />
            <input
              type="text"
              value={endInput}
              onChange={(e) => handleEndChange(e.target.value)}
              placeholder="#00c6ff"
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

      {/* Type */}
      <div>
        <span className="block text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--color-mute)" }}>
          Gradient Type
        </span>
        <div className="flex gap-2">
          {(["linear", "radial"] as GradientType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { markInteraction(); setGradientType(t); }}
              className="px-4 py-2 text-sm rounded-full border transition-all duration-150 capitalize"
              style={{
                backgroundColor: gradientType === t ? "var(--color-primary)" : "var(--color-canvas)",
                color: gradientType === t ? "var(--color-on-primary)" : "var(--color-body)",
                borderColor: gradientType === t ? "var(--color-primary)" : "var(--color-hairline)",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Angle slider */}
      {gradientType === "linear" && (
        <div>
          <label htmlFor="gradient-angle" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            Angle: <span className="font-mono font-semibold">{angle}°</span>
          </label>
          <div className="flex items-center gap-4">
            <input
              id="gradient-angle"
              type="range"
              min={0}
              max={360}
              value={angle}
              onChange={(e) => { markInteraction(); setAngle(Number(e.target.value)); }}
              className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                accentColor: "var(--color-primary)",
                backgroundColor: "var(--color-canvas-soft)",
              }}
            />
            <input
              type="number"
              min={0}
              max={360}
              value={angle}
              onChange={(e) => { if (e.target.value.trim()) markInteraction(); else clearInteraction(); setAngle(Math.min(360, Math.max(0, parseInt(e.target.value) || 0))); }}
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
      )}

      {/* CSS output */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-mute)", fontFamily: "var(--font-mono)" }}>
            CSS Code
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="text-xs px-2.5 py-1.5 rounded-md transition-colors duration-150"
            style={{
              color: copied ? "var(--color-success)" : "var(--color-link)",
              backgroundColor: "var(--color-canvas-soft-2)",
            }}
          >
            {copied ? "Copied" : "Copy CSS"}
          </button>
        </div>
        <pre
          className="p-4 rounded-lg border text-sm overflow-x-auto"
          style={{
            backgroundColor: "var(--color-canvas-soft)",
            borderColor: "var(--color-hairline)",
            color: "var(--color-ink)",
            fontFamily: "var(--font-mono)",
          }}
        >
          <code>{cssValue}</code>
        </pre>
      </div>
    </div>
  );
}
