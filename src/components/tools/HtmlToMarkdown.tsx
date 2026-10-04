import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useCallback } from "react";
import ErrorBanner from "../ErrorBanner";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";

function htmlToMarkdown(html: string): string {
  const div = document.createElement("div");
  div.innerHTML = html;

  function convertNode(node: Node, depth: number = 0): string {
    const indent = "  ".repeat(depth);
    const results: string[] = [];

    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes[i];

      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent?.trim();
        if (text) results.push(text);
        continue;
      }

      if (child.nodeType !== Node.ELEMENT_NODE) continue;

      const el = child as HTMLElement;
      const tag = el.tagName.toLowerCase();

      switch (tag) {
        case "h1": case "h2": case "h3":
        case "h4": case "h5": case "h6": {
          const level = parseInt(tag[1]);
          const prefix = "#".repeat(level);
          results.push(`\n${indent}${prefix} ${convertInner(el)}\n`);
          break;
        }
        case "p": {
          results.push(`\n${indent}${convertInner(el)}\n`);
          break;
        }
        case "strong": case "b": {
          results.push(`**${convertInner(el)}**`);
          break;
        }
        case "em": case "i": {
          results.push(`*${convertInner(el)}*`);
          break;
        }
        case "a": {
          const href = el.getAttribute("href") || "";
          results.push(`[${convertInner(el)}](${href})`);
          break;
        }
        case "img": {
          const src = el.getAttribute("src") || "";
          const alt = el.getAttribute("alt") || "";
          results.push(`![${alt}](${src})`);
          break;
        }
        case "br": {
          results.push("\n");
          break;
        }
        case "hr": {
          results.push("\n---\n");
          break;
        }
        case "ul": {
          const items = Array.from(el.querySelectorAll(":scope > li"));
          for (const item of items) {
            const inner = convertNode(item, depth + 1).trim();
            results.push(`\n${indent}- ${inner}`);
          }
          results.push("\n");
          break;
        }
        case "ol": {
          const items = Array.from(el.querySelectorAll(":scope > li"));
          items.forEach((item, idx) => {
            const inner = convertNode(item, depth + 1).trim();
            results.push(`\n${indent}${idx + 1}. ${inner}`);
          });
          results.push("\n");
          break;
        }
        case "li": {
          results.push(convertNode(el, depth));
          break;
        }
        case "code": {
          if (el.parentElement?.tagName === "PRE") break;
          const codeText = el.textContent || "";
          if (codeText.includes("`")) {
            results.push("`` " + codeText + " ``");
          } else {
            results.push("`" + codeText + "`");
          }
          break;
        }
        case "pre": {
          const codeEl = el.querySelector("code");
          const lang = codeEl?.getAttribute("class")?.replace(/^language-/, "") || "";
          const code = el.textContent || "";
          results.push(`\n\`\`\`${lang}\n${code}\n\`\`\`\n`);
          break;
        }
        case "blockquote": {
          const inner = convertNode(el, depth).trim();
          results.push(
            `\n${indent}> ` + inner.replace(/\n/g, "\n> ") + "\n"
          );
          break;
        }
        case "table": {
          const rows = Array.from(el.querySelectorAll("tr"));
          if (rows.length === 0) break;
          const tableLines: string[] = [];

          const headerCells = rows[0].querySelectorAll("th, td");
          const headerRow = "| " + Array.from(headerCells).map((c) => convertInner(c as HTMLElement).trim()).join(" | ") + " |";
          tableLines.push(headerRow);
          tableLines.push("| " + Array.from(headerCells).map(() => "---").join(" | ") + " |");

          for (let r = 1; r < rows.length; r++) {
            const cells = rows[r].querySelectorAll("td");
            const rowStr = "| " + Array.from(cells).map((c) => convertInner(c as HTMLElement).trim()).join(" | ") + " |";
            tableLines.push(rowStr);
          }

          results.push("\n" + tableLines.join("\n") + "\n");
          break;
        }
        case "div": case "span": case "section":
        case "article": case "main": case "header":
        case "footer": case "nav": {
          results.push(convertNode(el, depth));
          break;
        }
        default: {
          results.push(convertNode(el, depth));
        }
      }
    }

    return results.join("");
  }

  function convertInner(el: HTMLElement): string {
    return Array.from(el.childNodes)
      .map((child) => {
        if (child.nodeType === Node.TEXT_NODE) return child.textContent || "";
        if (child.nodeType !== Node.ELEMENT_NODE) return "";
        const c = child as HTMLElement;
        const tag = c.tagName.toLowerCase();
        if (tag === "strong" || tag === "b") return `**${convertInner(c)}**`;
        if (tag === "em" || tag === "i") return `*${convertInner(c)}*`;
        if (tag === "code") return "`" + (c.textContent || "") + "`";
        if (tag === "a") return `[${convertInner(c)}](${c.getAttribute("href") || ""})`;
        if (tag === "br") return "\n";
        return c.textContent || "";
      })
      .join("");
  }

  const result = convertNode(div).trim();
  return result;
}

export default function HtmlToMarkdown() {
  const { markInteraction, recordSuccess, clearInteraction } = useToolTelemetry();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, handleCopy] = useCopyToClipboard();

  const convert = useCallback(() => {
    markInteraction();
    if (!input.trim()) {
      setOutput("");
      setError("");
      return;
    }
    try {
      const md = htmlToMarkdown(input.trim());
      setOutput(md);
      if (md.trim()) recordSuccess("convert");
      setError("");
    } catch {
      setError("Failed to convert HTML to Markdown. Please check your HTML syntax.");
      setOutput("");
    }
  }, [input, markInteraction, recordSuccess]);

  const handleClear = () => {
    clearInteraction();
    setInput("");
    setOutput("");
    setError("");
  };

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="html-input" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
          Paste your HTML
        </label>
        <textarea
          id="html-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="<h1>Hello World</h1><p>This is <strong>bold</strong> and <em>italic</em> text.</p><ul><li>Item one</li><li>Item two</li></ul>"
          rows={8}
          className="w-full p-4 border rounded-lg text-sm resize-y outline-none transition-colors duration-150"
          style={{
            backgroundColor: "var(--color-canvas-soft)",
            borderColor: "var(--color-hairline)",
            color: "var(--color-ink)",
            fontFamily: "var(--font-mono)",
          }}
          spellCheck={false}
        />
      </div>

      <ErrorBanner message={error} />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={convert}
          className="btn-primary btn-sm"
          style={{ backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)" }}
        >
          Convert to Markdown
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="text-xs px-3 py-1.5 rounded transition-colors duration-150 border"
          style={{
            borderColor: "var(--color-hairline)",
            color: "var(--color-mute)",
          }}
        >
          Clear
        </button>
      </div>

      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>Markdown output</span>
            <button
              type="button"
              onClick={() => handleCopy(output)}
              className="text-sm px-3 py-1 rounded-md transition-colors duration-150"
              style={{
                color: copied ? "var(--color-success)" : "var(--color-link)",
                backgroundColor: "var(--color-canvas-soft-2)",
              }}
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <pre
            className="p-4 rounded-lg text-sm overflow-x-auto max-h-96"
            style={{
              backgroundColor: "var(--color-canvas-soft-2)",
              color: "var(--color-ink)",
              fontFamily: "var(--font-mono)",
              lineHeight: "1.6",
            }}
          >
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}
