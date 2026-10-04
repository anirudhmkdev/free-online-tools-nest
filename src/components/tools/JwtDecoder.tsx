import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useCallback } from "react";
import ErrorBanner from "../ErrorBanner";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padding = 4 - (base64.length % 4);
  if (padding !== 4) base64 += "=".repeat(padding);
  const decoded = atob(base64);
  return decodeURIComponent(
    Array.from(decoded, (c) =>
      "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
    ).join("")
  );
}

function formatJson(str: string): string {
  try {
    return JSON.stringify(JSON.parse(str), null, 2);
  } catch {
    return str;
  }
}

export default function JwtDecoder() {
  const { markInteraction, recordSuccess, clearInteraction } = useToolTelemetry();
  const [input, setInput] = useState("");
  const [header, setHeader] = useState("");
  const [payload, setPayload] = useState("");
  const [signature, setSignature] = useState("");
  const [error, setError] = useState("");
  const [copiedHeader, handleCopyHeader] = useCopyToClipboard();
  const [copiedPayload, handleCopyPayload] = useCopyToClipboard();

  const decode = useCallback(() => {
    markInteraction();
    if (!input.trim()) {
      setHeader("");
      setPayload("");
      setSignature("");
      setError("");
      return;
    }

    const parts = input.trim().split(".");
    if (parts.length !== 3) {
      setError("Invalid JWT format. Expected three dot-separated segments (header.payload.signature).");
      setHeader("");
      setPayload("");
      setSignature("");
      return;
    }

    try {
      const decodedHeader = base64UrlDecode(parts[0]);
      const decodedPayload = base64UrlDecode(parts[1]);
      // A JWT header and claims payload must contain valid JSON.
      const headerData = JSON.parse(decodedHeader);
      const payloadData = JSON.parse(decodedPayload);
      if ([headerData, payloadData].some(value => value === null || typeof value !== "object" || Array.isArray(value))) {
        throw new Error("JWT header and payload must contain JSON objects.");
      }
      setHeader(formatJson(decodedHeader));
      setPayload(formatJson(decodedPayload));
      setSignature(parts[2]);
      // Successful JWT decoding requires JSON; this never verifies the signature.
      recordSuccess("convert");
      setError("");
    } catch {
      setError("Failed to decode JWT. Ensure the token is properly formatted and not malformed.");
      setHeader("");
      setPayload("");
      setSignature("");
    }
  }, [input, markInteraction, recordSuccess]);

  const handleClear = () => {
    clearInteraction();
    setInput("");
    setHeader("");
    setPayload("");
    setSignature("");
    setError("");
  };

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="jwt-input" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
          Paste your JWT token
        </label>
        <textarea
          id="jwt-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
          rows={4}
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
          onClick={decode}
          className="btn-primary btn-sm"
          style={{ backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)" }}
        >
          Decode
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
      </div>

      {/* Header */}
      {header && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>Header</span>
            <button
              type="button"
              onClick={() => handleCopyHeader(header)}
              className="text-sm px-3 py-1 rounded-md transition-colors duration-150"
              style={{
                color: copiedHeader ? "var(--color-success)" : "var(--color-link)",
                backgroundColor: "var(--color-canvas-soft-2)",
              }}
            >
              {copiedHeader ? "Copied" : "Copy"}
            </button>
          </div>
          <pre
            className="p-4 rounded-lg text-sm overflow-x-auto max-h-48"
            style={{
              backgroundColor: "var(--color-canvas-soft-2)",
              color: "var(--color-ink)",
              fontFamily: "var(--font-mono)",
              lineHeight: "1.6",
            }}
          >
            {header}
          </pre>
        </div>
      )}

      {/* Payload */}
      {payload && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>Payload</span>
            <button
              type="button"
              onClick={() => handleCopyPayload(payload)}
              className="text-sm px-3 py-1 rounded-md transition-colors duration-150"
              style={{
                color: copiedPayload ? "var(--color-success)" : "var(--color-link)",
                backgroundColor: "var(--color-canvas-soft-2)",
              }}
            >
              {copiedPayload ? "Copied" : "Copy"}
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
            {payload}
          </pre>
        </div>
      )}

      {/* Signature */}
      {signature && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>Signature</span>
          </div>
          <div
            className="p-4 rounded-lg text-sm break-all"
            style={{
              backgroundColor: "var(--color-canvas-soft-2)",
              color: "var(--color-ink)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {signature}
          </div>
        </div>
      )}
    </div>
  );
}
