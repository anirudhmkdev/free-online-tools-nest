import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useCallback, useRef, useEffect } from "react";
import ErrorBanner from "../ErrorBanner";
import { fileSizeLimitMessage, formatBytes, MAX_PDF_FILE_SIZE_BYTES, MAX_PDF_IMAGE_PAGE_COUNT } from "../../helpers/utils";

let pdfjsLibPromise: Promise<typeof import("pdfjs-dist")> | null = null;

async function getPdfjs(): Promise<typeof import("pdfjs-dist")> {
  if (!pdfjsLibPromise) {
    pdfjsLibPromise = import("pdfjs-dist").then((mod) => {
      mod.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url,
      ).toString();
      return mod;
    });
  }
  return pdfjsLibPromise;
}

type ImageFormat = "image/png" | "image/jpeg";

interface PageImage {
  index: number;
  blob: Blob;
  url: string;
  size: number;
}

export default function PdfToImages() {
  const { markInteraction, recordSuccess, clearInteraction } = useToolTelemetry();
  const operationRevision = useRef(0);
  useEffect(() => () => { operationRevision.current++; }, []);
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<ImageFormat>("image/png");
  const [quality, setQuality] = useState(0.9);
  const [pageImages, setPageImages] = useState<PageImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState("");
  const objectUrlsRef = useRef<string[]>([]);

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
    // Revoke previous object URLs
    objectUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    objectUrlsRef.current = [];
    setError("");
    setFile(f);
    setPageImages([]);
    setProgress({ current: 0, total: 0 });
  }, []);

  const handleReset = useCallback(() => {
    operationRevision.current++;
    clearInteraction();
    objectUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    objectUrlsRef.current = [];
    setLoading(false);
    setFile(null);
    setPageImages([]);
    setError("");
    setProgress({ current: 0, total: 0 });
  }, []);

  const convertToImages = useCallback(async () => {
    const revision = ++operationRevision.current;
    markInteraction();
    if (!file) return;
    setLoading(true);
    setError("");
    setPageImages([]);

    try {
      const arrayBuf = await file.arrayBuffer();
      const data = new Uint8Array(arrayBuf);
      const pdfjsLib = await getPdfjs();
      const pdfDoc = await pdfjsLib.getDocument({ data }).promise;
      if (revision !== operationRevision.current) return;
      const totalPages = pdfDoc.numPages;
      if (totalPages > MAX_PDF_IMAGE_PAGE_COUNT) {
        setError(`This PDF has ${totalPages} pages. For browser stability, convert files with ${MAX_PDF_IMAGE_PAGE_COUNT} pages or fewer.`);
        return;
      }

      setProgress({ current: 0, total: totalPages });

      const scale = 1.5;
      const results: PageImage[] = [];

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Failed to get canvas context");

        const renderContext = {
          canvas,
          canvasContext: ctx,
          viewport,
        };

        await page.render(renderContext).promise;
        if (revision !== operationRevision.current) return;

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (b) => {
              if (b) resolve(b);
              else reject(new Error("Failed to convert canvas to blob"));
            },
            format,
            format === "image/png" ? undefined : quality,
          );
        });

        if (revision !== operationRevision.current) return;
        const url = URL.createObjectURL(blob);
        objectUrlsRef.current.push(url);

        results.push({ index: i, blob, url, size: blob.size });
        setProgress({ current: i, total: totalPages });
      }

      if (revision !== operationRevision.current) return;
      setPageImages(results);
      if (results.length > 0) recordSuccess("convert");
    } catch (err: unknown) {
      if (revision !== operationRevision.current) return;
      setError(err instanceof Error ? err.message : "Failed to convert PDF to images.");
    } finally {
      if (revision === operationRevision.current) setLoading(false);
    }
  }, [file, format, quality]);

  const downloadSingle = useCallback((img: PageImage) => {
    const ext = format === "image/png" ? "png" : "jpg";
    const baseName = file ? file.name.replace(/\.pdf$/i, "") : "page";
    const link = document.createElement("a");
    link.href = img.url;
    link.download = `${baseName}-page-${img.index}.${ext}`;
    link.click();
  }, [format, file]);

  const downloadAll = useCallback(() => {
    for (const img of pageImages) {
      // Trigger each download with a small delay to avoid browser blocking
      setTimeout(() => downloadSingle(img), img.index * 200);
    }
  }, [pageImages, downloadSingle]);

  const totalSize = pageImages.reduce((sum, img) => sum + img.size, 0);

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
          <span className="text-4xl mb-4">🖼️</span>
          <p className="text-sm font-medium mb-1" style={{ color: "var(--color-ink)" }}>
            Upload a PDF to convert pages to images
          </p>
          <p className="text-xs" style={{ color: "var(--color-mute)" }}>
            Each page is rendered at 1.5x resolution as PNG or JPEG
          </p>
          <input
            id="pdf-images-input"
            aria-label="Choose a PDF file"
            type="file"
            accept=".pdf"
            className="file-upload-input"
            onChange={handleFileChange}
          />
        </div>
      )}

      {/* Controls */}
      {file && pageImages.length === 0 && (
        <div
          className="border rounded-xl p-5 space-y-5"
          style={{ borderColor: "var(--color-hairline)", backgroundColor: "var(--color-canvas)" }}
        >
          {/* File info */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium block" style={{ color: "var(--color-ink)" }}>
                {file.name}
              </span>
              <span className="text-xs" style={{ color: "var(--color-mute)" }}>
                {formatBytes(file.size)}
              </span>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="btn-secondary btn-sm"
            >
              Choose Different
            </button>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Format */}
            <div className="space-y-1.5">
              <label htmlFor="img-format" className="block text-xs font-medium" style={{ color: "var(--color-ink)" }}>
                Image Format
              </label>
              <select
                id="img-format"
                value={format}
                onChange={(e) => setFormat(e.target.value as ImageFormat)}
                className="w-full h-10 px-3 rounded-lg border text-sm outline-none"
                style={{
                  backgroundColor: "var(--color-canvas-soft)",
                  borderColor: "var(--color-hairline)",
                  color: "var(--color-ink)",
                }}
              >
                <option value="image/png">PNG</option>
                <option value="image/jpeg">JPEG</option>
              </select>
            </div>

            {/* Quality (JPEG only) */}
            {format === "image/jpeg" && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-medium">
                  <label htmlFor="img-quality" style={{ color: "var(--color-ink)" }}>Quality</label>
                  <span style={{ color: "var(--color-primary)" }}>{Math.round(quality * 100)}%</span>
                </div>
                <input
                  id="img-quality"
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
                  style={{ backgroundColor: "var(--color-canvas-soft-2)" }}
                />
              </div>
            )}
          </div>

          {/* Convert button */}
          <button
            type="button"
            onClick={convertToImages}
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
                Converting... {progress.current}/{progress.total}
              </>
            ) : (
              "Convert to Images"
            )}
          </button>

          {/* Progress bar */}
          {loading && progress.total > 0 && (
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-canvas-soft-2)" }}>
              <div
                className="h-full rounded-full transition-all duration-200"
                style={{
                  width: `${(progress.current / progress.total) * 100}%`,
                  backgroundColor: "var(--color-primary)",
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {pageImages.length > 0 && (
        <div
          className="border rounded-xl p-5 space-y-4"
          style={{ borderColor: "var(--color-hairline)", backgroundColor: "var(--color-canvas)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <span className="text-sm font-semibold" style={{ color: "var(--color-ink)" }}>
                {pageImages.length} page{pageImages.length !== 1 ? "s" : ""} converted
              </span>
              <span className="text-xs ml-2" style={{ color: "var(--color-mute)" }}>
                Total: {formatBytes(totalSize)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={downloadAll}
                className="btn-primary btn-sm"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-on-primary)",
                }}
              >
                Download All
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="btn-secondary btn-sm"
              >
                Convert Another
              </button>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {pageImages.map((img) => (
              <div
                key={img.index}
                className="rounded-lg border overflow-hidden flex flex-col"
                style={{ borderColor: "var(--color-hairline)", backgroundColor: "var(--color-canvas-soft)" }}
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-black/5 flex items-center justify-center">
                  <img
                    src={img.url}
                    alt={`Page ${img.index}`}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div className="p-2 flex items-center justify-between">
                  <span className="text-xs font-medium" style={{ color: "var(--color-ink)" }}>
                    Page {img.index}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px]" style={{ color: "var(--color-mute)" }}>
                      {formatBytes(img.size)}
                    </span>
                    <button
                      type="button"
                      onClick={() => downloadSingle(img)}
                      className="text-xs font-medium px-1.5 py-0.5 rounded transition-colors"
                      style={{ color: "var(--color-primary)" }}
                      aria-label={`Download page ${img.index}`}
                    >
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ErrorBanner message={error} />
    </div>
  );
}
