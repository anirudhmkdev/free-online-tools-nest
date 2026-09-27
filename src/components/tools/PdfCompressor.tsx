import { useState, useCallback, useEffect } from "react";
import ErrorBanner from "../ErrorBanner";
import { fileSizeLimitMessage, formatBytes, MAX_PDF_FILE_SIZE_BYTES } from "../../helpers/utils";

type CompressionLevel = "plain" | "compact";

const LEVEL_CONFIG: Record<CompressionLevel, { label: string; description: string }> = {
  plain: { label: "Plain rewrite", description: "Save without PDF object streams" },
  compact: { label: "Object streams", description: "Save with compact object streams; size may increase" },
};

export default function PdfCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState<CompressionLevel>("compact");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string>("");
  useEffect(() => () => { if (compressedUrl) URL.revokeObjectURL(compressedUrl); }, [compressedUrl]);

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
    setFile(null);
    setOriginalSize(null);
    setCompressedSize(null);
    setCompressedUrl("");
    setError("");
    if (compressedUrl) URL.revokeObjectURL(compressedUrl);
  }, [compressedUrl]);

  const compressPdf = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setOriginalSize(null);
    setCompressedSize(null);
    if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    setCompressedUrl("");

    try {
      const arrayBuf = await file.arrayBuffer();
      setOriginalSize(arrayBuf.byteLength);

      const { rewritePdf } = await import("../../helpers/pdf-rewrite");
      const pdfBytes = await rewritePdf(arrayBuf, level === "compact");

      setCompressedSize(pdfBytes.length);

      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setCompressedUrl(url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to compress PDF.");
    } finally {
      setLoading(false);
    }
  }, [file, level, compressedUrl]);

  const handleDownload = useCallback(() => {
    if (!compressedUrl || !file) return;
    const baseName = file.name.replace(/\.pdf$/i, "");
    const link = document.createElement("a");
    link.href = compressedUrl;
    link.download = `${baseName}-rewritten.pdf`;
    link.click();
  }, [compressedUrl, file]);

  const savings = (originalSize !== null && compressedSize !== null)
    ? Math.round(((originalSize - compressedSize) / originalSize) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <p className="text-sm">A local PDF rewrite, not image downsampling. Savings are not guaranteed. Password-protected PDFs are rejected. Keep your original and inspect all pages before using the output.</p>
      {/* Upload */}
      {!file && (
        <div
          className="border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center min-h-[220px]"
          style={{
            borderColor: "var(--color-hairline)",
            backgroundColor: "var(--color-canvas-soft)",
          }}
          onClick={() => document.getElementById("pdf-compressor-input")?.click()}
        >
          <span className="text-4xl mb-4">🗜️</span>
          <p className="text-sm font-medium mb-1" style={{ color: "var(--color-ink)" }}>
            Upload a PDF to compress
          </p>
          <p className="text-xs" style={{ color: "var(--color-mute)" }}>
            Rewrites a PDF locally; it may become smaller or larger
          </p>
          <input
            id="pdf-compressor-input"
            type="file"
            accept=".pdf"
            className="hidden"
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
              disabled={loading}
              className="btn-secondary btn-sm"
            >
              Choose Different
            </button>
          </div>

          {/* PDF save mode */}
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>
              Compression Level
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.entries(LEVEL_CONFIG) as [CompressionLevel, typeof LEVEL_CONFIG['plain']][]).map(([key, config]) => (
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
                    disabled={loading}
                    onChange={() => { setLevel(key); if (compressedUrl) URL.revokeObjectURL(compressedUrl); setCompressedUrl(""); setCompressedSize(null); }}
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
                    Savings
                  </span>
                  <span className="text-base font-semibold" style={{ color: "var(--color-success)" }}>
                    {savings < 0 ? `${Math.abs(savings)}% larger` : savings > 0 ? `${savings}% smaller` : "No reduction"}
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
                Download Rewritten PDF
              </button>

              <p className="text-xs leading-relaxed" style={{ color: "var(--color-mute)" }}>
                <strong>Note:</strong> This rewrites the document and optionally uses PDF object streams. It does not downsample images, promise a target size, or guarantee preservation of advanced forms, signatures or accessibility tags. Keep the original and inspect the output. Use a trusted desktop PDF tool when you need image resampling.
              </p>
            </div>
          )}
        </div>
      )}

      <ErrorBanner message={error} />
    </div>
  );
}
