import { useEffect, useRef, useState } from "react";
import { buildImagePdf, inspectImage, normalizeImage, validateImageBatch, pageDimensions, fitImage, type PdfSettings } from "../../helpers/image-to-pdf";
import { numberInput } from "../../helpers/student-calculators";
import { NumberField, inputClass } from "./shared/CalculationResult";

interface Entry { id: string; file: File; preview: string; pixels: number }
export default function ImageToPdf() {
  const [files, setFiles] = useState<Entry[]>([]); const [format, setFormat] = useState<PdfSettings["format"]>("a4"); const [orientation, setOrientation] = useState<PdfSettings["orientation"]>("auto"); const [margin, setMargin] = useState("10");
  const [busy, setBusy] = useState(false); const [status, setStatus] = useState(""); const [error, setError] = useState(""); const [result, setResult] = useState<{ url: string; pages: number; bytes: number } | null>(null);
  const previews = useRef(new Set<string>()); const download = useRef<string | null>(null); const controller = useRef<AbortController | null>(null);
  useEffect(() => () => { controller.current?.abort(); previews.current.forEach(url => URL.revokeObjectURL(url)); if (download.current) URL.revokeObjectURL(download.current); }, []);
  function resetResult() { if (download.current) URL.revokeObjectURL(download.current); download.current = null; setResult(null); setError(""); setStatus(""); }
  function release(entry: Entry) { URL.revokeObjectURL(entry.preview); previews.current.delete(entry.preview); }
  async function addFiles(selected: File[]) {
    if (!selected.length) return;
    resetResult(); setBusy(true); const abort = new AbortController(); controller.current = abort; const added: Entry[] = [];
    try {
      validateImageBatch([...files.map(row => ({ size: row.file.size, pixels: row.pixels })), ...selected]);
      for (const file of selected) {
        abort.signal.throwIfAborted(); setStatus(`Checking image ${added.length + 1} of ${selected.length}…`);
        const info = inspectImage(new Uint8Array(await file.arrayBuffer()));
        const pixels = info.width * info.height;
        validateImageBatch([...files, ...added].map(row => ({ size: row.file.size, pixels: row.pixels })).concat({ size: file.size, pixels }));
        const thumbnail = await normalizeImage(file, true); abort.signal.throwIfAborted();
        const preview = URL.createObjectURL(new Blob([new Uint8Array(thumbnail.bytes)], { type: "image/png" })); previews.current.add(preview);
        added.push({ id: crypto.randomUUID(), file, preview, pixels });
      }
      setFiles([...files, ...added]); setStatus(`${files.length + added.length} images ready. Arrange them in PDF page order.`);
    } catch (err) { added.forEach(release); if (!abort.signal.aborted) setError((err as Error).message); else setStatus("Image selection cancelled."); }
    finally { setBusy(false); controller.current = null; }
  }
  async function generate() {
    resetResult(); setBusy(true); const abort = new AbortController(); controller.current = abort;
    try {
      validateImageBatch(files.map(row => ({ size: row.file.size, pixels: row.pixels })));
      const settings = { format, orientation, marginMm: numberInput(margin, "Margin") };
      fitImage(...pageDimensions(settings, 1, 1), settings.marginMm * 72 / 25.4, 1, 1);
      setStatus("Preparing your PDF locally…");
      const bytes = await buildImagePdf(files.length, i => normalizeImage(files[i].file), settings, done => setStatus(`Added page ${done} of ${files.length}…`), abort.signal);
      abort.signal.throwIfAborted();
      const url = URL.createObjectURL(new Blob([new Uint8Array(bytes)], { type: "application/pdf" })); download.current = url;
      setResult({ url, pages: files.length, bytes: bytes.length }); setStatus("PDF ready. Download it below.");
    } catch (err) { if (!abort.signal.aborted) setError((err as Error).message); else setStatus("PDF generation cancelled."); }
    finally { setBusy(false); controller.current = null; }
  }
  function move(index: number, offset: number) { const next = [...files]; [next[index], next[index + offset]] = [next[index + offset], next[index]]; setFiles(next); resetResult(); }
  return <div className="space-y-5">
    <p className="text-sm leading-relaxed text-body">Your files stay in this browser tab. Images are decoded and converted locally; this tool does not upload them or save them in browser storage. Ordinary site analytics may still load, but image contents and filenames are not sent by this tool.</p>
    <div className="rounded-lg border border-hairline bg-canvas-soft-2 p-4"><label htmlFor="image-pdf-files" className="mb-3 block font-medium">Add JPEG or PNG images</label><input id="image-pdf-files" type="file" accept="image/jpeg,image/png,.jpg,.jpeg,.png" multiple disabled={busy} className="block w-full min-w-0 text-sm" onChange={e => { const chosen = Array.from(e.target.files ?? []); e.target.value = ""; void addFiles(chosen); }} /><p className="mt-3 text-xs leading-relaxed text-body">Application guardrails for reliability: 20 files, 15 MiB per file, 50 MiB total, 16 megapixels per image, 64 megapixels total and 16,384 pixels per side. These are choices for this tool, not universal browser or device limits. Smaller batches may still be needed on limited devices.</p></div>
    <ol className="space-y-3" aria-label="Images in PDF page order">{files.map((row, i) => <li key={row.id} className="flex min-w-0 flex-wrap items-center gap-3 rounded-lg border border-hairline p-3"><img src={row.preview} alt={`Preview for page ${i + 1}`} width="64" height="64" className="h-16 w-16 shrink-0 object-contain" /><div className="min-w-0 flex-1"><p className="break-all text-sm font-medium">{i + 1}. {row.file.name}</p><p className="text-xs text-body">{(row.file.size / 1024 ** 2).toFixed(2)} MiB · {(row.pixels / 1e6).toFixed(2)} MP</p></div><div className="flex flex-wrap gap-3 text-sm"><button type="button" disabled={busy || i === 0} className="text-link underline disabled:opacity-40" aria-label={`Move image ${i + 1} up`} onClick={() => move(i, -1)}>Up</button><button type="button" disabled={busy || i === files.length - 1} className="text-link underline disabled:opacity-40" aria-label={`Move image ${i + 1} down`} onClick={() => move(i, 1)}>Down</button><button type="button" disabled={busy} className="text-link underline disabled:opacity-40" aria-label={`Remove image ${i + 1}`} onClick={() => { release(row); setFiles(files.filter(item => item.id !== row.id)); resetResult(); }}>Remove</button></div></li>)}</ol>
    <fieldset disabled={busy} className="grid gap-5 sm:grid-cols-3"><legend className="mb-3 font-semibold">PDF settings</legend><div><label htmlFor="image-pdf-size" className="mb-2 block text-sm">Page size</label><select id="image-pdf-size" value={format} className={inputClass} onChange={e => { setFormat(e.target.value as PdfSettings["format"]); resetResult(); }}><option value="a4">A4</option><option value="letter">US Letter</option></select></div><div><label htmlFor="image-pdf-orientation" className="mb-2 block text-sm">Orientation</label><select id="image-pdf-orientation" value={orientation} className={inputClass} onChange={e => { setOrientation(e.target.value as PdfSettings["orientation"]); resetResult(); }}><option value="auto">Auto per image</option><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></div><NumberField id="image-pdf-margin" label="Margin (mm)" value={margin} onChange={value => { setMargin(value); resetResult(); }} /></fieldset>
    <p className="text-xs leading-relaxed text-body">One image per page, centered and fitted without cropping or stretching. Photo orientation is applied during decoding. Transparency sits on a white page. Images are re-encoded, so original metadata is omitted and JPEG quality may change. This creates an image-only PDF, with no OCR or searchable text.</p>
    <div className="flex flex-wrap gap-3"><button type="button" className="btn-primary" disabled={busy || !files.length} onClick={() => void generate()}>Create PDF</button><button type="button" className="btn-secondary" disabled={busy || !files.length} onClick={() => { files.forEach(release); setFiles([]); resetResult(); }}>Clear images</button>{busy && <button type="button" className="btn-secondary" onClick={() => controller.current?.abort()}>Cancel</button>}</div>
    <p role="status" className="text-sm text-body">{status}</p>{error && <p role="alert" className="rounded-lg border border-hairline p-4 text-sm">{error}</p>}
    {result && <section aria-label="PDF ready" className="rounded-xl border border-hairline bg-canvas-soft-2 p-5"><h2 className="font-semibold">Your PDF is ready</h2><p className="my-3 text-sm text-body">{result.pages} pages · {(result.bytes / 1024).toFixed(1)} KiB. Check the downloaded pages before submitting them.</p><a className="btn-primary" href={result.url} download="images.pdf">Download PDF</a></section>}
  </div>;
}
