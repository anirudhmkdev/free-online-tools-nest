/** Structural DOM shape keeps the serializer testable without executing input HTML. */
export interface HtmlFormattingNode {
  nodeType: number;
  nodeName?: string;
  tagName?: string;
  namespaceURI?: string | null;
  attributes?: ArrayLike<{ name: string; value: string }>;
  childNodes: ArrayLike<HtmlFormattingNode>;
  textContent: string | null;
}

const VOID_TAGS = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
const PRESERVE_TAGS = new Set(["pre", "textarea", "script", "style"]);
const BLOCK_TAGS = new Set(["address", "article", "aside", "blockquote", "body", "dd", "details", "dialog", "div", "dl", "dt", "fieldset", "figcaption", "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hr", "html", "li", "main", "nav", "ol", "p", "pre", "section", "summary", "table", "tbody", "td", "tfoot", "th", "thead", "tr", "ul"]);

function text(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function tagName(node: HtmlFormattingNode): string {
  const name = node.tagName ?? node.nodeName ?? "";
  return node.namespaceURI && node.namespaceURI !== "http://www.w3.org/1999/xhtml" ? name : name.toLowerCase();
}
function opening(node: HtmlFormattingNode): string {
  const attrs = Array.from(node.attributes ?? []).map(attr => ` ${attr.name}="${text(attr.value).replace(/"/g, "&quot;")}"`).join("");
  return `<${tagName(node)}${attrs}>`;
}
function structuralChildren(node: HtmlFormattingNode): boolean {
  const children = Array.from(node.childNodes);
  return children.some(child => child.nodeType === 1) && children.every(child =>
    child.nodeType === 8 || (child.nodeType === 3 && !child.textContent?.trim()) ||
    (child.nodeType === 1 && BLOCK_TAGS.has(tagName(child))),
  );
}

/** Dense serialization preserves mixed inline text and all sensitive whitespace. */
function serialize(node: HtmlFormattingNode, raw = false): string {
  if (node.nodeType === 3) return raw ? node.textContent ?? "" : text(node.textContent ?? "");
  if (node.nodeType === 8) return `<!--${node.textContent ?? ""}-->`;
  if (node.nodeType === 10) return `<!DOCTYPE ${node.nodeName ?? "html"}>`;
  if (node.nodeType !== 1) return "";
  const name = tagName(node);
  const start = opening(node);
  if (VOID_TAGS.has(name)) return start;
  return start + Array.from(node.childNodes).map(child => serialize(child, name === "script" || name === "style")).join("") + `</${name}>`;
}

export function formatHtmlNode(node: HtmlFormattingNode, indent = "  ", depth = 0): string {
  const pad = indent.repeat(depth);
  if (node.nodeType !== 1 || PRESERVE_TAGS.has(tagName(node)) || !structuralChildren(node)) {
    return node.nodeType === 3 && !node.textContent?.trim() ? "" : pad + serialize(node) + "\n";
  }
  return `${pad}${opening(node)}\n` + Array.from(node.childNodes).map(child => formatHtmlNode(child, indent, depth + 1)).join("") + `${pad}</${tagName(node)}>\n`;
}

/** Conservative minification removes structural whitespace without rewriting text. */
export function minifyHtmlNode(node: HtmlFormattingNode): string {
  if (node.nodeType === 8) return "";
  if (node.nodeType !== 1 || PRESERVE_TAGS.has(tagName(node))) return serialize(node);
  const name = tagName(node);
  if (VOID_TAGS.has(name)) return opening(node);
  const structural = structuralChildren(node);
  return opening(node) + Array.from(node.childNodes).map(child =>
    structural && child.nodeType === 3 && !child.textContent?.trim() ? "" : minifyHtmlNode(child),
  ).join("") + `</${name}>`;
}

/** Keep adjacent top-level inline nodes adjacent, including their original spaces. */
export function formatHtmlNodes(nodes: HtmlFormattingNode[], indent = "  ", minify = false): string {
  const structural = nodes.some(node => node.nodeType === 1) && nodes.every(node =>
    node.nodeType === 10 || node.nodeType === 8 ||
    (node.nodeType === 3 && !node.textContent?.trim()) ||
    (node.nodeType === 1 && BLOCK_TAGS.has(tagName(node))),
  );
  if (minify) {
    return nodes.map(node => structural && node.nodeType === 3 && !node.textContent?.trim() ? "" : minifyHtmlNode(node)).join("");
  }
  return structural ? nodes.map(node => formatHtmlNode(node, indent)).join("").replace(/\n$/, "")
    : nodes.map(node => serialize(node)).join("");
}
