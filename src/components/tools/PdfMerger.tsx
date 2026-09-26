import { useState, useCallback } from "react";
import ErrorBanner from "../ErrorBanner";
import { fileSizeLimitMessage, formatBytes, MAX_PDF_FILE_SIZE_BYTES } from "../../helpers/utils";

interface PdfFileItem {
  id: string;
  file: File;
  size: number;
}

export default function PdfMerger() {
  const [files, setFiles] = useState<PdfFileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mergedSize, setMergedSize] = useState<number | null>(null);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    setError("");
    const pdfFiles = Array.from(newFiles).filter((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    if (pdfFiles.length === 0) {
      setError("Please upload valid PDF files.");
      return;
    }

    const oversized = pdfFiles.map((f) => fileSizeLimitMessage(f, MAX_PDF_FILE_SIZE_BYTES, "PDF")).find(Boolean);
    if (oversized) {
      setError(oversized);
      return;
    }

    const items: PdfFileItem[] = pdfFiles.map((f) => ({
      id: crypto.randomUUID(),
      file: f,
      size: f.size,
    }));

    setFiles((prev) => {
      const projectedTotal = [...prev, ...items].reduce((sum, item) => sum + item.size, 0);
      if (projectedTotal > MAX_PDF_FILE_SIZE_BYTES) {
        setError(`Combined PDFs are ${formatBytes(projectedTotal)}; keep the batch under ${formatBytes(MAX_PDF_FILE_SIZE_BYTES)} for safe in-browser merging.`);
        return prev;
      }
      setMergedSize(null);
      return [...prev, ...items];
    });
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setMergedSize(null);
  }, []);

  const moveFile = useCallback((index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= files.length) return;
    setFiles((prev) => {
      const copy = [...prev];
      const tmp = copy[index];
      copy[index] = copy[target];
      copy[target] = tmp;
      return copy;
    });
    setMergedSize(null);
  }, [files.length]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
    }
    e.target.value = "";
  }, [addFiles]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }, [addFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const mergePdfs = useCallback(async () => {
    if (files.length < 2) {
      setError("Please upload at least 2 PDF files to merge.");
      return;
    }
    setLoading(true);
    setError("");
    setMergedSize(null);

    try {
      const { PDFDocument } = await import("pdf-lib");
      const mergedPdf = await PDFDocument.create();

      for (const item of files) {
        const arrayBuf = await item.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuf, { ignoreEncryption: true });
        const pageIndices = pdf.getPageIndices();
        const copiedPages = await mergedPdf.copyPages(pdf, pageIndices);
        for (const page of copiedPages) {
          mergedPdf.addPage(page);
        }
      }

      const pdfBytes = await mergedPdf.save();
      setMergedSize(pdfBytes.length);

      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "merged.pdf";
      link.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to merge PDFs.");
    } finally {
      setLoading(false);
    }
  }, [files]);

  const totalOriginalSize = files.reduce((sum, f) => sum + f.size, 0);

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      {files.length === 0 && (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="file-upload-zone border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center min-h-[220px]"
          style={{
            borderColor: "var(--color-hairline)",
            backgroundColor: "var(--color-canvas-soft)",
          }}
        >
          <span className="text-4xl mb-4">📄</span>
          <p className="text-sm font-medium mb-1" style={{ color: "var(--color-ink)" }}>
            Drag & drop PDF files here, or click to browse
          </p>
          <p className="text-xs" style={{ color: "var(--color-mute)" }}>
            Select multiple PDF files to merge them into one document
          </p>
          <input
            id="pdf-merger-input"
            aria-label="Choose PDF files"
            type="file"
            accept=".pdf"
            multiple
            className="file-upload-input"
            onChange={handleFileInput}
          />
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div
          className="border rounded-xl p-5 space-y-3"
          style={{ borderColor: "var(--color-hairline)", backgroundColor: "var(--color-canvas)" }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--color-mute)" }}>
              PDF Files ({files.length})
            </span>
            <span className="text-xs" style={{ color: "var(--color-body)" }}>
              Total: {formatBytes(totalOriginalSize)}
            </span>
          </div>

          {files.map((item, index) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center gap-3 px-4 py-3 rounded-lg text-sm"
              style={{ backgroundColor: "var(--color-canvas-soft-2)" }}
            >
              <div className="w-full min-w-0">
                <p className="break-all font-medium" style={{ color: "var(--color-ink)" }}>
                  {item.file.name}
                </p>
                <p className="mt-1 text-xs" style={{ color: "var(--color-mute)" }}>
                  {formatBytes(item.size)}
                </p>
              </div>
              {/* Reorder buttons stay together below the filename on touch screens. */}
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={loading || index === 0}
                  onClick={() => moveFile(index, -1)}
                  className="flex h-11 w-11 items-center justify-center rounded border border-hairline enabled:hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-30 transition-colors"
                  style={{ color: "var(--color-mute)" }}
                  aria-label="Move up"
                >
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor"><path d="M5 0L10 6H0z"/></svg>
                </button>
                <button
                  type="button"
                  disabled={loading || index === files.length - 1}
                  onClick={() => moveFile(index, 1)}
                  className="flex h-11 w-11 items-center justify-center rounded border border-hairline enabled:hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-30 transition-colors"
                  style={{ color: "var(--color-mute)" }}
                  aria-label="Move down"
                >
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor"><path d="M5 6L0 0h10z"/></svg>
                </button>
              </div>

              {/* Remove */}
              <button
                type="button"
                disabled={loading}
                onClick={() => removeFile(item.id)}
                className="min-h-11 min-w-11 text-sm font-medium px-2 py-2 rounded text-link underline disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={`Remove ${item.file.name}`}
              >
                Remove
              </button>
            </div>
          ))}

          {/* Add more + Merge buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <input id="pdf-merger-input" type="file" accept=".pdf" multiple hidden disabled={loading} onChange={handleFileInput} />
            <button
              type="button"
              disabled={loading}
              onClick={() => document.getElementById("pdf-merger-input")?.click()}
              className="btn-secondary disabled:cursor-not-allowed disabled:opacity-40"
            >
              + Add More
            </button>
            <button
              type="button"
              onClick={mergePdfs}
              disabled={loading || files.length < 2}
              className="btn-primary disabled:cursor-not-allowed"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "var(--color-on-primary)",
                opacity: loading || files.length < 2 ? 0.6 : 1,
              }}
            >
              {loading ? (
                <>
                  <svg className="motion-safe:animate-spin h-4 w-4" aria-hidden="true" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Merging...
                </>
              ) : (
                "Merge PDFs"
              )}
            </button>
            {mergedSize !== null && (
              <span role="status" className="text-sm text-body">
                Merged PDF: {formatBytes(mergedSize)} — Download started
              </span>
            )}
          </div>
        </div>
      )}

      <ErrorBanner message={error} />
    </div>
  );
}
