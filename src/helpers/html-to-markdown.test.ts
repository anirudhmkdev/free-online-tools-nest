import { it, expect } from "vitest";
import { htmlToMarkdown } from "./html-to-markdown";
it("preserves inline boundaries and nested list meaning", () => {
  expect(htmlToMarkdown("<p>Hello <strong>world</strong> again.</p>")).toBe("Hello **world** again.");
  expect(htmlToMarkdown("<ul><li>One<ul><li>Two</li></ul></li></ul>")).toContain("Two");
});
it("converts simple tables and excludes scripts and executable URLs", () => {
  expect(htmlToMarkdown("<table><thead><tr><th>Name</th></tr></thead><tbody><tr><td>A</td></tr></tbody></table>")).toMatch(/\| Name \|[\s\S]*\| A \|/);
  expect(htmlToMarkdown('<script>alert(1)</script><p><a href="javascript:alert(1)">Safe text</a></p>')).toBe("Safe text");
});
