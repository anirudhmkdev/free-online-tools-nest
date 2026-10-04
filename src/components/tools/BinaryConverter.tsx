import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useCallback, useMemo, useEffect } from "react";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";

type Base = "binary" | "decimal" | "hex" | "octal";

const BASE_OPTIONS: { key: Base; label: string }[] = [
  { key: "binary", label: "Binary (2)" },
  { key: "decimal", label: "Decimal (10)" },
  { key: "hex", label: "Hex (16)" },
  { key: "octal", label: "Octal (8)" },
];

function parseValue(value: string, base: Base): number | null {
  if (!value.trim()) return null;
  switch (base) {
    case "binary": {
      if (!/^[01]+$/.test(value)) return null;
      return parseInt(value, 2);
    }
    case "decimal": {
      if (!/^\d+$/.test(value)) return null;
      return parseInt(value, 10);
    }
    case "hex": {
      if (!/^[0-9a-fA-F]+$/.test(value)) return null;
      return parseInt(value, 16);
    }
    case "octal": {
      if (!/^[0-7]+$/.test(value)) return null;
      return parseInt(value, 8);
    }
  }
}

export default function BinaryConverter() {
  const { markInteraction, recordSuccess } = useToolTelemetry();
  const [input, setInput] = useState("");
  const [base, setBase] = useState<Base>("decimal");
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  const num = useMemo(() => parseValue(input, base), [input, base]);
  const isValid = input.trim() === "" || num !== null;

  const outputs = useMemo(() => {
    if (num === null) {
      return {
        binary: "",
        decimal: "",
        hex: "",
        octal: "",
      };
    }
    return {
      binary: num.toString(2),
      decimal: num.toString(10),
      hex: num.toString(16).toUpperCase(),
      octal: num.toString(8),
    };
  }, [num]);

  const handleCopy = useCallback(async (value: string, label: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedLabel(label);
      setTimeout(() => setCopiedLabel(null), 2000);
    } catch {
      setCopiedLabel(null);
    }
  }, []);

  useEffect(() => {
    if (input.trim() && num !== null && Number.isSafeInteger(num)) recordSuccess("convert");
  }, [input, num, recordSuccess]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label htmlFor="bin-input" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            Enter value
          </label>
          <input
            id="bin-input"
            type="text"
            value={input}
            onChange={(e) => { markInteraction(); setInput(e.target.value); }}
            placeholder={base === "decimal" ? "42" : base === "binary" ? "101010" : base === "hex" ? "2A" : "52"}
            className="w-full h-12 px-4 border rounded-lg text-base outline-none font-mono"
            style={{
              backgroundColor: "var(--color-canvas-soft)",
              borderColor: isValid ? "var(--color-hairline)" : "var(--color-error)",
              color: "var(--color-ink)",
              fontFamily: "var(--font-mono)",
            }}
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            Input base
          </label>
          <select
            value={base}
            onChange={(e) => setBase(e.target.value as Base)}
            className="h-12 px-3 text-sm border rounded-lg outline-none"
            style={{
              backgroundColor: "var(--color-canvas-soft)",
              borderColor: "var(--color-hairline)",
              color: "var(--color-ink)",
            }}
          >
            {BASE_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {!isValid && input.trim() !== "" && (
        <div className="px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: "var(--color-error)", color: "#fff" }} role="alert">
          Invalid characters for {base} input
        </div>
      )}

      <div className="space-y-3">
        {[
          { label: "Binary", key: "binary", value: outputs.binary },
          { label: "Decimal", key: "decimal", value: outputs.decimal },
          { label: "Hex", key: "hex", value: outputs.hex },
          { label: "Octal", key: "octal", value: outputs.octal },
        ].map((item) => (
          <div
            key={item.key}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg gap-2"
            style={{ backgroundColor: "var(--color-canvas-soft-2)" }}
          >
            <span className="text-xs uppercase tracking-wider" style={{ color: "var(--color-mute)", fontFamily: "var(--font-mono)" }}>
              {item.label}
            </span>
            <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
              <code className="text-sm break-all" style={{ color: "var(--color-ink)", fontFamily: "var(--font-mono)" }}>
                {item.value || (num === null ? "" : "0")}
              </code>
              <button
                type="button"
                onClick={() => handleCopy(item.value || "0", item.key)}
                className="text-xs px-2 py-1 rounded transition-colors duration-150 shrink-0"
                style={{
                  color: copiedLabel === item.key ? "var(--color-success)" : "var(--color-link)",
                }}
              >
                {copiedLabel === item.key ? "\u2713" : "Copy"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
