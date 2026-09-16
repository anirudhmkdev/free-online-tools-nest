/** Application guardrails, not universal limits of browsers or devices. */
export const IMAGE_PDF_LIMITS = { files: 20, fileBytes: 15 * 1024 ** 2, totalBytes: 50 * 1024 ** 2, pixels: 16_000_000, totalPixels: 64_000_000, side: 16384 };
export type ImageKind = "png" | "jpeg";
export interface ImageInfo { kind: ImageKind; width: number; height: number }
export interface PdfSettings { format: "a4" | "letter"; orientation: "portrait" | "landscape" | "auto"; marginMm: number }
export function validateImageDimensions(width: number, height: number) {
  if (![width, height].every(n => Number.isInteger(n) && n > 0 && n <= IMAGE_PDF_LIMITS.side) || width * height > IMAGE_PDF_LIMITS.pixels) throw new Error("Image exceeds this tool's guardrail of 16 megapixels or 16,384 pixels on either side. Resize it first.");
}
export function validateImageBatch(files: { size: number; pixels?: number }[]) {
  if (!files.length || files.length > IMAGE_PDF_LIMITS.files) throw new Error("Choose between 1 and 20 images.");
  if (files.some(file => !Number.isFinite(file.size) || file.size <= 0 || file.size > IMAGE_PDF_LIMITS.fileBytes)) throw new Error("Each image must be non-empty and at most 15 MiB.");
  if (files.reduce((n, file) => n + file.size, 0) > IMAGE_PDF_LIMITS.totalBytes) throw new Error("The selected files exceed this tool's 50 MiB total guardrail.");
  if (files.reduce((n, file) => n + (file.pixels ?? 0), 0) > IMAGE_PDF_LIMITS.totalPixels) throw new Error("The selected images exceed this tool's 64 megapixel total guardrail. Use a smaller batch.");
}
/** Check signatures and dimensions before asking the browser to allocate a bitmap. */
export function inspectImage(bytes: Uint8Array): ImageInfo {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (bytes.length >= 33 && [137,80,78,71,13,10,26,10].every((b, i) => bytes[i] === b)) {
    let offset = 8; let width = 0; let height = 0; let data = false; let ended = false;
    while (offset + 12 <= bytes.length) {
      const length = view.getUint32(offset); const type = String.fromCharCode(...bytes.slice(offset + 4, offset + 8));
      if (length > bytes.length - offset - 12) throw new Error("This PNG is truncated.");
      if (offset === 8 && (type !== "IHDR" || length !== 13)) throw new Error("Invalid PNG header.");
      if (type === "IHDR") { width = view.getUint32(offset + 8); height = view.getUint32(offset + 12); validateImageDimensions(width, height); }
      if (type === "acTL") throw new Error("Animated PNG is not supported. Export a still JPEG or PNG first.");
      if (type === "IDAT") data = true;
      if (type === "IEND") { ended = true; break; }
      offset += length + 12;
    }
    if (!width || !data || !ended) throw new Error("This PNG is incomplete or invalid.");
    return { kind: "png", width, height };
  }
  if (bytes.length > 4 && bytes[0] === 255 && bytes[1] === 216) {
    let offset = 2;
    while (offset < bytes.length) {
      if (bytes[offset++] !== 255) break;
      while (bytes[offset] === 255) offset++;
      const marker = bytes[offset++];
      if (marker === 218 || marker === 217) break;
      if (marker === 1 || marker >= 208 && marker <= 215) continue;
      if (offset + 2 > bytes.length) break;
      const length = view.getUint16(offset);
      if (length < 2 || offset + length > bytes.length) break;
      if ([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker)) {
        if (length < 8) break;
        const height = view.getUint16(offset + 3); const width = view.getUint16(offset + 5);
        validateImageDimensions(width, height); return { kind: "jpeg", width, height };
      }
      offset += length;
    }
    throw new Error("JPEG dimensions could not be read. The file may be damaged.");
  }
  throw new Error("Choose a still JPEG or PNG. HEIC, WebP, GIF, SVG and other formats are not supported here.");
}
export function pageDimensions(settings: PdfSettings, imageWidth: number, imageHeight: number): [number, number] {
  if (!["a4", "letter"].includes(settings.format) || !["portrait", "landscape", "auto"].includes(settings.orientation)) throw new Error("Choose a supported page size and orientation.");
  const dimensions: [number, number] = settings.format === "a4" ? [210 * 72 / 25.4, 297 * 72 / 25.4] : [612, 792];
  return settings.orientation === "landscape" || settings.orientation === "auto" && imageWidth > imageHeight ? [dimensions[1], dimensions[0]] : dimensions;
}
export function fitImage(pageWidth: number, pageHeight: number, margin: number, imageWidth: number, imageHeight: number) {
  if (![pageWidth, pageHeight, imageWidth, imageHeight].every(n => Number.isFinite(n) && n > 0) || !Number.isFinite(margin) || margin < 0 || margin * 2 >= Math.min(pageWidth, pageHeight)) throw new Error("Margin must be non-negative and leave space for the image on the page.");
  const ratio = Math.min((pageWidth - 2 * margin) / imageWidth, (pageHeight - 2 * margin) / imageHeight);
  const width = imageWidth * ratio; const height = imageHeight * ratio;
  return { width, height, x: (pageWidth - width) / 2, y: (pageHeight - height) / 2 };
}
export interface NormalizedImage extends ImageInfo { bytes: Uint8Array }
/** Images are obtained sequentially to avoid holding all decoded bitmaps at once. */
export async function buildImagePdf(count: number, imageAt: (index: number) => Promise<NormalizedImage>, settings: PdfSettings, progress?: (done: number) => void, signal?: AbortSignal) {
  if (!Number.isInteger(count) || count < 1 || count > IMAGE_PDF_LIMITS.files) throw new Error("Choose between 1 and 20 images.");
  const { PDFDocument, rgb } = await import("pdf-lib");
  const pdf = await PDFDocument.create(); pdf.setTitle("Images"); pdf.setCreator("Free Online Tools Nest");
  for (let i = 0; i < count; i++) {
    signal?.throwIfAborted();
    const image = await imageAt(i); signal?.throwIfAborted(); validateImageDimensions(image.width, image.height);
    const dimensions = pageDimensions(settings, image.width, image.height);
    const position = fitImage(...dimensions, settings.marginMm * 72 / 25.4, image.width, image.height);
    const embedded = image.kind === "jpeg" ? await pdf.embedJpg(image.bytes) : await pdf.embedPng(image.bytes);
    const page = pdf.addPage(dimensions);
    page.drawRectangle({ x: 0, y: 0, width: dimensions[0], height: dimensions[1], color: rgb(1, 1, 1) });
    page.drawImage(embedded, position); await pdf.flush(); progress?.(i + 1);
  }
  signal?.throwIfAborted(); return pdf.save();
}

