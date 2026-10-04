import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useCallback, useRef, useEffect } from "react";
import ErrorBanner from "../ErrorBanner";

/**
 * QrCodeGenerator — generate QR codes from text/URLs, download as PNG.
 * Uses the `qrcode` npm package for canvas-based generation.
 */
export default function QrCodeGenerator() {
  const { markInteraction, recordSuccess } = useToolTelemetry();
  const operationRevision = useRef(0);
  useEffect(() => () => { operationRevision.current++; }, []);
  const [input, setInput] = useState("");
  const [size, setSize] = useState(256);
  const [generated, setGenerated] = useState(false);
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const generate = useCallback(async () => {
    const revision = ++operationRevision.current;
    markInteraction();
    if (!input.trim() || !canvasRef.current) return;

    try {
      // Dynamic import to keep initial bundle small
      const QRCode = await import("qrcode");
      await QRCode.toCanvas(canvasRef.current, input, {
        width: size,
        margin: 2,
        color: {
          dark: "#171717",
          light: "#ffffff",
        },
      });
      if (revision !== operationRevision.current) return;
      setGenerated(true);
      recordSuccess("generate");
      setError("");
    } catch (err) {
      if (revision !== operationRevision.current) return;
      setError(err instanceof Error ? err.message : "Failed to generate QR code.");
    }
  }, [input, size]);

  const download = useCallback(() => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = "qrcode.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  }, []);

  // Re-generate when size changes and we have content
  useEffect(() => {
    if (generated && input.trim()) {
      generate();
    }
  }, [size]);

  return (
    <div onChangeCapture={() => { operationRevision.current++; markInteraction(); }} className="space-y-6">
      <div>
        <label htmlFor="qr-input" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
          Enter URL or text
        </label>
        <input
          id="qr-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="https://example.com"
          className="w-full h-12 px-4 border rounded-lg text-base outline-none transition-colors duration-150"
          style={{
            backgroundColor: "var(--color-canvas-soft)",
            borderColor: "var(--color-hairline)",
            color: "var(--color-ink)",
          }}
          autoComplete="off"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="qr-size" className="text-sm" style={{ color: "var(--color-body)" }}>
            Size
          </label>
          <select
            id="qr-size"
            value={size}
            onChange={(e) => setSize(parseInt(e.target.value))}
            className="h-9 px-3 border rounded-md text-sm outline-none"
            style={{
              backgroundColor: "var(--color-canvas)",
              borderColor: "var(--color-hairline)",
              color: "var(--color-ink)",
            }}
          >
            <option value={128}>128×128</option>
            <option value={256}>256×256</option>
            <option value={512}>512×512</option>
          </select>
        </div>

        <button
          type="button"
          onClick={generate}
          className="btn-primary btn-sm"
          style={{ backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)" }}
        >
          Generate QR Code
        </button>
      </div>

      <ErrorBanner message={error} />

      {/* Canvas output */}
      <div className="flex flex-col items-center gap-4">
        <canvas
          ref={canvasRef}
          className="rounded-lg max-w-full h-auto"
          style={{
            display: generated ? "block" : "none",
            border: "1px solid var(--color-hairline)",
          }}
        />
        {generated && (
          <button
            type="button"
            onClick={download}
            className="btn-secondary btn-sm"
            style={{ borderColor: "var(--color-hairline)", color: "var(--color-ink)", backgroundColor: "var(--color-canvas)" }}
          >
            Download PNG
          </button>
        )}
      </div>
    </div>
  );
}
