import { it, expect } from "vitest";
import { generateSitemap } from "./sitemap-generator";
import { analyzeStrength } from "./password-strength";
import { metadataUrlError } from "./metadata-urls";
const entry = {url:"https://example.com/a?x=1&y=2",priority:"0.5",changeFreq:"weekly",lastmod:"2026-10-04"};
it("produces escaped sitemap URLs and rejects invalid publication inputs", () => {
  expect(generateSitemap([entry])).toContain("a?x=1&amp;y=2");
  expect(() => generateSitemap([{...entry,url:"/relative"}])).toThrow();
  expect(() => generateSitemap([entry,{...entry,url:"https://other.com/"}])).toThrow();
  expect(() => generateSitemap([{...entry,lastmod:"2026-02-30"}])).toThrow();
  expect(() => generateSitemap([{...entry,priority:"1.1"}])).toThrow();
});
it("never rates repeated common passwords highly", () => {
  expect(analyzeStrength("Password1!".repeat(7)).label).toBe("Very Weak");
  expect(analyzeStrength("Ab9!".repeat(20)).score).toBeLessThan(25);
  expect(analyzeStrength("qwerty123456").score).toBeLessThan(25);
});
it("rejects malformed publication URLs before tag generation", () => {
  expect(metadataUrlError({URL:"https://example.com/a?x=1&y=2"})).toBe("");
  for (const URL of ["/relative","javascript:alert(1)","https://example.com/#fragment","https://user:password@example.com/","https://exa mple.com/"]) expect(metadataUrlError({URL})).not.toBe("");
});
