import { useState, useCallback } from "react";
import ErrorBanner from "../ErrorBanner";
import { fileSizeLimitMessage, formatBytes, MAX_PDF_FILE_SIZE_BYTES, MAX_PDF_PAGE_COUNT } from "../../helpers/utils";

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

export default function PdfToText() {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

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
    setExtractedText("");
    setCopied(false);
  }, []);

  const handleReset = useCallback(() => {
    setFile(null);
    setExtractedText("");
    setError("");
    setCopied(false);
  }, []);

  const extractText = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setExtractedText("");

    try {
      const arrayBuf = await file.arrayBuffer();
      const data = new Uint8Array(arrayBuf);

      const pdfjsLib = await getPdfjs();
      const pdfDoc = await pdfjsLib.getDocument({ data }).promise;
      const totalPages = pdfDoc.numPages;
      if (totalPages > MAX_PDF_PAGE_COUNT) {
        setError(`This PDF has ${totalPages} pages. For browser stability, extract text from files with ${MAX_PDF_PAGE_COUNT} pages or fewer.`);
        return;
      }
      const pagesText: string[] = [];

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdfDoc.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item) => ("str" in item ? item.str : ""))
          .join(" ");
        pagesText.push(pageText);
      }

      setExtractedText(pagesText.join("\n\n--- Page Break ---\n\n"));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to extract text from PDF.");
    } finally {
      setLoading(false);
    }
  }, [file]);

  const copyToClipboard = useCallback(async () => {
    if (!extractedText) return;
    try {
      await navigator.clipboard.writeText(extractedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Failed to copy to clipboard.");
    }
  }, [extractedText]);

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
          <span className="text-4xl mb-4">📝</span>
          <p className="text-sm font-medium mb-1" style={{ color: "var(--color-ink)" }}>
            Upload a PDF to extract its text content
          </p>
          <p className="text-xs" style={{ color: "var(--color-mute)" }}>
            Text extraction runs entirely in your browser
          </p>
          <input
            id="pdf-text-input"
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
          className="border rounded-xl p-5 space-y-4"
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

          {/* Extract button */}
          {!extractedText && (
            <button
              type="button"
              onClick={extractText}
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
                  Extracting...
                </>
              ) : (
                "Extract Text"
              )}
            </button>
          )}

          {/* Extracted text */}
          {extractedText && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>
                  Extracted Text
                </span>
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="btn-secondary btn-sm"
                  style={copied ? { borderColor: "var(--color-success)", color: "var(--color-success)" } : undefined}
                >
                  {copied ? "Copied!" : "Copy to Clipboard"}
                </button>
              </div>
              <textarea
                readOnly
                value={extractedText}
                className="w-full h-80 p-4 border rounded-lg text-sm leading-relaxed outline-none resize-y"
                style={{
                  backgroundColor: "var(--color-canvas-soft-2)",
                  borderColor: "var(--color-hairline)",
                  color: "var(--color-ink)",
                  fontFamily: "var(--font-mono)",
                }}
              />
              <p className="text-xs" style={{ color: "var(--color-mute)" }}>
                {extractedText.split("\n").length} lines &middot; {extractedText.length} characters
              </p>
            </div>
          )}
        </div>
      )}

      <ErrorBanner message={error} />
    </div>
  );
}
