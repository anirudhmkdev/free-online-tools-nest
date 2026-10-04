import { metadataUrlError } from "../../helpers/metadata-urls";
import ErrorBanner from "../ErrorBanner";
import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";

interface HreflangEntry {
  id: number;
  lang: string;
  href: string;
}

let hfId = 1;

function createHreflang(): HreflangEntry {
  return { id: hfId++, lang: "en", href: "" };
}

const LANGUAGE_OPTIONS = [
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "it", label: "Italian" },
  { code: "pt", label: "Portuguese" },
  { code: "ru", label: "Russian" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "zh", label: "Chinese" },
  { code: "ar", label: "Arabic" },
  { code: "hi", label: "Hindi" },
  { code: "nl", label: "Dutch" },
  { code: "pl", label: "Polish" },
  { code: "tr", label: "Turkish" },
  { code: "sv", label: "Swedish" },
  { code: "da", label: "Danish" },
  { code: "fi", label: "Finnish" },
  { code: "nb", label: "Norwegian" },
  { code: "cs", label: "Czech" },
  { code: "x-default", label: "x-default (fallback)" },
];

export default function CanonicalTagGenerator() {
  const { markInteraction, recordSuccess } = useToolTelemetry();
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [hreflangs, setHreflangs] = useState<HreflangEntry[]>([]);
  const [copied, handleCopy] = useCopyToClipboard();

  const addHreflang = useCallback(() => {
    setHreflangs((prev) => [...prev, createHreflang()]);
  }, []);

  const removeHreflang = useCallback((id: number) => {
    setHreflangs((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const updateHreflang = useCallback((id: number, field: "lang" | "href", value: string) => {
    if (field === "href") markInteraction();
    setHreflangs((prev) =>
      prev.map((h) => (h.id === id ? { ...h, [field]: value } : h))
    );
  }, [markInteraction]);

  const urlError = metadataUrlError({"Canonical URL":canonicalUrl,...Object.fromEntries(hreflangs.map((row,i)=>[`Alternate URL ${i+1}`,row.href]))}) || (new Set(hreflangs.filter(row=>row.href.trim()).map(row=>row.lang)).size !== hreflangs.filter(row=>row.href.trim()).length ? "Use one URL per language label." : "");
  const generatedTags = useMemo(() => {
    if (urlError) return "";
    const lines: string[] = [];
    if (canonicalUrl.trim()) {
      lines.push(`<link rel="canonical" href="${escapeAttr(canonicalUrl.trim())}" />`);
    }
    for (const hf of hreflangs) {
      if (hf.lang && hf.href.trim()) {
        lines.push(`<link rel="alternate" hreflang="${escapeAttr(hf.lang)}" href="${escapeAttr(hf.href.trim())}" />`);
      }
    }
    return lines.join("\n");
  }, [canonicalUrl, hreflangs, urlError]);

  const handleCopyTags = useCallback(() => {
    if (generatedTags) handleCopy(generatedTags);
  }, [handleCopy, generatedTags]);

  const hasContent = canonicalUrl.trim().length > 0 || hreflangs.some((h) => h.href.trim().length > 0);

  useEffect(() => {
    const urls = [canonicalUrl.trim(), ...hreflangs.filter(row => row.lang).map(row => row.href.trim())].filter(Boolean);
    if (!generatedTags || !urls.length || urlError) return;
    try {
      if (urls.every(value => ["http:", "https:"].includes(new URL(value).protocol))) recordSuccess("generate");
    } catch { /* incomplete URLs do not produce a successful result */ }
  }, [canonicalUrl, hreflangs, generatedTags, recordSuccess, urlError]);

  return (
    <div className="space-y-6">
      <ErrorBanner message={urlError} />
      <p className="text-sm">Generated tags are drafts. Preview layouts are illustrative; they do not guarantee search or social display, indexing or rankings.</p>
      {/* Info box */}
      <div
        className="p-4 rounded-lg text-sm leading-relaxed"
        style={{ backgroundColor: "var(--color-canvas-soft)", border: "1px solid var(--color-hairline)" }}
      >
        <strong style={{ color: "var(--color-ink)" }}>What is a canonical tag?</strong>
        <span style={{ color: "var(--color-body)" }}>
          {" "}A canonical tag (<code style={{ fontFamily: "var(--font-mono)" }}>&lt;link rel="canonical"&gt;</code>) tells search engines
          which URL is the master copy of a page. This helps prevent duplicate content issues when multiple URLs serve the
          same content. Use hreflang tags to indicate language/regional variations of the same page.
        </span>
      </div>

      <div>
        <label htmlFor="ct-canonical" className="block text-sm font-medium mb-1" style={{ color: "var(--color-ink)" }}>
          Canonical URL
        </label>
        <input
          id="ct-canonical"
          type="url"
          value={canonicalUrl}
          onChange={(e) => { markInteraction(); setCanonicalUrl(e.target.value); }}
          placeholder="https://example.com/your-page"
          className="w-full h-10 px-3 border rounded-lg text-sm outline-none"
          style={{ backgroundColor: "var(--color-canvas-soft)", borderColor: "var(--color-hairline)", color: "var(--color-ink)" }}
        />
      </div>

      {/* Hreflang tags */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>
            Hreflang Tags <span className="text-xs" style={{ color: "var(--color-mute)" }}>(optional)</span>
          </span>
          <button
            type="button"
            onClick={addHreflang}
            className="text-sm px-3 py-1 rounded-md transition-colors"
            style={{ color: "var(--color-link)", backgroundColor: "var(--color-canvas-soft-2)" }}
          >
            + Add Language
          </button>
        </div>
        {hreflangs.length === 0 && (
          <div className="text-sm py-2" style={{ color: "var(--color-mute)" }}>
            No hreflang tags added yet. Click "Add Language" to specify language-specific URLs.
          </div>
        )}
        <div className="space-y-2">
          {hreflangs.map((hf) => (
            <div
              key={hf.id}
              className="flex items-center gap-2"
            >
              <select
                value={hf.lang}
                onChange={(e) => updateHreflang(hf.id, "lang", e.target.value)}
                className="h-10 px-2 border rounded-lg text-sm outline-none"
                style={{ backgroundColor: "var(--color-canvas-soft)", borderColor: "var(--color-hairline)", color: "var(--color-ink)" }}
              >
                {LANGUAGE_OPTIONS.map((opt) => (
                  <option key={opt.code} value={opt.code}>{opt.label}</option>
                ))}
              </select>
              <input
                type="url"
                value={hf.href}
                onChange={(e) => updateHreflang(hf.id, "href", e.target.value)}
                placeholder="https://example.com/lang-page"
                className="flex-1 h-10 px-3 border rounded-lg text-sm outline-none"
                style={{ backgroundColor: "var(--color-canvas-soft)", borderColor: "var(--color-hairline)", color: "var(--color-ink)" }}
              />
              <button
                type="button"
                onClick={() => removeHreflang(hf.id)}
                className="text-xs px-2 py-1 rounded shrink-0"
                style={{ color: "var(--color-error)", backgroundColor: "var(--color-canvas-soft-2)" }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Output */}
      {hasContent && !urlError && generatedTags && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>Generated Tag{generatedTags.includes("\n") ? "s" : ""}</span>
            <button
              type="button"
              onClick={handleCopyTags}
              className="text-sm px-3 py-1 rounded-md transition-colors duration-150"
              style={{
                color: copied ? "var(--color-success)" : "var(--color-link)",
                backgroundColor: "var(--color-canvas-soft-2)",
              }}
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          {/* Visual preview */}
          <div
            className="p-3 rounded-lg mb-3 text-sm"
            style={{ backgroundColor: "var(--color-canvas)", border: "1px solid var(--color-hairline)" }}
          >
            <span style={{ color: "var(--color-mute)" }}>{`<!-- These tags should be placed in the <head> section -->`}</span>
          </div>

          <pre
            className="p-4 rounded-lg text-sm overflow-x-auto"
            style={{
              backgroundColor: "var(--color-canvas-soft-2)",
              color: "var(--color-ink)",
              fontFamily: "var(--font-mono)",
              lineHeight: "1.6",
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
            }}
          >
            {generatedTags}
          </pre>
        </div>
      )}
    </div>
  );
}

function escapeAttr(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
