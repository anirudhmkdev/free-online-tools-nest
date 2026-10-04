import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useCallback } from "react";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";

/**
 * UuidGenerator — generate UUID v4 strings with configurable format and quantity.
 * Uses crypto.randomUUID() with fallback to manual v4 implementation.
 */

function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback: manual v4 UUID
  const hex = "0123456789abcdef";
  const chars: string[] = [];
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      chars.push("-");
    } else if (i === 14) {
      chars.push("4");
    } else if (i === 19) {
      chars.push(hex[(Math.random() * 4) | 8]);
    } else {
      chars.push(hex[(Math.random() * 16) | 0]);
    }
  }
  return chars.join("");
}

function formatUUID(uuid: string, upperCase: boolean, withDashes: boolean): string {
  let result = uuid;
  if (!withDashes) {
    result = result.replace(/-/g, "");
  }
  if (upperCase) {
    result = result.toUpperCase();
  }
  return result;
}

export default function UuidGenerator() {
  const { markInteraction, recordSuccess } = useToolTelemetry();
  const [quantity, setQuantity] = useState(1);
  const [uuids, setUuids] = useState<string[]>([]);
  const [upperCase, setUpperCase] = useState(false);
  const [withDashes, setWithDashes] = useState(true);
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
    const generated: string[] = [];
    const seen = new Set<string>();
    const maxAttempts = quantity * 5;
    let attempts = 0;

    while (generated.length < quantity && attempts < maxAttempts) {
      attempts++;
      const uuid = generateUUID();
      const formatted = formatUUID(uuid, upperCase, withDashes);
      if (!seen.has(formatted)) {
        seen.add(formatted);
        generated.push(formatted);
      }
    }
    setUuids(generated);
    if (generated.length > 0) recordSuccess("generate");
  }, [quantity, upperCase, withDashes]);

  return (
    <div onChangeCapture={markInteraction} className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label htmlFor="uuid-quantity" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            Quantity (1–100)
          </label>
          <input
            id="uuid-quantity"
            type="number"
            min={1}
            max={100}
            value={quantity}
            onChange={(e) => setQuantity(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
            className="h-10 w-24 px-3 border rounded-md text-sm outline-none"
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

      {/* Options */}
      <div className="flex flex-wrap gap-4 p-3 rounded-lg border" style={{ borderColor: "var(--color-hairline)", backgroundColor: "var(--color-canvas)" }}>
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none" style={{ color: "var(--color-ink)" }}>
          <input
            type="checkbox"
            checked={upperCase}
            onChange={(e) => setUpperCase(e.target.checked)}
            className="rounded"
            style={{ accentColor: "var(--color-primary)" }}
          />
          Uppercase
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none" style={{ color: "var(--color-ink)" }}>
          <input
            type="checkbox"
            checked={withDashes}
            onChange={(e) => setWithDashes(e.target.checked)}
            className="rounded"
            style={{ accentColor: "var(--color-primary)" }}
          />
          With dashes
        </label>
      </div>

      {/* Results */}
      {uuids.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>
              Generated UUIDs ({uuids.length})
            </span>
            <button
              type="button"
              onClick={() => handleCopyAll(uuids.join("\n"))}
              className="text-sm px-3 py-1 rounded-md transition-colors duration-150"
              style={{
                color: copiedAll ? "var(--color-success)" : "var(--color-link)",
                backgroundColor: "var(--color-canvas-soft-2)",
              }}
            >
              {copiedAll ? "Copied All" : "Copy All"}
            </button>
          </div>

          <div
            className="border rounded-lg overflow-hidden"
            style={{ borderColor: "var(--color-hairline)" }}
          >
            <div
              className="max-h-80 overflow-y-auto p-2 space-y-1"
              style={{ backgroundColor: "var(--color-canvas-soft-2)" }}
            >
              {uuids.map((uuid, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-2 rounded-md"
                  style={{ backgroundColor: "var(--color-canvas)" }}
                >
                  <span
                    className="flex-1 text-sm font-mono break-all select-all"
                    style={{ color: "var(--color-ink)" }}
                  >
                    {uuid}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(uuid, idx)}
                    className="text-xs px-2.5 py-1 rounded-md transition-colors duration-150 flex-shrink-0"
                    style={{
                      color: copiedIdx === idx ? "var(--color-success)" : "var(--color-link)",
                      backgroundColor: "var(--color-canvas-soft-2)",
                      border: "1px solid var(--color-hairline)",
                    }}
                  >
                    {copiedIdx === idx ? "Copied" : "Copy"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
