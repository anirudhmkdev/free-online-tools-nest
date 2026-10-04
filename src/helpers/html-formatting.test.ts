import { describe, expect, it } from "vitest";
import { formatHtmlNode, formatHtmlNodes, minifyHtmlNode, type HtmlFormattingNode } from "./html-formatting";

const value = (content: string): HtmlFormattingNode => ({ nodeType: 3, textContent: content, childNodes: [] });
const element = (tagName: string, childNodes: HtmlFormattingNode[], attributes: { name: string; value: string }[] = []): HtmlFormattingNode => ({ nodeType: 1, tagName, childNodes, attributes, textContent: null });

describe("HTML output preserves parsed values", () => {
  it("re-escapes decoded quotes, ampersands and angle brackets", () => {
    const node = element("p", [value('A < B & C > D')], [{ name: "title", value: 'say "hello" & <stop>' }]);
    expect(formatHtmlNode(node).trim()).toBe('<p title="say &quot;hello&quot; &amp; &lt;stop&gt;">A &lt; B &amp; C &gt; D</p>');
  });
  it("preserves spaces and newlines inside pre and textarea in both modes", () => {
    for (const tag of ["pre", "textarea"]) {
      const node = element(tag, [value("  line one\n    line two  ")]);
      expect(formatHtmlNode(node)).toBe(`<${tag}>  line one\n    line two  </${tag}>\n`);
      expect(minifyHtmlNode(node)).toBe(`<${tag}>  line one\n    line two  </${tag}>`);
    }
  });
  it("preserves mixed inline spacing instead of inserting line breaks", () => {
    const node = element("p", [value("Hello "), element("strong", [value("world")]), value("!")]);
    expect(formatHtmlNode(node)).toBe("<p>Hello <strong>world</strong>!</p>\n");
    const adjacent = element("div", [element("span", [value("a")]), element("span", [value("b")])]);
    expect(formatHtmlNode(adjacent)).toBe("<div><span>a</span><span>b</span></div>\n");
  });
  it("preserves adjacency and meaningful edge spaces in inline fragments", () => {
    const adjacent = [element("span", [value("a")]), element("span", [value("b")])];
    expect(formatHtmlNodes(adjacent)).toBe("<span>a</span><span>b</span>");
    const spaced = [value(" before "), ...adjacent, value(" after ")];
    expect(formatHtmlNodes(spaced)).toBe(" before <span>a</span><span>b</span> after ");
    expect(formatHtmlNodes(spaced, "  ", true)).toBe(" before <span>a</span><span>b</span> after ");
  });
  it("keeps script and style raw text and string whitespace intact", () => {
    const script = element("script", [value('if (a < b) { const s = "a  b"; }')]);
    expect(formatHtmlNode(script)).toBe('<script>if (a < b) { const s = "a  b"; }</script>\n');
    expect(minifyHtmlNode(script)).toBe('<script>if (a < b) { const s = "a  b"; }</script>');
  });
  it("indents block structure and minifies only its structural whitespace", () => {
    const node = element("div", [value("\n  "), element("p", [value("a  b")]), value("\n")]);
    expect(formatHtmlNode(node)).toBe("<div>\n  <p>a  b</p>\n</div>\n");
    expect(minifyHtmlNode(node)).toBe("<div><p>a  b</p></div>");
  });
});
