import { useState, useCallback } from "react";
import ErrorBanner from "../ErrorBanner";
import { fileSizeLimitMessage, formatBytes, MAX_PDF_FILE_SIZE_BYTES, MAX_PDF_PAGE_COUNT } from "../../helpers/utils";

type SplitMode = "all" | "range";

function parsePageRange(input: string, totalPages: number): number[][] {
  const ranges: number[][] = [];
  const parts = input.split(",").map((s) => s.trim());

  for (const part of parts) {
    if (/^\d+$/.test(part)) {
      const p = parseInt(part, 10);
      if (p >= 1 && p <= totalPages) {
        ranges.push([p]);
      }
    } else if (/^(\d+)-(\d+)$/.test(part)) {
      const [, startStr, endStr] = part.match(/^(\d+)-(\d+)$/)!;
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (start >= 1 && end <= totalPages && start <= end) {
        const pages: number[] = [];
        for (let i = start; i <= end; i++) pages.push(i);
        ranges.push(pages);
      }
    }
  }
  return ranges;
}

export default function PdfSplitter() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [splitMode, setSplitMode] = useState<SplitMode>("all");
  const [rangeInput, setRangeInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setLoading(true);
    setFile(f);
    setSplitMode("all");
    setRangeInput("");
    setPdfBytes(null);

    try {
      const arrayBuf = await f.arrayBuffer();
      const { PDFDocument } = await import("pdf-lib");
      const pdf = await PDFDocument.load(arrayBuf, { ignoreEncryption: true });
      const pages = pdf.getPageCount();
      if (pages > MAX_PDF_PAGE_COUNT) {
        setError(`This PDF has ${pages} pages. For browser stability, split files with ${MAX_PDF_PAGE_COUNT} pages or fewer.`);
        setFile(null);
        setPageCount(0);
        setPdfBytes(null);
        return;
      }
      setPdfBytes(arrayBuf);
      setPageCount(pages);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to read PDF.");
      setFile(null);
      setPageCount(0);
      setPdfBytes(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setFile(null);
    setPageCount(0);
    setSplitMode("all");
    setRangeInput("");
    setError("");
    setLoading(false);
    setPdfBytes(null);
  }, []);

  const splitPdf = useCallback(async () => {
    if (!pdfBytes) return;
    setLoading(true);
    setError("");

    try {
      const { PDFDocument } = await import("pdf-lib");
      const sourcePdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
      const totalPages = sourcePdf.getPageCount();

      let pageSets: number[][];
      if (splitMode === "all") {
        pageSets = [];
        for (let i = 0; i < totalPages; i++) {
          pageSets.push([i]);
        }
      } else {
        const parsed = parsePageRange(rangeInput, totalPages);
        if (parsed.length === 0) {
          setError("Invalid page range. Use formats like: 1-3,5,7-9");
          setLoading(false);
          return;
        }
        pageSets = parsed.map((pages) => pages.map((p) => p - 1)); // zero-indexed
      }

      for (let idx = 0; idx < pageSets.length; idx++) {
        const indices = pageSets[idx];
        const newPdf = await PDFDocument.create();
        const copiedPages = await newPdf.copyPages(sourcePdf, indices);
        for (const page of copiedPages) {
          newPdf.addPage(page);
        }
        const bytes = await newPdf.save();
        const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        const pageLabel = indices.length === 1
          ? `page-${indices[0] + 1}`
          : `pages-${indices[0] + 1}-to-${indices[indices.length - 1] + 1}`;
        const baseName = file ? file.name.replace(/\.pdf$/i, "") : "split";
        link.download = `${baseName}-${pageLabel}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to split PDF.");
    } finally {
      setLoading(false);
    }
  }, [pdfBytes, splitMode, rangeInput, file]);

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
          <span className="text-4xl mb-4">✂️</span>
          <p className="text-sm font-medium mb-1" style={{ color: "var(--color-ink)" }}>
            Upload a PDF to split into individual pages
          </p>
          <p className="text-xs" style={{ color: "var(--color-mute)" }}>
            All processing is done locally in your browser
          </p>
          {loading && (
            <p className="text-xs mt-2" style={{ color: "var(--color-body)" }}>
              Reading PDF...
            </p>
          )}
          <input
            id="pdf-splitter-input"
            aria-label="Choose a PDF file"
            type="file"
            accept=".pdf"
            className="file-upload-input"
            onChange={handleFileChange}
          />
        </div>
      )}

      {/* Controls */}
      {file && pageCount > 0 && (
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
                {formatBytes(file.size)} &middot; {pageCount} page{pageCount !== 1 ? "s" : ""}
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

          {/* Split mode */}
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>
              Split Options
            </legend>

            <label className="flex items-center gap-3 text-sm cursor-pointer" style={{ color: "var(--color-ink)" }}>
              <input
                type="radio"
                name="splitMode"
                checked={splitMode === "all"}
                onChange={() => setSplitMode("all")}
                className="accent-current"
              />
              <span>Extract all pages (each page as a separate PDF)</span>
            </label>

            <label className="flex items-center gap-3 text-sm cursor-pointer" style={{ color: "var(--color-ink)" }}>
              <input
                type="radio"
                name="splitMode"
                checked={splitMode === "range"}
                onChange={() => setSplitMode("range")}
                className="accent-current"
              />
              <span>Page range</span>
            </label>

            {splitMode === "range" && (
              <div>
                <input
                  type="text"
                  value={rangeInput}
                  onChange={(e) => setRangeInput(e.target.value)}
                  placeholder={`e.g., 1-3,5,7-${pageCount} (max ${pageCount})`}
                  className="w-full h-12 px-4 border rounded-lg text-base outline-none transition-colors duration-150"
                  style={{
                    backgroundColor: "var(--color-canvas-soft)",
                    borderColor: "var(--color-hairline)",
                    color: "var(--color-ink)",
                  }}
                />
                <p className="text-xs mt-1" style={{ color: "var(--color-mute)" }}>
                  Specify pages or ranges separated by commas
                </p>
              </div>
            )}
          </fieldset>

          {/* Split button */}
          <button
            type="button"
            onClick={splitPdf}
            disabled={loading || (splitMode === "range" && !rangeInput.trim())}
            className="btn-primary btn-sm"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-on-primary)",
              opacity: loading || (splitMode === "range" && !rangeInput.trim()) ? 0.6 : 1,
            }}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Splitting...
              </>
            ) : (
              "Split PDF"
            )}
          </button>
        </div>
      )}

      <ErrorBanner message={error} />
    </div>
  );
}
