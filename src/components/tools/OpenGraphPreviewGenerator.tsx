import { metadataUrlError } from "../../helpers/metadata-urls";
import ErrorBanner from "../ErrorBanner";
import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { isAbsoluteHttpUrl } from "../../helpers/tool-output-validity";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";

const OG_TYPES = [
  "website", "article", "product", "profile", "book", "music.song",
  "music.album", "video.movie", "video.episode",
];

const TWITTER_CARDS = [
  "summary",
  "summary_large_image",
  "app",
  "player",
];

export default function OpenGraphPreviewGenerator() {
  const { markInteraction, recordSuccess } = useToolTelemetry();
  const [ogTitle, setOgTitle] = useState("");
  const [ogDesc, setOgDesc] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [ogUrl, setOgUrl] = useState("");
  const [ogType, setOgType] = useState("website");
  const [ogSiteName, setOgSiteName] = useState("");
  const [twitterCard, setTwitterCard] = useState("summary_large_image");
  const [copied, handleCopy] = useCopyToClipboard();

  const urlError = metadataUrlError({"OG image":ogImage,"Page URL":ogUrl});
  const metaHtml = useMemo(() => {
    if (urlError) return "";
    const lines: string[] = [];
    if (ogTitle) {
      lines.push(`<meta property="og:title" content="${escapeAttr(ogTitle)}" />`);
      lines.push(`<meta name="twitter:title" content="${escapeAttr(ogTitle)}" />`);
    }
    if (ogDesc) {
      lines.push(`<meta property="og:description" content="${escapeAttr(ogDesc)}" />`);
      lines.push(`<meta name="twitter:description" content="${escapeAttr(ogDesc)}" />`);
    }
    if (ogImage) {
      lines.push(`<meta property="og:image" content="${escapeAttr(ogImage)}" />`);
      lines.push(`<meta name="twitter:image" content="${escapeAttr(ogImage)}" />`);
    }
    if (ogUrl) {
      lines.push(`<meta property="og:url" content="${escapeAttr(ogUrl)}" />`);
    }
    lines.push(`<meta property="og:type" content="${escapeAttr(ogType)}" />`);
    if (ogSiteName) {
      lines.push(`<meta property="og:site_name" content="${escapeAttr(ogSiteName)}" />`);
    }
    lines.push(`<meta name="twitter:card" content="${escapeAttr(twitterCard)}" />`);
    return lines.join("\n");
  }, [ogTitle, ogDesc, ogImage, ogUrl, ogType, ogSiteName, twitterCard, urlError]);

  const displayTitle = ogTitle || "Open Graph Title";
  const displayDesc = ogDesc || "Description will appear here…";
  const displaySiteName = ogSiteName || "example.com";
  const displayUrl = ogUrl || "https://example.com/page";
  const displayImage = metadataUrlError({Image:ogImage}) ? "" : ogImage;

  const handleCopyMeta = useCallback(() => {
    if (metaHtml) handleCopy(metaHtml);
  }, [handleCopy, metaHtml]);

  useEffect(() => {
    if ((ogTitle.trim() || ogDesc.trim() || ogImage.trim() || ogUrl.trim() || ogSiteName.trim()) && (!ogImage || isAbsoluteHttpUrl(ogImage)) && (!ogUrl || isAbsoluteHttpUrl(ogUrl))) recordSuccess("generate");
  }, [metaHtml, ogTitle, ogDesc, ogImage, ogUrl, ogSiteName, recordSuccess]);

  return (
    <div onChangeCapture={markInteraction} className="space-y-6">
      <ErrorBanner message={urlError} />
      <p className="text-sm">Generated tags are drafts. Preview layouts are illustrative; they do not guarantee search or social display, indexing or rankings.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label htmlFor="og-title" className="block text-sm font-medium mb-1" style={{ color: "var(--color-ink)" }}>OG Title</label>
            <input id="og-title" type="text" value={ogTitle} onChange={(e) => setOgTitle(e.target.value)} placeholder="Your Page Title" className="w-full h-10 px-3 border rounded-lg text-sm outline-none" style={{ backgroundColor: "var(--color-canvas-soft)", borderColor: "var(--color-hairline)", color: "var(--color-ink)" }} />
          </div>
          <div>
            <label htmlFor="og-desc" className="block text-sm font-medium mb-1" style={{ color: "var(--color-ink)" }}>OG Description</label>
            <textarea id="og-desc" value={ogDesc} onChange={(e) => setOgDesc(e.target.value)} placeholder="A brief description…" rows={2} className="w-full p-3 border rounded-lg text-sm resize-y outline-none" style={{ backgroundColor: "var(--color-canvas-soft)", borderColor: "var(--color-hairline)", color: "var(--color-ink)" }} />
          </div>
          <div>
            <label htmlFor="og-image" className="block text-sm font-medium mb-1" style={{ color: "var(--color-ink)" }}>OG Image URL</label>
            <input id="og-image" type="url" value={ogImage} onChange={(e) => setOgImage(e.target.value)} placeholder="https://example.com/image.jpg" className="w-full h-10 px-3 border rounded-lg text-sm outline-none" style={{ backgroundColor: "var(--color-canvas-soft)", borderColor: "var(--color-hairline)", color: "var(--color-ink)" }} />
          </div>
          <div>
            <label htmlFor="og-url" className="block text-sm font-medium mb-1" style={{ color: "var(--color-ink)" }}>OG URL</label>
            <input id="og-url" type="url" value={ogUrl} onChange={(e) => setOgUrl(e.target.value)} placeholder="https://example.com/page" className="w-full h-10 px-3 border rounded-lg text-sm outline-none" style={{ backgroundColor: "var(--color-canvas-soft)", borderColor: "var(--color-hairline)", color: "var(--color-ink)" }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="og-type" className="block text-sm font-medium mb-1" style={{ color: "var(--color-ink)" }}>OG Type</label>
              <select id="og-type" value={ogType} onChange={(e) => setOgType(e.target.value)} className="w-full h-10 px-3 border rounded-lg text-sm outline-none" style={{ backgroundColor: "var(--color-canvas-soft)", borderColor: "var(--color-hairline)", color: "var(--color-ink)" }}>
                {OG_TYPES.map((t) => (<option key={t} value={t}>{t}</option>))}
              </select>
            </div>
            <div>
              <label htmlFor="og-twitter" className="block text-sm font-medium mb-1" style={{ color: "var(--color-ink)" }}>Twitter Card</label>
              <select id="og-twitter" value={twitterCard} onChange={(e) => setTwitterCard(e.target.value)} className="w-full h-10 px-3 border rounded-lg text-sm outline-none" style={{ backgroundColor: "var(--color-canvas-soft)", borderColor: "var(--color-hairline)", color: "var(--color-ink)" }}>
                {TWITTER_CARDS.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="og-site" className="block text-sm font-medium mb-1" style={{ color: "var(--color-ink)" }}>OG Site Name</label>
            <input id="og-site" type="text" value={ogSiteName} onChange={(e) => setOgSiteName(e.target.value)} placeholder="My Website" className="w-full h-10 px-3 border rounded-lg text-sm outline-none" style={{ backgroundColor: "var(--color-canvas-soft)", borderColor: "var(--color-hairline)", color: "var(--color-ink)" }} />
          </div>
        </div>

        {/* Previews */}
        <div className="space-y-4">
          {/* Facebook preview */}
          <div>
            <span className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>Facebook Preview</span>
            <div className="rounded-lg overflow-hidden border" style={{ borderColor: "#1877f2", borderWidth: "2px" }}>
              {displayImage ? (
                <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(${displayImage})`, backgroundColor: "var(--color-canvas-soft-2)" }} />
              ) : (
                <div className="h-40 flex items-center justify-center" style={{ backgroundColor: "var(--color-canvas-soft-2)" }}>
                  <span className="text-sm" style={{ color: "var(--color-mute)" }}>No image</span>
                </div>
              )}
              <div className="p-3" style={{ backgroundColor: "var(--color-canvas)" }}>
                <div className="text-xs uppercase tracking-wider" style={{ color: "var(--color-mute)" }}>{displayUrl}</div>
                <div className="text-sm font-semibold mt-1 leading-snug" style={{ color: "#1d2129" }}>{displayTitle}</div>
                <div className="text-xs mt-1 leading-snug" style={{ color: "#606770" }}>{displayDesc}</div>
              </div>
            </div>
          </div>

          {/* X/Twitter preview */}
          <div>
            <span className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>X / Twitter Preview</span>
            <div className="rounded-lg overflow-hidden border" style={{ borderColor: "var(--color-hairline)", backgroundColor: "#fff" }}>
              {displayImage ? (
                <div className="h-36 bg-cover bg-center" style={{ backgroundImage: `url(${displayImage})`, backgroundColor: "#f0f0f0" }} />
              ) : (
                <div className="h-36 flex items-center justify-center" style={{ backgroundColor: "#f0f0f0" }}>
                  <span className="text-sm" style={{ color: "#888" }}>No image</span>
                </div>
              )}
              <div className="p-3">
                <div className="text-xs" style={{ color: "#71767b" }}>{displaySiteName}</div>
                <div className="text-sm font-semibold mt-1 leading-snug" style={{ color: "#0f1419" }}>{displayTitle}</div>
                <div className="text-xs mt-1 leading-snug" style={{ color: "#71767b" }}>{displayDesc}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Output */}
      {metaHtml && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>Generated Meta Tags</span>
            <button
              type="button"
              onClick={handleCopyMeta}
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
            className="p-4 rounded-lg text-sm overflow-x-auto max-h-48"
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
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
