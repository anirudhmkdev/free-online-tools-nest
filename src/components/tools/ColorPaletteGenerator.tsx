import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useMemo, useEffect } from "react";

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

type PaletteType = "monochromatic" | "complementary" | "analogous" | "triadic" | "tetradic";

const PALETTE_TYPES: { value: PaletteType; label: string }[] = [
  { value: "monochromatic", label: "Monochromatic" },
  { value: "complementary", label: "Complementary" },
  { value: "analogous", label: "Analogous" },
  { value: "triadic", label: "Triadic" },
  { value: "tetradic", label: "Tetradic" },
];

function generatePalette(hex: string, type: PaletteType): string[] {
  const rgb = hexToRgb(hex);
  if (!rgb) return [hex, hex, hex, hex, hex];
  const [h, s, l] = rgbToHsl(rgb[0], rgb[1], rgb[2]);

  const hslToHex = (hh: number, ss: number, ll: number): string => {
    const [rr, gg, bb] = hslToRgb(hh, ss, ll);
    return rgbToHex(rr, gg, bb);
  };

  switch (type) {
    case "monochromatic": {
      const variations = [l * 0.6, l * 0.8, l, l * 1.15, l * 1.3].map((v) =>
        Math.min(100, Math.max(5, Math.round(v)))
      );
      return variations.map((v) => hslToHex(h, s * 0.7, v));
    }
    case "complementary": {
      const comp = (h + 180) % 360;
      return [
        hslToHex(h, s, Math.max(15, l - 20)),
        hslToHex(h, s, l),
        hslToHex(h, s, Math.min(85, l + 15)),
        hslToHex(comp, s, l),
        hslToHex(comp, s, Math.min(85, l + 15)),
      ];
    }
    case "analogous": {
      return [
        hslToHex((h - 60 + 360) % 360, s, l),
        hslToHex((h - 30 + 360) % 360, s, Math.min(85, l + 10)),
        hslToHex(h, s, l),
        hslToHex((h + 30) % 360, s, Math.min(85, l + 10)),
        hslToHex((h + 60) % 360, s, l),
      ];
    }
    case "triadic": {
      const t2 = (h + 120) % 360;
      const t3 = (h + 240) % 360;
      return [
        hslToHex(h, s, Math.max(20, l - 10)),
        hslToHex(h, s, l),
        hslToHex(t2, s, l),
        hslToHex(t2, s, Math.min(80, l + 10)),
        hslToHex(t3, s, l),
      ];
    }
    case "tetradic": {
      const c1 = (h + 180) % 360;
      const a1 = (h + 30) % 360;
      const a2 = (h + 210) % 360;
      return [
        hslToHex(h, s, l),
        hslToHex(c1, s, l),
        hslToHex(a1, s, Math.max(20, l - 10)),
        hslToHex(a2, s, Math.max(20, l - 10)),
        hslToHex(h, s, Math.min(80, l + 12)),
      ];
    }
  }
}

export default function ColorPaletteGenerator() {
  const { markInteraction, recordSuccess } = useToolTelemetry();
  const [baseColor, setBaseColor] = useState("#0070f3");
  const [hexInput, setHexInput] = useState("#0070f3");
  const [paletteType, setPaletteType] = useState<PaletteType>("monochromatic");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const palette = useMemo(() => generatePalette(baseColor, paletteType), [baseColor, paletteType]);

  const handleColorChange = (hex: string) => {
    markInteraction();
    setHexInput(hex);
    if (/^#[0-9a-f]{6}$/i.test(hex)) {
      setBaseColor(hex);
    }
  };

  const handleCopy = async (hex: string, index: number) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopiedIndex(index);
      setCopiedAll(false);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch { /* ignore */ }
  };

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(palette.join(", "));
      setCopiedAll(true);
      setCopiedIndex(null);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    if (/^#[0-9a-f]{6}$/i.test(hexInput) && palette.length > 0) recordSuccess("generate");
  }, [hexInput, palette, recordSuccess]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
        <div className="flex-1">
          <label htmlFor="base-color" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            Base Color
          </label>
          <div className="flex gap-3 items-center">
            <input
              id="base-color"
              type="color"
              value={baseColor}
              onChange={(e) => handleColorChange(e.target.value)}
              className="w-12 h-12 rounded-lg border cursor-pointer shrink-0"
              style={{ borderColor: "var(--color-hairline)", backgroundColor: "var(--color-canvas)" }}
            />
            <input
              type="text"
              value={hexInput}
              onChange={(e) => handleColorChange(e.target.value)}
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
      </div>

      <div>
        <span className="block text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--color-mute)" }}>
          Palette Type
        </span>
        <div className="flex flex-wrap gap-2">
          {PALETTE_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => { markInteraction(); setPaletteType(t.value); }}
              className="px-3 py-1.5 text-sm rounded-full border transition-all duration-150"
              style={{
                backgroundColor: paletteType === t.value ? "var(--color-primary)" : "var(--color-canvas)",
                color: paletteType === t.value ? "var(--color-on-primary)" : "var(--color-body)",
                borderColor: paletteType === t.value ? "var(--color-primary)" : "var(--color-hairline)",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-mute)" }}>
            Generated Palette
          </span>
          <button
            type="button"
            onClick={handleCopyAll}
            className="text-xs px-2.5 py-1.5 rounded-md transition-colors duration-150"
            style={{
              color: copiedAll ? "var(--color-success)" : "var(--color-link)",
              backgroundColor: "var(--color-canvas-soft-2)",
            }}
          >
            {copiedAll ? "Copied All" : "Copy All"}
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {palette.map((hex, index) => (
            <div key={index} className="flex flex-col items-center gap-1">
              <button
                type="button"
                onClick={() => handleCopy(hex, index)}
                className="w-full aspect-square rounded-lg border cursor-pointer transition-transform duration-150 hover:scale-105 active:scale-95"
                style={{ backgroundColor: hex, borderColor: "var(--color-hairline)" }}
                aria-label={`Copy ${hex}`}
                title={hex}
              />
              <span className="text-xs font-mono" style={{ color: "var(--color-mute)" }}>
                {hex}
              </span>
              <span className="text-[10px] transition-colors duration-150" style={{ color: copiedIndex === index ? "var(--color-success)" : "transparent" }}>
                Copied
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {palette.map((hex, index) => (
          <div key={index} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ backgroundColor: "var(--color-canvas-soft-2)" }}>
            <span className="text-xs font-mono" style={{ color: "var(--color-ink)" }}>
              {hex}
            </span>
            <button
              type="button"
              onClick={() => handleCopy(hex, index)}
              className="text-xs transition-colors duration-150"
              style={{ color: copiedIndex === index ? "var(--color-success)" : "var(--color-link)" }}
            >
              {copiedIndex === index ? "✓" : "Copy"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
