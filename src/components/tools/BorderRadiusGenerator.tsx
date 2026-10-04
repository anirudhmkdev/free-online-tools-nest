import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useMemo, useEffect } from "react";

export default function BorderRadiusGenerator() {
  const { markInteraction, recordSuccess, clearInteraction } = useToolTelemetry();
  const [topLeft, setTopLeft] = useState(16);
  const [topRight, setTopRight] = useState(16);
  const [bottomRight, setBottomRight] = useState(16);
  const [bottomLeft, setBottomLeft] = useState(16);
  const [uniform, setUniform] = useState(true);
  const [copied, setCopied] = useState(false);

  const setAll = (value: number) => {
    setTopLeft(value);
    setTopRight(value);
    setBottomRight(value);
    setBottomLeft(value);
  };

  const handleUniformChange = (value: number) => {
    setAll(value);
  };

  const handleCornerChange = (setter: (v: number) => void, value: number) => {
    setter(value);
    if (uniform) {
      setAll(value);
    }
  };

  const clamp = (v: number) => Math.min(100, Math.max(0, v));

  const cssValue = useMemo(() => {
    return `border-radius: ${topLeft}px ${topRight}px ${bottomRight}px ${bottomLeft}px;`;
  }, [topLeft, topRight, bottomRight, bottomLeft]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cssValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  const corners = [
    { label: "Top-Left", value: topLeft, set: setTopLeft, id: "tl-radius" },
    { label: "Top-Right", value: topRight, set: setTopRight, id: "tr-radius" },
    { label: "Bottom-Right", value: bottomRight, set: setBottomRight, id: "br-radius" },
    { label: "Bottom-Left", value: bottomLeft, set: setBottomLeft, id: "bl-radius" },
  ];

  useEffect(() => {
    if ([topLeft, topRight, bottomRight, bottomLeft].every(Number.isFinite)) recordSuccess("generate");
  }, [topLeft, topRight, bottomRight, bottomLeft, uniform, recordSuccess]);

  return (
    <div className="space-y-6">
      {/* Live preview */}
      <div
        className="w-full h-44 rounded-xl border flex items-center justify-center transition-all duration-200"
        style={{
          borderRadius: `${topLeft}px ${topRight}px ${bottomRight}px ${bottomLeft}px`,
          background: "linear-gradient(135deg, var(--color-primary), #6366f1)",
          borderColor: "var(--color-hairline)",
        }}
        aria-label="Border radius preview"
      >
        <span className="text-sm font-medium" style={{ color: "var(--color-on-primary)" }}>
          Preview
        </span>
      </div>

      {/* Uniform toggle */}
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none" style={{ color: "var(--color-ink)" }}>
          <input
            type="checkbox"
            checked={uniform}
            onChange={(e) => {
              if (e.target.value.trim()) markInteraction(); else clearInteraction();
              setUniform(e.target.checked);
              if (e.target.checked) {
                setAll(topLeft);
              }
            }}
            className="rounded"
            style={{ accentColor: "var(--color-primary)" }}
          />
          Uniform (same value for all corners)
        </label>
      </div>

      {/* Corner sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {corners.map((corner) => (
          <div key={corner.id}>
            <label htmlFor={corner.id} className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
              {corner.label}: <span className="font-mono font-semibold">{corner.value}px</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                id={corner.id}
                type="range"
                min={0}
                max={100}
                value={uniform && corner.value !== topLeft ? topLeft : corner.value}
                onChange={(e) => {
              if (e.target.value.trim()) markInteraction(); else clearInteraction();
                  const val = Number(e.target.value);
                  if (uniform) {
                    handleUniformChange(val);
                  } else {
                    handleCornerChange(corner.set, val);
                  }
                }}
                className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  accentColor: "var(--color-primary)",
                  backgroundColor: "var(--color-canvas-soft)",
                }}
              />
              <input
                type="number"
                min={0}
                max={100}
                value={uniform ? topLeft : corner.value}
                onChange={(e) => {
              if (e.target.value.trim()) markInteraction(); else clearInteraction();
                  const val = clamp(parseInt(e.target.value) || 0);
                  if (uniform) {
                    handleUniformChange(val);
                  } else {
                    handleCornerChange(corner.set, val);
                  }
                }}
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
        ))}
      </div>

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
