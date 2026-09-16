import { describe, expect, it } from "vitest";
import { PDFDocument, PDFName } from "pdf-lib";
import { buildImagePdf, fitImage, IMAGE_PDF_LIMITS as limits, inspectImage, pageDimensions, validateImageBatch, validateImageDimensions } from "./image-to-pdf";

const png = new Uint8Array(Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aD1sAAAAASUVORK5CYII=", "base64"));
describe("image PDF layout and application guardrails", () => {
  it("fits and centers a landscape image on a portrait letter page without cropping", () => expect(fitImage(612, 792, 36, 1200, 800)).toEqual({ width: 540, height: 360, x: 36, y: 216 }));
  it("fits a landscape letter page", () => expect(fitImage(792, 612, 36, 1200, 800)).toEqual({ width: 720, height: 480, x: 36, y: 66 }));
  it("selects orientation per image and preserves physical A4 dimensions", () => {
    expect(pageDimensions({ format: "letter", orientation: "auto", marginMm: 0 }, 1200, 800)).toEqual([792, 612]);
    expect(pageDimensions({ format: "letter", orientation: "auto", marginMm: 0 }, 800, 1200)).toEqual([612, 792]);
    expect(pageDimensions({ format: "a4", orientation: "portrait", marginMm: 0 }, 1, 1)[0]).toBeCloseTo(595.27559);
  });
  it.each([-1, 306, Infinity, NaN])("rejects a margin that leaves no valid image area: %s", margin => expect(() => fitImage(612, 792, margin, 1, 1)).toThrow());
  it("rejects invalid image dimensions", () => {
    for (const [w, h] of [[0, 1], [Infinity, 1], [1, -1], [4001, 4000], [16385, 1]]) expect(() => validateImageDimensions(w, h)).toThrow();
    expect(() => validateImageDimensions(4000, 4000)).not.toThrow();
  });
  it("enforces batch boundaries", () => {
    expect(() => validateImageBatch(Array.from({ length: 20 }, () => ({ size: 1 })))).not.toThrow();
    expect(() => validateImageBatch([{ size: limits.fileBytes }])).not.toThrow();
    for (const batch of [[], Array.from({ length: 21 }, () => ({ size: 1 })), [{ size: 0 }], [{ size: limits.fileBytes + 1 }], Array.from({ length: 4 }, () => ({ size: limits.fileBytes })), [{ size: 1, pixels: limits.totalPixels + 1 }]]) expect(() => validateImageBatch(batch)).toThrow();
  });
  it("reads a PNG signature and dimensions and rejects truncated or renamed input", () => {
    expect(inspectImage(png)).toEqual({ kind: "png", width: 1, height: 1 });
    expect(() => inspectImage(png.slice(0, 40))).toThrow();
    expect(() => inspectImage(new TextEncoder().encode("<svg></svg>"))).toThrow("JPEG or PNG");
    const large = png.slice(); new DataView(large.buffer).setUint32(16, 100000); expect(() => inspectImage(large)).toThrow("guardrail");
    const animated = png.slice(); animated.set(new TextEncoder().encode("acTL"), 37); expect(() => inspectImage(animated)).toThrow("Animated");
  });
  it("reads JPEG dimensions before decoding", () => {
    const jpeg = new Uint8Array([255,216,255,192,0,11,8,3,32,4,176,1,1,17,0,255,217]);
    expect(inspectImage(jpeg)).toEqual({ kind: "jpeg", width: 1200, height: 800 });
    expect(() => inspectImage(jpeg.slice(0, 10))).toThrow();
  });
  it("generates ordered pages with expected sizes and no source filenames or attachments", async () => {
    const order: number[] = [];
    const bytes = await buildImagePdf(2, async i => { order.push(i); return { bytes: png, kind: "png", width: i === 0 ? 1200 : 800, height: i === 0 ? 800 : 1200 }; }, { format: "letter", orientation: "auto", marginMm: 12.7 });
    const pdf = await PDFDocument.load(bytes);
    expect(order).toEqual([0, 1]); expect(pdf.getPageCount()).toBe(2);
    expect(pdf.getPages().map(page => page.getSize())).toEqual([{ width: 792, height: 612 }, { width: 612, height: 792 }]);
    expect(pdf.getTitle()).toBe("Images"); expect(pdf.getAuthor()).toBeUndefined();
    expect(pdf.catalog.has(PDFName.of("Names"))).toBe(false);
  });
  it("stops a cancelled conversion before loading image data", async () => {
    const controller = new AbortController(); controller.abort(); let loaded = false;
    await expect(buildImagePdf(1, async () => { loaded = true; return { bytes: png, kind: "png", width: 1, height: 1 }; }, { format: "a4", orientation: "portrait", marginMm: 0 }, undefined, controller.signal)).rejects.toThrow();
    expect(loaded).toBe(false);
  });
});
