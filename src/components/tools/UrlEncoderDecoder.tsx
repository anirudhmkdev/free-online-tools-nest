import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useCallback } from "react";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";
import ErrorBanner from "../ErrorBanner";

/**
 * UrlEncoderDecoder — encode/decode URLs and query strings.
 */
export default function UrlEncoderDecoder() {
  const { markInteraction, recordSuccess } = useToolTelemetry();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
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
        setOutput(encodeURIComponent(input));
      } else {
        setOutput(decodeURIComponent(input));
      }
      setError("");
      recordSuccess("convert");
    } catch {
      setOutput("");
      setError("Invalid input for decoding.");
    }
  }, [input, mode]);

  return (
    <div onChangeCapture={markInteraction} className="space-y-6">
      <div>
        <label htmlFor="url-input" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
          Input
        </label>
        <textarea
          id="url-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === "encode" ? "https://example.com/path?q=hello world" : "https%3A%2F%2Fexample.com"}
          rows={4}
          className="w-full p-4 border rounded-lg text-sm resize-y outline-none transition-colors duration-150"
          style={{
            backgroundColor: "var(--color-canvas-soft)",
            borderColor: "var(--color-hairline)",
            color: "var(--color-ink)",
            fontFamily: "var(--font-mono)",
          }}
          spellCheck={false}
        />
      </div>

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
        >
          Convert
        </button>
      </div>

      <ErrorBanner message={error} />

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
