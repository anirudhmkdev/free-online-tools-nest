import { describe, expect, it } from "vitest";
import { PDFDocument, PDFName } from "pdf-lib";
import { rewritePdf } from "./pdf-rewrite";
const buffer = (bytes: Uint8Array) => Uint8Array.from(bytes).buffer;
describe("honest PDF rewrite", () => {
  it.each([true, false])("retains page count and dimensions with object streams=%s", async mode => {
    const source = await PDFDocument.create();
    source.addPage([300, 400]); source.addPage([612, 792]);
    const result = await PDFDocument.load(await rewritePdf(buffer(await source.save()), mode));
    expect(result.getPages().map(p => p.getSize())).toEqual([{width:300,height:400},{width:612,height:792}]);
  });
  it("rejects invalid and zero-page files", async () => {
    await expect(rewritePdf(buffer(new TextEncoder().encode("not a PDF")), true)).rejects.toThrow();
    const empty = await PDFDocument.create();
    await expect(rewritePdf(buffer(await empty.save({addDefaultPage:false})), true)).rejects.toThrow(/no pages/);
  });
  it("rejects a PDF with an encryption marker instead of bypassing it", async () => {
    const doc = await PDFDocument.create(); doc.addPage();
    doc.context.trailerInfo.Encrypt = doc.context.register(doc.context.obj({Filter: PDFName.of("Standard")}));
    await expect(rewritePdf(buffer(await doc.save()), true)).rejects.toThrow(/encrypt/i);
  });
});
