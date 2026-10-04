import { metadataUrlError } from "../../helpers/metadata-urls";
import ErrorBanner from "../ErrorBanner";
import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { isAbsoluteHttpUrl } from "../../helpers/tool-output-validity";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";

export default function MetaTagGenerator() {
  const { markInteraction, recordSuccess } = useToolTelemetry();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [pageType, setPageType] = useState("website");
  const [copied, handleCopy] = useCopyToClipboard();

  const urlError = metadataUrlError({"OG image":ogImage,"Canonical URL":canonicalUrl});
  const metaTags = useMemo(() => {
    if (urlError) return "";
    const lines: string[] = [];
    if (title) {
      lines.push(`<title>${escapeHtml(title)}</title>`);
      lines.push(`<meta name="title" content="${escapeHtml(title)}" />`);
    }
    if (description) {
      lines.push(`<meta name="description" content="${escapeHtml(description)}" />`);
    }
    if (keywords) {
      const kw = keywords.split(",").map((k) => k.trim()).filter(Boolean).join(", ");
      lines.push(`<meta name="keywords" content="${escapeHtml(kw)}" />`);
    }
    if (title) {
      lines.push(`<meta property="og:title" content="${escapeHtml(title)}" />`);
      lines.push(`<meta name="twitter:title" content="${escapeHtml(title)}" />`);
    }
    if (description) {
      lines.push(`<meta property="og:description" content="${escapeHtml(description)}" />`);
      lines.push(`<meta name="twitter:description" content="${escapeHtml(description)}" />`);
    }
    if (ogImage) {
      lines.push(`<meta property="og:image" content="${escapeHtml(ogImage)}" />`);
      lines.push(`<meta name="twitter:image" content="${escapeHtml(ogImage)}" />`);
    }
    lines.push(`<meta property="og:type" content="${escapeHtml(pageType)}" />`);
    if (canonicalUrl) {
      lines.push(`<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`);
      lines.push(`<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`);
    }
    lines.push(`<meta name="twitter:card" content="summary_large_image" />`);
    return lines.join("\n");
  }, [title, description, keywords, ogImage, canonicalUrl, pageType, urlError]);

  const googleTitle = useMemo(() => {
    if (!title) return "Page Title Will Appear Here";
    return title.length > 60 ? title.slice(0, 57) + "..." : title;
  }, [title]);

  const googleDesc = useMemo(() => {
    if (!description) return "Your meta description will appear here in search results…";
    return description.length > 160 ? description.slice(0, 157) + "..." : description;
  }, [description]);

  const ogPreviewTitle = useMemo(() => {
    if (!title) return "OG Title Preview";
    return title.length > 60 ? title.slice(0, 57) + "..." : title;
  }, [title]);

  const ogPreviewDesc = useMemo(() => {
    if (!description) return "Open Graph description preview";
    return description.length > 120 ? description.slice(0, 117) + "..." : description;
  }, [description]);

  const ogPreviewUrl = useMemo(() => {
    if (canonicalUrl) return canonicalUrl;
    return "example.com";
  }, [canonicalUrl]);

  const handleCopyAll = useCallback(() => {
    handleCopy(metaTags);
  }, [handleCopy, metaTags]);

  useEffect(() => {
    if ((title.trim() || description.trim() || keywords.trim() || ogImage.trim() || canonicalUrl.trim()) && (!ogImage || isAbsoluteHttpUrl(ogImage)) && (!canonicalUrl || isAbsoluteHttpUrl(canonicalUrl))) recordSuccess("generate");
  }, [metaTags, title, description, keywords, ogImage, canonicalUrl, recordSuccess]);

  return (
    <div onChangeCapture={markInteraction} className="space-y-6">
      <ErrorBanner message={urlError} />
      <p className="text-sm">Generated tags are drafts. Preview layouts are illustrative; they do not guarantee search or social display, indexing or rankings.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Inputs */}
        <div className="space-y-4">
          <div>
            <label htmlFor="mt-title" className="block text-sm font-medium mb-1" style={{ color: "var(--color-ink)" }}>Page Title</label>
            <input
              id="mt-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Awesome Page Title"
              className="w-full h-10 px-3 border rounded-lg text-sm outline-none"
              style={{ backgroundColor: "var(--color-canvas-soft)", borderColor: "var(--color-hairline)", color: "var(--color-ink)" }}
            />
          </div>
          <div>
            <label htmlFor="mt-desc" className="block text-sm font-medium mb-1" style={{ color: "var(--color-ink)" }}>Meta Description</label>
            <textarea
              id="mt-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description of your page..."
              rows={3}
              className="w-full p-3 border rounded-lg text-sm resize-y outline-none"
              style={{ backgroundColor: "var(--color-canvas-soft)", borderColor: "var(--color-hairline)", color: "var(--color-ink)" }}
            />
          </div>
          <div>
            <label htmlFor="mt-keywords" className="block text-sm font-medium mb-1" style={{ color: "var(--color-ink)" }}>Meta Keywords (comma separated)</label>
            <input
              id="mt-keywords"
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="seo, web, tools"
              className="w-full h-10 px-3 border rounded-lg text-sm outline-none"
              style={{ backgroundColor: "var(--color-canvas-soft)", borderColor: "var(--color-hairline)", color: "var(--color-ink)" }}
            />
          </div>
          <div>
            <label htmlFor="mt-og-image" className="block text-sm font-medium mb-1" style={{ color: "var(--color-ink)" }}>OG Image URL</label>
            <input
              id="mt-og-image"
              type="url"
              value={ogImage}
              onChange={(e) => setOgImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full h-10 px-3 border rounded-lg text-sm outline-none"
              style={{ backgroundColor: "var(--color-canvas-soft)", borderColor: "var(--color-hairline)", color: "var(--color-ink)" }}
            />
          </div>
          <div>
            <label htmlFor="mt-canonical" className="block text-sm font-medium mb-1" style={{ color: "var(--color-ink)" }}>Canonical URL</label>
            <input
              id="mt-canonical"
              type="url"
              value={canonicalUrl}
              onChange={(e) => setCanonicalUrl(e.target.value)}
              placeholder="https://example.com/page"
              className="w-full h-10 px-3 border rounded-lg text-sm outline-none"
              style={{ backgroundColor: "var(--color-canvas-soft)", borderColor: "var(--color-hairline)", color: "var(--color-ink)" }}
            />
          </div>
          <div>
            <label htmlFor="mt-type" className="block text-sm font-medium mb-1" style={{ color: "var(--color-ink)" }}>Page Type</label>
            <select
              id="mt-type"
              value={pageType}
              onChange={(e) => setPageType(e.target.value)}
              className="w-full h-10 px-3 border rounded-lg text-sm outline-none"
              style={{ backgroundColor: "var(--color-canvas-soft)", borderColor: "var(--color-hairline)", color: "var(--color-ink)" }}
            >
              <option value="website">Website</option>
              <option value="article">Article</option>
              <option value="product">Product</option>
              <option value="profile">Profile</option>
            </select>
          </div>
        </div>

        {/* Right: Previews */}
        <div className="space-y-4">
          <div>
            <span className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>Google Search Preview</span>
            <div className="p-3 rounded-lg border" style={{ backgroundColor: "var(--color-canvas)", borderColor: "var(--color-hairline)" }}>
              <div className="text-xs" style={{ color: "var(--color-mute)" }}>{ogPreviewUrl}</div>
              <div className="text-base font-medium leading-tight mt-1" style={{ color: "#1a0dab" }}>{googleTitle}</div>
              <div className="text-sm mt-1 leading-snug" style={{ color: "#545454" }}>{googleDesc}</div>
            </div>
          </div>
          <div>
            <span className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>Social Share Preview (OG)</span>
            <div className="rounded-lg overflow-hidden border" style={{ borderColor: "var(--color-hairline)" }}>
              {ogImage && (
                <div className="h-32 bg-cover bg-center" style={{ backgroundImage: `url(${ogImage})`, backgroundColor: "var(--color-canvas-soft-2)" }} />
              )}
              <div className="p-3" style={{ backgroundColor: "var(--color-canvas)" }}>
                <div className="text-xs uppercase tracking-wider" style={{ color: "var(--color-mute)" }}>{ogPreviewUrl}</div>
                <div className="text-sm font-semibold mt-1" style={{ color: "var(--color-ink)" }}>{ogPreviewTitle}</div>
                <div className="text-xs mt-1" style={{ color: "var(--color-mute)" }}>{ogPreviewDesc}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Output */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>Generated Meta Tags</span>
          <button
            type="button"
            onClick={handleCopyAll}
            disabled={!metaTags}
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
          {metaTags}
        </pre>
      </div>
    </div>
  );
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
