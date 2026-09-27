export async function rewritePdf(bytes: ArrayBuffer, useObjectStreams: boolean): Promise<Uint8Array> {
  const { PDFDocument } = await import("pdf-lib");
  // Do not ignore encryption: unsupported files must fail instead of producing a damaged copy.
  const pdf = await PDFDocument.load(bytes);
  if (!pdf.getPageCount()) throw new Error("The PDF contains no pages.");
  return pdf.save({ useObjectStreams, objectsPerTick: 50, addDefaultPage: false });
}
