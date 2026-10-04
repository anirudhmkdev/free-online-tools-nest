import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { isAbsoluteHttpUrl } from "../../helpers/tool-output-validity";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";

function estimatePixelWidth(text: string): number {
  let width = 0;
  for (const char of text) {
    if (char >= "\u4e00" && char <= "\u9fff") width += 20;
    else if (char >= "\u3040" && char <= "\u30ff") width += 20;
    else if (char >= "\uac00" && char <= "\ud7af") width += 20;
    else if (char >= "A" && char <= "Z") width += 14;
    else if (char >= "a" && char <= "z") width += 11;
    else if (char >= "0" && char <= "9") width += 11;
    else if (char === " ") width += 6;
    else if (char === "." || char === "," || char === "!" || char === "?") width += 6;
    else width += 11;
  }
  return Math.round(width);
}

export default function SerpPreviewGenerator() {
  const { markInteraction, recordSuccess } = useToolTelemetry();
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [copied, handleCopy] = useCopyToClipboard();

  const titleChars = title.length;
  const titlePx = useMemo(() => estimatePixelWidth(title), [title]);
  const descChars = description.length;

  const titleOverflow = titlePx > 600;
  const descOverflow = descChars > 160;

  const displayUrl = useMemo(() => {
    if (!url) return "example.com › page";
    try {
      const u = new URL(url.startsWith("http") ? url : `https://${url}`);
      const path = u.pathname.replace(/\/$/, "") || "";
      return `${u.hostname.replace("www.", "")}${path ? " › " + path.slice(1).replace(/\//g, " › ") : ""}`;
    } catch {
      return url.replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\//g, " › ") || "example.com";
    }
  }, [url]);

  const displayTitle = useMemo(() => {
    if (!title) return "Search Result Title — Example Page";
    return title;
  }, [title]);

  const displayDesc = useMemo(() => {
    if (!description) return "This is where your meta description will appear in Google search results. Write a compelling description to improve click-through rates.";
    return description;
  }, [description]);

  const metaHtml = useMemo(() => {
    const lines: string[] = [];
    if (title) {
      lines.push(`<title>${escapeAttr(title)}</title>`);
      lines.push(`<meta name="title" content="${escapeAttr(title)}" />`);
    }
    if (description) {
      lines.push(`<meta name="description" content="${escapeAttr(description)}" />`);
    }
    if (url) {
      lines.push(`<link rel="canonical" href="${escapeAttr(url)}" />`);
    }
    return lines.join("\n");
  }, [title, description, url]);

  const handleCopyAll = useCallback(() => {
    handleCopy(metaHtml);
  }, [handleCopy, metaHtml]);

  useEffect(() => {
    if (metaHtml && (title.trim() || description.trim()) && (!url || isAbsoluteHttpUrl(url))) recordSuccess("generate");
  }, [metaHtml, title, description, url, recordSuccess]);

  return (
    <div onChangeCapture={markInteraction} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="sp-title" className="block text-sm font-medium mb-1" style={{ color: "var(--color-ink)" }}>Page Title</label>
            <input
              id="sp-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your page title..."
              className="w-full h-10 px-3 border rounded-lg text-sm outline-none"
              style={{ backgroundColor: "var(--color-canvas-soft)", borderColor: "var(--color-hairline)", color: "var(--color-ink)" }}
            />
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-xs" style={{ color: "var(--color-mute)" }}>{titleChars} chars</span>
              <span className="text-xs" style={{ color: "var(--color-mute)" }}>{titlePx}px</span>
              {titleOverflow && (
                <span className="text-xs font-medium" style={{ color: "var(--color-error)" }}>Title may be truncated</span>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="sp-url" className="block text-sm font-medium mb-1" style={{ color: "var(--color-ink)" }}>Page URL</label>
            <input
              id="sp-url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/page"
              className="w-full h-10 px-3 border rounded-lg text-sm outline-none"
              style={{ backgroundColor: "var(--color-canvas-soft)", borderColor: "var(--color-hairline)", color: "var(--color-ink)" }}
            />
          </div>
          <div>
            <label htmlFor="sp-desc" className="block text-sm font-medium mb-1" style={{ color: "var(--color-ink)" }}>Meta Description</label>
            <textarea
              id="sp-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter your meta description..."
              rows={3}
              className="w-full p-3 border rounded-lg text-sm resize-y outline-none"
              style={{ backgroundColor: "var(--color-canvas-soft)", borderColor: "var(--color-hairline)", color: "var(--color-ink)" }}
            />
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-xs" style={{ color: "var(--color-mute)" }}>{descChars} chars</span>
              {descOverflow && (
                <span className="text-xs font-medium" style={{ color: "var(--color-error)" }}>Description too long (max 160 chars)</span>
              )}
            </div>
          </div>
        </div>

        <div>
          <span className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>Google Search Preview</span>
          <div
            className="p-4 rounded-lg border max-w-[600px]"
            style={{ backgroundColor: "var(--color-canvas)", borderColor: "var(--color-hairline)" }}
          >
            <div className="text-sm" style={{ color: "#006621" }}>{displayUrl}</div>
            <div
              className="text-xl leading-tight mt-0.5 cursor-pointer"
              style={{ color: "#1a0dab", fontFamily: "arial, sans-serif" }}
            >
              {displayTitle}
            </div>
            <div className="text-sm mt-1 leading-5" style={{ color: "#545454", fontFamily: "arial, sans-serif" }}>
              {displayDesc}
            </div>
          </div>
        </div>
      </div>

      {metaHtml && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>Generated Meta Tags</span>
            <button
              type="button"
              onClick={handleCopyAll}
              className="text-sm px-3 py-1 rounded-md transition-colors duration-150"
              style={{
                color: copied ? "var(--color-success)" : "var(--color-link)",
                backgroundColor: "var(--color-canvas-soft-2)",
              }}
            >
              {copied ? "Copied" : "Copy All"}
            </button>
          </div>
          <pre
            className="p-4 rounded-lg text-sm overflow-x-auto max-h-64"
            style={{
              backgroundColor: "var(--color-canvas-soft-2)",
              color: "var(--color-ink)",
              fontFamily: "var(--font-mono)",
              lineHeight: "1.6",
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
            }}
          >
            {metaHtml}
          </pre>
        </div>
      )}
    </div>
  );
}

function escapeAttr(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
