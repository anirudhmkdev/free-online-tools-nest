import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useCallback, useRef, useEffect } from "react";
import ErrorBanner from "../ErrorBanner";
import { fileSizeLimitMessage, formatBytes, MAX_PDF_FILE_SIZE_BYTES } from "../../helpers/utils";

type CompressionLevel = "low" | "medium" | "high";

const LEVEL_CONFIG: Record<CompressionLevel, { label: string; description: string }> = {
  low: { label: "Standard save", description: "Rewrite the PDF without object streams" },
  medium: { label: "Chunked save", description: "Same output mode, with smaller processing batches" },
  high: { label: "Object streams", description: "Use compressed PDF object streams; results vary" },
};

export default function PdfCompressor() {
  const { markInteraction, recordSuccess, clearInteraction } = useToolTelemetry();
  const operationRevision = useRef(0);
  useEffect(() => () => { operationRevision.current++; }, []);
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState<CompressionLevel>("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string>("");

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
      setError("Please upload a valid PDF file.");
      return;
    }
    const sizeError = fileSizeLimitMessage(f, MAX_PDF_FILE_SIZE_BYTES, "PDF");
    if (sizeError) {
      setError(sizeError);
      return;
    }
    setError("");
    setFile(f);
    setOriginalSize(null);
    setCompressedSize(null);
    setCompressedUrl("");
  }, []);

  const handleReset = useCallback(() => {
    operationRevision.current++;
    clearInteraction();
    setLoading(false);
    setFile(null);
    setOriginalSize(null);
    setCompressedSize(null);
    setCompressedUrl("");
    setError("");
    if (compressedUrl) URL.revokeObjectURL(compressedUrl);
  }, [compressedUrl]);

  const compressPdf = useCallback(async () => {
    const revision = ++operationRevision.current;
    markInteraction();
    if (!file) return;
    setLoading(true);
    setError("");
    setOriginalSize(null);
    setCompressedSize(null);
    if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    setCompressedUrl("");

    try {
      const arrayBuf = await file.arrayBuffer();
      if (revision !== operationRevision.current) return;
      setOriginalSize(arrayBuf.byteLength);

      const { PDFDocument } = await import("pdf-lib");
      const pdf = await PDFDocument.load(arrayBuf);
      if (revision !== operationRevision.current) return;

      /*
       * pdf-lib rewrites existing PDF data; it does not downsample images.
       * Save batching affects responsiveness, not image quality.
       */
      const useObjectStreams = level === "high";
      const objectsPerTick = level === "low" ? 100 : level === "medium" ? 50 : 20;

      const pdfBytes = await pdf.save({
        useObjectStreams,
        objectsPerTick,
        addDefaultPage: false,
      });

      if (revision !== operationRevision.current) return;
      setCompressedSize(pdfBytes.length);

      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setCompressedUrl(url);
      recordSuccess("export");
    } catch (err: unknown) {
      if (revision !== operationRevision.current) return;
      setError(err instanceof Error ? err.message : "Failed to compress PDF.");
    } finally {
      if (revision === operationRevision.current) setLoading(false);
    }
  }, [file, level, compressedUrl]);

  const handleDownload = useCallback(() => {
    if (!compressedUrl || !file) return;
    const baseName = file.name.replace(/\.pdf$/i, "");
    const link = document.createElement("a");
    link.href = compressedUrl;
    link.download = `${baseName}-compressed.pdf`;
    link.click();
  }, [compressedUrl, file]);

  const savings = (originalSize !== null && compressedSize !== null)
    ? Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100))
    : 0;

  return (
    <div onChangeCapture={() => { operationRevision.current++; setLoading(false); markInteraction(); }} className="space-y-6">
      {/* Upload */}
      {!file && (
        <div
          className="file-upload-zone border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center min-h-[220px]"
          style={{
            borderColor: "var(--color-hairline)",
            backgroundColor: "var(--color-canvas-soft)",
          }}
        >
          <span className="text-4xl mb-4">🗜️</span>
          <p className="text-sm font-medium mb-1" style={{ color: "var(--color-ink)" }}>
            Upload a PDF to compress
          </p>
          <p className="text-xs" style={{ color: "var(--color-mute)" }}>
            Rewrites PDF data locally; size reduction varies by file
          </p>
          <input
            id="pdf-compressor-input"
            aria-label="Choose a PDF file"
            type="file"
            accept=".pdf"
            className="file-upload-input"
            onChange={handleFileChange}
          />
        </div>
      )}

      {/* Controls */}
      {file && (
        <div
          className="border rounded-xl p-5 space-y-5"
          style={{ borderColor: "var(--color-hairline)", backgroundColor: "var(--color-canvas)" }}
        >
          {/* File info */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium truncate" style={{ color: "var(--color-ink)" }}>
              {file.name}
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="btn-secondary btn-sm"
            >
              Choose Different
            </button>
          </div>

          {/* Save mode */}
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>
              Save mode
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(Object.entries(LEVEL_CONFIG) as [CompressionLevel, typeof LEVEL_CONFIG['low']][]).map(([key, config]) => (
                <label
                  key={key}
                  className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    level === key ? "ring-1" : ""
                  }`}
                  style={{
                    borderColor: level === key ? "var(--color-primary)" : "var(--color-hairline)",
                    backgroundColor: "var(--color-canvas-soft)",
                  }}
                >
                  <input
                    type="radio"
                    name="compressionLevel"
                    value={key}
                    checked={level === key}
                    onChange={() => setLevel(key)}
                    className="accent-current"
                  />
                  <div>
                    <span className="text-sm font-medium block" style={{ color: "var(--color-ink)" }}>
                      {config.label}
                    </span>
                    <span className="text-xs" style={{ color: "var(--color-mute)" }}>
                      {config.description}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Compress / Download */}
          {compressedSize === null ? (
            <button
              type="button"
              onClick={compressPdf}
              disabled={loading}
              className="btn-primary btn-sm"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "var(--color-on-primary)",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Compressing...
                </>
              ) : (
                "Compress PDF"
              )}
            </button>
          ) : (
            <div className="space-y-4">
              {/* Size comparison */}
              <div
                className="grid grid-cols-3 gap-4 p-4 rounded-lg text-center"
                style={{ backgroundColor: "var(--color-canvas-soft-2)" }}
              >
                <div>
                  <span className="block text-[10px] uppercase tracking-wider font-medium" style={{ color: "var(--color-mute)" }}>
                    Original Size
                  </span>
                  <span className="text-base font-semibold" style={{ color: "var(--color-ink)" }}>
                    {originalSize !== null ? formatBytes(originalSize) : "—"}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider font-medium" style={{ color: "var(--color-mute)" }}>
                    Output Size
                  </span>
                  <span className="text-base font-semibold" style={{ color: "var(--color-ink)" }}>
                    {compressedSize !== null ? formatBytes(compressedSize) : "—"}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider font-medium" style={{ color: "var(--color-mute)" }}>
                    Size change
                  </span>
                  <span className="text-base font-semibold" style={{ color: "var(--color-success)" }}>
                    {compressedSize !== null && originalSize !== null && compressedSize > originalSize ? `${Math.round((compressedSize / originalSize - 1) * 100)}% larger` : savings > 0 ? `${savings}% smaller` : "Unchanged"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDownload}
                className="btn-primary btn-sm"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-on-primary)",
                }}
              >
                Download Saved PDF
              </button>

              <p className="text-xs leading-relaxed" style={{ color: "var(--color-mute)" }}>
                <strong>Note:</strong> This tool rewrites the PDF and can enable object streams. It does not
                downsample images or change image quality. The result may be smaller, unchanged, or larger;
                inspect the output before replacing the original. Image-heavy files may need a specialist
                workflow with explicit image downsampling.
              </p>
            </div>
          )}
        </div>
      )}

      <ErrorBanner message={error} />
    </div>
  );
}
