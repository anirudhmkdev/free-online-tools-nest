import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useCallback } from "react";
import ErrorBanner from "../ErrorBanner";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";

/**
 * Base64EncoderDecoder — encode text to Base64 or decode Base64 back to text.
 * Uses native btoa/atob (no external dependency).
 */
export default function Base64EncoderDecoder() {
  const { markInteraction, recordSuccess } = useToolTelemetry();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [error, setError] = useState("");
  const [copied, handleCopy] = useCopyToClipboard();

  const process = useCallback(() => {
    markInteraction();
    if (!input.trim()) {
      setOutput("");
      setError("");
      return;
    }
    try {
      if (mode === "encode") {
        // Handle Unicode by encoding to UTF-8 first
        const encoded = btoa(
          encodeURIComponent(input).replace(/%([0-9A-F]{2})/g, (_, p1) =>
            String.fromCharCode(parseInt(p1, 16))
          )
        );
        setOutput(encoded);
        recordSuccess("convert");
        setError("");
      } else {
        const decoded = decodeURIComponent(
          Array.from(atob(input), (c) =>
            "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
          ).join("")
        );
        setOutput(decoded);
        recordSuccess("convert");
        setError("");
      }
    } catch {
      setError(mode === "decode" ? "Invalid Base64 string." : "Encoding failed.");
      setOutput("");
    }
  }, [input, mode, markInteraction, recordSuccess]);

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="b64-input" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
          Input
        </label>
        <textarea
          id="b64-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === "encode" ? "Hello, World!" : "SGVsbG8sIFdvcmxkIQ=="}
          rows={5}
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
        <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: "var(--color-hairline)" }}>
          {(["encode", "decode"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className="px-4 py-2 text-sm font-medium transition-colors duration-150"
              style={{
                backgroundColor: mode === m ? "var(--color-primary)" : "var(--color-canvas)",
                color: mode === m ? "var(--color-on-primary)" : "var(--color-body)",
              }}
            >
              {m === "encode" ? "Encode" : "Decode"}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={process}
          className="btn-primary btn-sm"
          style={{ backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)" }}
        >
          Convert
        </button>
      </div>

      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>Result</span>
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
          <div
            className="p-4 rounded-lg text-sm break-all"
            style={{
              backgroundColor: "var(--color-canvas-soft-2)",
              color: "var(--color-ink)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {output}
          </div>
        </div>
      )}
    </div>
  );
}
