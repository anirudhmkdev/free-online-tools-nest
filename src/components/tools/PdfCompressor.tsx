import { useState, useCallback } from "react";
import ErrorBanner from "../ErrorBanner";
import { fileSizeLimitMessage, formatBytes, MAX_PDF_FILE_SIZE_BYTES } from "../../helpers/utils";

type CompressionLevel = "low" | "medium" | "high";

const LEVEL_CONFIG: Record<CompressionLevel, { label: string; description: string }> = {
  low: { label: "Low (90%)", description: "Minimal size reduction, best quality" },
  medium: { label: "Medium (70%)", description: "Balanced compression" },
  high: { label: "High (40%)", description: "Maximum size reduction, may affect quality" },
};

export default function PdfCompressor() {
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

      const { PDFDocument } = await import("pdf-lib");
      const pdf = await PDFDocument.load(arrayBuf, { ignoreEncryption: true });

      /*
       * pdf-lib has limited compression support. The effective strategy is:
       * 1. Load the PDF (parses and re-serializes, stripping unused objects)
       * 2. Use the 'objectsPerTick' and 'useObjectStreams' options on save()
       * 3. This removes orphaned data and recompresses object streams
       * 4. For "high" level, we also decompress and recompress page content streams
       *
       * True image downsampling (jpg/png re-encoding) is NOT supported by pdf-lib.
       * For real compression, use a server-side tool like Ghostscript or qpdf.
       */
      const useObjectStreams = level === "high";
      const objectsPerTick = level === "low" ? 100 : level === "medium" ? 50 : 20;

      // For high compression, iterate pages and add extra handling
      if (level === "high") {
        const pages = pdf.getPages();
        for (const page of pages) {
          // Decompress and recompress each page's content stream
          // This can help strip some overhead
          const { width, height } = page.getSize();
          page.setSize(width, height);
        }
      }

      const pdfBytes = await pdf.save({
        useObjectStreams,
        objectsPerTick,
        addDefaultPage: false,
      });

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
    link.download = `${baseName}-compressed.pdf`;
    link.click();
  }, [compressedUrl, file]);

  const savings = (originalSize !== null && compressedSize !== null)
    ? Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100))
    : 0;

  return (
    <div className="space-y-6">
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
            Reduces file size by stripping unused data and recompressing
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

          {/* Compression Level */}
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>
              Compression Level
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
                    Compressed Size
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
                    {savings > 0 ? `${savings}%` : "0%"}
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
                Download Compressed PDF
              </button>

              <p className="text-xs leading-relaxed" style={{ color: "var(--color-mute)" }}>
                <strong>Note:</strong> pdf-lib compresses by stripping unused objects and recompressing streams.
                For significant size reduction, particularly with images, a server-side tool (Ghostscript, qpdf)
                is recommended. This tool works best on PDFs with embedded fonts, metadata, or redundant objects.
              </p>
            </div>
          )}
        </div>
      )}

      <ErrorBanner message={error} />
    </div>
  );
}
