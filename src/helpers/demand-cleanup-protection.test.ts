import { describe, expect, it } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, basename, dirname, resolve } from "node:path";
import { checkProtection, ownedSignals, hashText } from "../../scripts/phase-3-protection.mjs";

describe("separate approved content delta", () => {
  it("permits reviewed content while continuing to protect canonical/indexing metadata and source bytes", () => {
    const root = mkdtempSync(join(tmpdir(), "tool-content-delta-"));
    try {
      mkdirSync(join(root, "dist", "tools", "example"), { recursive: true });
      const route = "/tools/example/";
      const html = (text: string, robots = "index, follow") => `<title>Example</title><meta name="description" content="Example"><meta name="robots" content="${robots}"><link rel="canonical" href="https://freeonlinetoolsnest.com${route}"><main><h1>Example</h1><p>${text}</p></main>`;
      const before = html("Original");
      const after = html("Reviewed");
      writeFileSync(join(root, "dist", "tools", "example", "index.html"), after);
      writeFileSync(join(root, "source.txt"), "Reviewed source");
      const fixture = { pages: { [route]: ownedSignals(before, route) }, sources: { "source.txt": hashText("Original source") } };
      const delta = { pages: { [route]: { reason: "Approved editorial change", signals: { ownedTextHash: ownedSignals(after, route).ownedTextHash } } }, sources: { "source.txt": { reason: "Approved source change", hash: hashText("Reviewed source") } } };
      expect(checkProtection(root, fixture).length).toBe(2);
      expect(checkProtection(root, fixture, delta)).toEqual([]);
      writeFileSync(join(root, "dist", "tools", "example", "index.html"), html("Reviewed", "noindex"));
      expect(checkProtection(root, fixture, delta)).toContain(route + ": protected robots changed");
      writeFileSync(join(root, "source.txt"), "Unexpected further edit");
      expect(checkProtection(root, fixture, delta)).toContain("source.txt: protected source changed");
    } finally {
      if (resolve(dirname(root)) !== resolve(tmpdir()) || !basename(root).startsWith("tool-content-delta-")) throw new Error("Unexpected temporary test path");
      rmSync(root, { recursive: true, force: true });
    }
  });
  it("does not accept a robots or canonical override in a content delta", () => {
    const delta = { pages: { "/tools/example/": { reason: "Content only", signals: { robots: "noindex" } } }, sources: {} };
    // No files are needed for this deliberately unknown route.
    expect(checkProtection("", { pages: {}, sources: {} }, delta)).toContain("/tools/example/: invalid approved content delta");
  });
});
