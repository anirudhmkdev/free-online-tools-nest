import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useCallback, useEffect } from "react";

/**
 * ColorConverter — convert between HEX, RGB, and HSL with live preview.
 */

function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace(/^#/, "");
  if (!/^[0-9a-f]{6}$/i.test(clean)) return null;
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("");
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

type InputFormat = "hex" | "rgb" | "hsl";

export default function ColorConverter() {
  const { markInteraction, recordSuccess, clearInteraction } = useToolTelemetry();
  const [format, setFormat] = useState<InputFormat>("hex");
  const [hexVal, setHexVal] = useState("#0070f3");
  const [rgbR, setRgbR] = useState(0);
  const [rgbG, setRgbG] = useState(112);
  const [rgbB, setRgbB] = useState(243);
  const [hslH, setHslH] = useState(212);
  const [hslS, setHslS] = useState(100);
  const [hslL, setHslL] = useState(48);
  const [copied, setCopied] = useState<string | null>(null);

  // Sync all values when user changes input
  const syncFromHex = useCallback((hex: string) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return;
    const [r, g, b] = rgb;
    setRgbR(r); setRgbG(g); setRgbB(b);
    const [h, s, l] = rgbToHsl(r, g, b);
    setHslH(h); setHslS(s); setHslL(l);
  }, []);

  const syncFromRgb = useCallback((r: number, g: number, b: number) => {
    setHexVal(rgbToHex(r, g, b));
    const [h, s, l] = rgbToHsl(r, g, b);
    setHslH(h); setHslS(s); setHslL(l);
  }, []);

  const syncFromHsl = useCallback((h: number, s: number, l: number) => {
    const [r, g, b] = hslToRgb(h, s, l);
    setRgbR(r); setRgbG(g); setRgbB(b);
    setHexVal(rgbToHex(r, g, b));
  }, []);

  // Initialize
  useEffect(() => {
    syncFromHex("#0070f3");
  }, []);

  const handleHexChange = (val: string) => {
    markInteraction();
    setHexVal(val);
    if (/^#[0-9a-f]{6}$/i.test(val)) {
      syncFromHex(val);
    }
  };

  const handleCopy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  };

  const previewColor = hexVal.match(/^#[0-9a-f]{6}$/i) ? hexVal : rgbToHex(rgbR, rgbG, rgbB);
  const hexString = hexVal.toUpperCase();
  const rgbString = `rgb(${rgbR}, ${rgbG}, ${rgbB})`;
  const hslString = `hsl(${hslH}, ${hslS}%, ${hslL}%)`;

  useEffect(() => {
    if (/^#[0-9a-f]{6}$/i.test(hexVal) && [rgbR, rgbG, rgbB, hslH, hslS, hslL].every(Number.isFinite)) recordSuccess("convert");
  }, [hexVal, rgbR, rgbG, rgbB, hslH, hslS, hslL, recordSuccess]);

  return (
    <div className="space-y-6">
      {/* Color preview */}
      <div className="flex items-center gap-4">
        <div
          className="w-20 h-20 rounded-lg shrink-0 border"
          style={{ backgroundColor: previewColor, borderColor: "var(--color-hairline)" }}
          aria-label={`Color preview: ${previewColor}`}
        />
        <div className="space-y-1">
          <div className="text-2xl font-semibold" style={{ color: "var(--color-ink)", letterSpacing: "-0.96px" }}>
            {hexString}
          </div>
          <div className="text-sm" style={{ color: "var(--color-mute)", fontFamily: "var(--font-mono)" }}>
            {rgbString}
          </div>
        </div>
      </div>

      {/* Input format tabs */}
      <div className="flex gap-2">
        {(["hex", "rgb", "hsl"] as InputFormat[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFormat(f)}
            className="px-3 py-1.5 text-sm rounded-full border transition-all duration-150 uppercase"
            style={{
              backgroundColor: format === f ? "var(--color-primary)" : "var(--color-canvas)",
              color: format === f ? "var(--color-on-primary)" : "var(--color-body)",
              borderColor: format === f ? "var(--color-primary)" : "var(--color-hairline)",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Inputs per format */}
      {format === "hex" && (
        <div>
          <label htmlFor="hex-input" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            HEX Value
          </label>
          <input
            id="hex-input"
            type="text"
            value={hexVal}
            onChange={(e) => handleHexChange(e.target.value)}
            placeholder="#0070f3"
            className="w-full h-12 px-4 border rounded-lg text-base outline-none"
            style={{
              backgroundColor: "var(--color-canvas-soft)",
              borderColor: "var(--color-hairline)",
              color: "var(--color-ink)",
              fontFamily: "var(--font-mono)",
            }}
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      )}

      {format === "rgb" && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "R", value: rgbR, set: (v: number) => { setRgbR(v); syncFromRgb(v, rgbG, rgbB); } },
            { label: "G", value: rgbG, set: (v: number) => { setRgbG(v); syncFromRgb(rgbR, v, rgbB); } },
            { label: "B", value: rgbB, set: (v: number) => { setRgbB(v); syncFromRgb(rgbR, rgbG, v); } },
          ].map((ch) => (
            <div key={ch.label}>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
                {ch.label}
              </label>
              <input
                type="number"
                min={0}
                max={255}
                value={ch.value}
                onChange={(e) => { if (e.target.value.trim()) markInteraction(); else clearInteraction(); ch.set(Math.min(255, Math.max(0, parseInt(e.target.value) || 0))); }}
                className="w-full h-12 px-4 border rounded-lg text-base outline-none"
                style={{
                  backgroundColor: "var(--color-canvas-soft)",
                  borderColor: "var(--color-hairline)",
                  color: "var(--color-ink)",
                }}
                inputMode="numeric"
              />
            </div>
          ))}
        </div>
      )}

      {format === "hsl" && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "H", value: hslH, max: 360, set: (v: number) => { setHslH(v); syncFromHsl(v, hslS, hslL); } },
            { label: "S%", value: hslS, max: 100, set: (v: number) => { setHslS(v); syncFromHsl(hslH, v, hslL); } },
            { label: "L%", value: hslL, max: 100, set: (v: number) => { setHslL(v); syncFromHsl(hslH, hslS, v); } },
          ].map((ch) => (
            <div key={ch.label}>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
                {ch.label}
              </label>
              <input
                type="number"
                min={0}
                max={ch.max}
                value={ch.value}
                onChange={(e) => { if (e.target.value.trim()) markInteraction(); else clearInteraction(); ch.set(Math.min(ch.max, Math.max(0, parseInt(e.target.value) || 0))); }}
                className="w-full h-12 px-4 border rounded-lg text-base outline-none"
                style={{
                  backgroundColor: "var(--color-canvas-soft)",
                  borderColor: "var(--color-hairline)",
                  color: "var(--color-ink)",
                }}
                inputMode="numeric"
              />
            </div>
          ))}
        </div>
      )}

      {/* All outputs */}
      <div className="space-y-2">
        <h3 className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--color-mute)", fontFamily: "var(--font-mono)" }}>
          All formats
        </h3>
        {[
          { label: "HEX", value: hexString },
          { label: "RGB", value: rgbString },
          { label: "HSL", value: hslString },
        ].map((item) => (
          <div
            key={item.label}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg gap-2"
            style={{ backgroundColor: "var(--color-canvas-soft-2)" }}
          >
            <span className="text-xs uppercase tracking-wider" style={{ color: "var(--color-mute)", fontFamily: "var(--font-mono)" }}>
              {item.label}
            </span>
            <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
              <code className="text-sm break-all" style={{ color: "var(--color-ink)", fontFamily: "var(--font-mono)" }}>
                {item.value}
              </code>
              <button
                type="button"
                onClick={() => handleCopy(item.value, item.label)}
                className="text-xs px-2 py-1 rounded transition-colors duration-150 shrink-0"
                style={{
                  color: copied === item.label ? "var(--color-success)" : "var(--color-link)",
                }}
              >
                {copied === item.label ? "✓" : "Copy"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
