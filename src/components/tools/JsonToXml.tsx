import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useCallback } from "react";
import ErrorBanner from "../ErrorBanner";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function jsonToXml(value: unknown, name: string, depth: number): string {
  const indent = "  ".repeat(depth);
  const nextIndent = "  ".repeat(depth + 1);

  if (value === null) {
    return `${indent}<${name} xsi:nil="true"/>\n`;
  }

  if (typeof value === "string") {
    return `${indent}<${name}>${escapeXml(value)}</${name}>\n`;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return `${indent}<${name}>${String(value)}</${name}>\n`;
  }

  if (Array.isArray(value)) {
    const singular = name.replace(/s$/, "") || "item";
    if (value.length === 0) {
      return `${indent}<${name}>\n${nextIndent}<${singular}/>\n${indent}</${name}>\n`;
    }
    let xml = `${indent}<${name}>\n`;
    for (const item of value) {
      xml += jsonToXml(item, singular, depth + 1);
    }
    xml += `${indent}</${name}>\n`;
    return xml;
  }

  if (typeof value === "object") {
    let xml = `${indent}<${name}>\n`;
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      xml += jsonToXml(val, key, depth + 1);
    }
    xml += `${indent}</${name}>\n`;
    return xml;
  }

  return `${indent}<${name}>${escapeXml(String(value))}</${name}>\n`;
}

export default function JsonToXml() {
  const { markInteraction, recordSuccess, clearInteraction } = useToolTelemetry();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [rootName, setRootName] = useState("root");
  const [error, setError] = useState("");
  const [copied, handleCopy] = useCopyToClipboard();

  const convert = useCallback(() => {
    markInteraction();
    if (!input.trim()) {
      setOutput("");
      setError("");
      return;
    }

    const name = rootName.trim() || "root";

    try {
      const parsed = JSON.parse(input);
      const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' + jsonToXml(parsed, name, 0);
      setOutput(xml);
      const xmlDocument = new DOMParser().parseFromString(xml, "application/xml");
      if (!xmlDocument.querySelector("parsererror")) recordSuccess("convert");
      setError("");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Invalid JSON";
      setError(msg);
      setOutput("");
    }
  }, [input, rootName, markInteraction, recordSuccess]);

  const handleClear = () => {
    clearInteraction();
    setInput("");
    setOutput("");
    setError("");
  };

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="json-input" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
          Paste your JSON
        </label>
        <textarea
          id="json-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='{"name": "John", "age": 30, "items": [1, 2, 3]}'
          rows={8}
          className="w-full p-4 border rounded-lg text-sm resize-y outline-none transition-colors duration-150"
          style={{
            backgroundColor: "var(--color-canvas-soft)",
            borderColor: error ? "var(--color-error)" : "var(--color-hairline)",
            color: "var(--color-ink)",
            fontFamily: "var(--font-mono)",
          }}
          spellCheck={false}
        />
      </div>

      <ErrorBanner message={error} />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={convert}
          className="btn-primary btn-sm"
          style={{ backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)" }}
        >
          Convert to XML
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="text-xs px-3 py-1.5 rounded transition-colors duration-150 border"
          style={{
            borderColor: "var(--color-hairline)",
            color: "var(--color-mute)",
          }}
        >
          Clear
        </button>

        <div className="flex items-center gap-2 ml-auto">
          <label htmlFor="root-name" className="text-xs" style={{ color: "var(--color-mute)" }}>
            Root element
          </label>
          <input
            id="root-name"
            type="text"
            value={rootName}
            onChange={(e) => setRootName(e.target.value)}
            className="h-8 px-2 text-xs border rounded-md outline-none w-24"
            style={{
              backgroundColor: "var(--color-canvas)",
              borderColor: "var(--color-hairline)",
              color: "var(--color-ink)",
            }}
          />
        </div>
      </div>

      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>XML output</span>
            <button
              type="button"
              onClick={() => handleCopy(output)}
              className="text-sm px-3 py-1 rounded-md transition-colors duration-150"
              style={{
                color: copied ? "var(--color-success)" : "var(--color-link)",
                backgroundColor: "var(--color-canvas-soft-2)",
              }}
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <pre
            className="p-4 rounded-lg text-sm overflow-x-auto max-h-96"
            style={{
              backgroundColor: "var(--color-canvas-soft-2)",
              color: "var(--color-ink)",
              fontFamily: "var(--font-mono)",
              lineHeight: "1.6",
            }}
          >
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}
