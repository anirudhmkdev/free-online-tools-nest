import { useEffect, useRef, useState } from "react";
import {
  buildImagePdf,
  inspectImage,
  normalizeImage,
  validateImageBatch,
  pageDimensions,
  fitImage,
  type PdfSettings,
} from "../../helpers/image-to-pdf";
import { numberInput } from "../../helpers/student-calculators";
import {
  NumberField,
  inputClass,
  focusToolElement,
} from "./shared/CalculationResult";

interface Entry {
  id: string;
  file: File;
  preview: string;
  pixels: number;
}
export default function ImageToPdf() {
  const [files, setFiles] = useState<Entry[]>([]);
  const [format, setFormat] = useState<PdfSettings["format"]>("a4");
  const [orientation, setOrientation] =
    useState<PdfSettings["orientation"]>("auto");
  const [margin, setMargin] = useState("10");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{
    url: string;
    pages: number;
    bytes: number;
  } | null>(null);
  const previews = useRef(new Set<string>());
  const download = useRef<string | null>(null);
  const controller = useRef<AbortController | null>(null);
  const pendingFocus = useRef<string | null>(null);
  const errorPanel = useRef<HTMLDivElement>(null);
  const downloadLink = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (!busy && pendingFocus.current) {
      focusToolElement(document.getElementById(pendingFocus.current));
      pendingFocus.current = null;
    }
  }, [files, busy]);
  useEffect(() => {
    if (error) focusToolElement(errorPanel.current);
  }, [error, attempt]);
  useEffect(() => {
    if (result) focusToolElement(downloadLink.current);
  }, [result]);
  useEffect(
    () => () => {
      controller.current?.abort();
      previews.current.forEach((url) => URL.revokeObjectURL(url));
      if (download.current) URL.revokeObjectURL(download.current);
    },
    [],
  );
  function resetResult() {
    if (download.current) URL.revokeObjectURL(download.current);
    download.current = null;
    setResult(null);
    setError("");
    setStatus("");
  }
  function release(entry: Entry) {
    URL.revokeObjectURL(entry.preview);
    previews.current.delete(entry.preview);
  }
  async function addFiles(selected: File[]) {
    if (!selected.length || controller.current) return;
    setAttempt((value) => value + 1);
    resetResult();
    setBusy(true);
    const abort = new AbortController();
    controller.current = abort;
    const added: Entry[] = [];
    try {
      validateImageBatch([
        ...files.map((row) => ({ size: row.file.size, pixels: row.pixels })),
        ...selected,
      ]);
      for (const file of selected) {
        abort.signal.throwIfAborted();
        setStatus(`Checking image ${added.length + 1} of ${selected.length}…`);
        const info = inspectImage(new Uint8Array(await file.arrayBuffer()));
        const pixels = info.width * info.height;
        validateImageBatch(
          [...files, ...added]
            .map((row) => ({ size: row.file.size, pixels: row.pixels }))
            .concat({ size: file.size, pixels }),
        );
        const thumbnail = await normalizeImage(file, true);
        abort.signal.throwIfAborted();
        const preview = URL.createObjectURL(
          new Blob([new Uint8Array(thumbnail.bytes)], { type: "image/png" }),
        );
        previews.current.add(preview);
        added.push({ id: crypto.randomUUID(), file, preview, pixels });
      }
      setFiles([...files, ...added]);
      setStatus(
        `${files.length + added.length} images ready. Arrange them in PDF page order.`,
      );
    } catch (err) {
      added.forEach(release);
      if (!abort.signal.aborted) {
        setStatus("");
        setError((err as Error).message);
      } else setStatus("Image selection cancelled.");
    } finally {
      setBusy(false);
      controller.current = null;
    }
  }
  async function generate() {
    if (controller.current) return;
    setAttempt((value) => value + 1);
    resetResult();
    setBusy(true);
    const abort = new AbortController();
    controller.current = abort;
    try {
      validateImageBatch(
        files.map((row) => ({ size: row.file.size, pixels: row.pixels })),
      );
      const settings = {
        format,
        orientation,
        marginMm: numberInput(margin, "Margin"),
      };
      fitImage(
        ...pageDimensions(settings, 1, 1),
        (settings.marginMm * 72) / 25.4,
        1,
        1,
      );
      setStatus("Preparing your PDF locally…");
      const bytes = await buildImagePdf(
        files.length,
        (i) => normalizeImage(files[i].file),
        settings,
        (done) => setStatus(`Added page ${done} of ${files.length}…`),
        abort.signal,
      );
      abort.signal.throwIfAborted();
      const url = URL.createObjectURL(
        new Blob([new Uint8Array(bytes)], { type: "application/pdf" }),
      );
      download.current = url;
      setResult({ url, pages: files.length, bytes: bytes.length });
      setStatus("PDF ready. Download it below.");
    } catch (err) {
      if (!abort.signal.aborted) {
        setStatus("");
        setError((err as Error).message);
      } else setStatus("PDF generation cancelled.");
    } finally {
      setBusy(false);
      controller.current = null;
    }
  }
  function move(index: number, offset: number) {
    const next = [...files];
    [next[index], next[index + offset]] = [next[index + offset], next[index]];
    pendingFocus.current = `image-page-${files[index].id}`;
    setFiles(next);
    resetResult();
    setStatus(`Moved page ${index + 1} to position ${index + offset + 1}.`);
  }
  return (
    <div className="space-y-5">
      <p className="max-w-[75ch] text-sm leading-relaxed text-body">
        Your files stay in this browser tab. Images are decoded and converted
        locally; this tool does not upload them or save them in browser storage.
        Ordinary site analytics may still load, but image contents and filenames
        are not sent by this tool.
      </p>
      <div className="rounded-lg border border-hairline bg-canvas-soft-2 p-4">
        <h2 className="mb-4 text-lg font-semibold text-ink">
          1. Select your images
        </h2>
        <label htmlFor="image-pdf-files" className="mb-3 block font-medium">
          Add JPEG or PNG images
        </label>
        <input
          id="image-pdf-files"
          type="file"
          accept="image/jpeg,image/png,.jpg,.jpeg,.png"
          multiple
          disabled={busy}
          aria-describedby="image-pdf-limits"
          className="block min-h-11 w-full min-w-0 text-sm text-ink file:mr-3 file:min-h-11 file:cursor-pointer file:rounded-lg file:border file:border-hairline file:bg-canvas file:px-4 file:text-sm file:font-medium file:text-ink disabled:cursor-not-allowed disabled:opacity-50"
          onChange={(e) => {
            const chosen = Array.from(e.target.files ?? []);
            e.target.value = "";
            void addFiles(chosen);
          }}
        />
        <p
          id="image-pdf-limits"
          className="mt-3 max-w-[75ch] text-sm leading-relaxed text-body"
        >
          Application guardrails for reliability: 20 files, 15 MiB per file, 50
          MiB total, 16 megapixels per image, 64 megapixels total and 16,384
          pixels per side. These are choices for this tool, not universal
          browser or device limits. Smaller batches may still be needed on
          limited devices.
        </p>
      </div>
      <section aria-labelledby="image-pdf-order">
        <h2 id="image-pdf-order" className="text-lg font-semibold text-ink">
          2. Arrange the pages
        </h2>
        <p className="mt-2 mb-4 text-sm leading-relaxed text-body">
          {files.length
            ? `${files.length} image${files.length === 1 ? "" : "s"} selected. The first image becomes page 1. Use the controls to change the order.`
            : "Select images above to preview them here, then arrange them in reading order."}
        </p>
        <ol
          className="divide-y divide-hairline"
          aria-label="Images in PDF page order"
        >
          {files.map((row, i) => (
            <li
              key={row.id}
              id={`image-page-${row.id}`}
              tabIndex={-1}
              aria-label={`Page ${i + 1}: ${row.file.name}`}
              className="flex min-w-0 flex-wrap items-center gap-4 py-4"
            >
              <img
                src={row.preview}
                alt={`Preview for page ${i + 1}`}
                width="80"
                height="100"
                className="h-24 w-20 shrink-0 rounded bg-canvas-soft-2 object-contain"
              />
              <div className="min-w-0 flex-1">
                <p className="mb-1 font-semibold text-ink">Page {i + 1}</p>
                <p className="break-all text-sm text-body">{row.file.name}</p>
                <p className="text-xs text-body">
                  {(row.file.size / 1024 ** 2).toFixed(2)} MiB ·{" "}
                  {(row.pixels / 1e6).toFixed(2)} MP
                </p>
              </div>
              <div className="flex w-full flex-wrap gap-2 text-sm sm:w-auto">
                <button
                  type="button"
                  disabled={busy || i === 0}
                  className="inline-flex min-h-11 items-center justify-center rounded-lg border border-hairline px-3 font-medium text-ink hover:bg-canvas-soft-2 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={`Move image ${i + 1} up`}
                  onClick={() => move(i, -1)}
                >
                  Move up
                </button>
                <button
                  type="button"
                  disabled={busy || i === files.length - 1}
                  className="inline-flex min-h-11 items-center justify-center rounded-lg border border-hairline px-3 font-medium text-ink hover:bg-canvas-soft-2 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={`Move image ${i + 1} down`}
                  onClick={() => move(i, 1)}
                >
                  Move down
                </button>
                <button
                  type="button"
                  disabled={busy}
                  className="inline-flex min-h-11 items-center justify-center rounded-lg px-3 text-link underline disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={`Remove image ${i + 1}`}
                  onClick={() => {
                    release(row);
                    const next = files.filter((item) => item.id !== row.id);
                    const neighbor = next[Math.min(i, next.length - 1)];
                    pendingFocus.current = neighbor
                      ? `image-page-${neighbor.id}`
                      : "image-pdf-files";
                    setFiles(next);
                    resetResult();
                    setStatus(
                      `Removed page ${i + 1}. ${next.length} image${next.length === 1 ? "" : "s"} remaining.`,
                    );
                  }}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <fieldset disabled={busy} className="grid gap-5 sm:grid-cols-3">
        <legend className="mb-3 text-lg font-semibold">
          3. Set up your PDF
        </legend>
        <div>
          <label htmlFor="image-pdf-size" className="mb-2 block text-sm">
            Page size
          </label>
          <select
            id="image-pdf-size"
            value={format}
            className={inputClass}
            onChange={(e) => {
              setFormat(e.target.value as PdfSettings["format"]);
              resetResult();
            }}
          >
            <option value="a4">A4</option>
            <option value="letter">US Letter</option>
          </select>
        </div>
        <div>
          <label htmlFor="image-pdf-orientation" className="mb-2 block text-sm">
            Orientation
          </label>
          <select
            id="image-pdf-orientation"
            value={orientation}
            className={inputClass}
            onChange={(e) => {
              setOrientation(e.target.value as PdfSettings["orientation"]);
              resetResult();
            }}
          >
            <option value="auto">Auto per image</option>
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
          </select>
        </div>
        <NumberField
          id="image-pdf-margin"
          label="Margin (mm)"
          value={margin}
          onChange={(value) => {
            setMargin(value);
            resetResult();
          }}
        />
      </fieldset>
      <p className="max-w-[75ch] text-sm leading-relaxed text-body">
        One image per page, centered and fitted without cropping or stretching.
        Photo orientation is applied during decoding. Transparency sits on a
        white page. Images are re-encoded, so original metadata is omitted and
        JPEG quality may change. This creates an image-only PDF, with no OCR or
        searchable text.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          id="image-pdf-create"
          type="button"
          className="btn-primary disabled:cursor-not-allowed disabled:opacity-40"
          disabled={busy || !files.length}
          onClick={() => void generate()}
        >
          {busy ? "Processing images…" : "Create PDF"}
        </button>
        <button
          type="button"
          className="btn-secondary disabled:cursor-not-allowed disabled:opacity-40"
          disabled={busy || !files.length}
          onClick={() => {
            files.forEach(release);
            pendingFocus.current = "image-pdf-files";
            setFiles([]);
            resetResult();
            setStatus("Images cleared. Select images to start again.");
          }}
        >
          Clear images
        </button>
        {busy && (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              pendingFocus.current = files.length
                ? "image-pdf-create"
                : "image-pdf-files";
              controller.current?.abort();
            }}
          >
            Cancel
          </button>
        )}
      </div>
      <p role="status" className="text-sm text-body">
        {status}
      </p>
      {error && (
        <div
          ref={errorPanel}
          tabIndex={-1}
          role="alert"
          aria-labelledby="image-pdf-error-title"
          className="rounded-lg border border-hairline p-4 text-sm"
        >
          <p id="image-pdf-error-title" className="font-semibold">
            Check your images or settings.
          </p>
          <p className="mt-2 leading-relaxed">{error}</p>
          <p className="mt-2 leading-relaxed text-body">
            {files.length
              ? "Your selected images are still available. Adjust your files or settings and try again."
              : "Choose supported images within the limits above and try again."}
          </p>
        </div>
      )}
      {result && (
        <section
          aria-label="PDF ready"
          className="rounded-xl border border-hairline bg-canvas-soft-2 p-5"
        >
          <h2 className="text-xl font-semibold">Your PDF is ready</h2>
          <p className="my-3 text-sm text-body">
            {result.pages} pages · {(result.bytes / 1024).toFixed(1)} KiB. Check
            the downloaded pages before submitting them.
          </p>
          <a
            ref={downloadLink}
            className="btn-primary"
            href={result.url}
            download="images.pdf"
          >
            Download PDF
          </a>
        </section>
      )}
    </div>
  );
}