/** Called only in the browser. Canvas re-encoding removes original metadata. */
export async function normalizeImage(file: File, thumbnail = false): Promise<NormalizedImage> {
  const info = inspectImage(new Uint8Array(await file.arrayBuffer()));
  if (typeof createImageBitmap !== "function") throw new Error("This browser cannot use the image decoder required by this tool. Try a current browser.");
  let bitmap: ImageBitmap;
  try { bitmap = await createImageBitmap(file, { imageOrientation: "from-image" }); }
  catch { throw new Error("The image could not be decoded. It may be damaged or use an unsupported encoding."); }
  const canvas = document.createElement("canvas");
  try {
    validateImageDimensions(bitmap.width, bitmap.height);
    const ratio = thumbnail ? Math.min(1, 160 / Math.max(bitmap.width, bitmap.height)) : 1;
    canvas.width = Math.max(1, Math.round(bitmap.width * ratio)); canvas.height = Math.max(1, Math.round(bitmap.height * ratio));
    const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("The browser could not allocate an image canvas. Try a smaller image.");
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const kind = thumbnail ? "png" : info.kind;
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("Image conversion failed. Try a smaller image.")), kind === "png" ? "image/png" : "image/jpeg", 0.95));
    return { kind, width: canvas.width, height: canvas.height, bytes: new Uint8Array(await blob.arrayBuffer()) };
  } finally { bitmap.close(); canvas.width = 0; canvas.height = 0; }
}
