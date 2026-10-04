import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";

/**
 * SlugGenerator — convert text to URL-friendly slugs.
 * Provides real-time preview and batch generation with configurable options.
 */

function removeDiacritics(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function generateSlug(
  text: string,
  options: { removeSpecial: boolean; replaceSpace: boolean; removeDiacriticsEnabled: boolean },
  charLimit: number
): string {
  let slug = text.trim();

  if (!slug) return "";

  // Remove diacritics first
  if (options.removeDiacriticsEnabled) {
    slug = removeDiacritics(slug);
  }

  // Always lowercase
  slug = slug.toLowerCase();

  // Replace spaces with dashes
  if (options.replaceSpace) {
    slug = slug.replace(/\s+/g, "-");
  } else {
    slug = slug.replace(/\s+/g, "-"); // Always replace spaces for valid slugs
  }

  // Remove special characters
  if (options.removeSpecial) {
    slug = slug.replace(/[^a-z0-9\-]/g, "");
  } else {
    // Keep only safe characters
    slug = slug.replace(/[^a-z0-9\-_~]/g, "");
  }

  // Collapse multiple dashes
  slug = slug.replace(/-+/g, "-");
  // Remove leading/trailing dashes
  slug = slug.replace(/^-+|-+$/g, "");

  // Apply character limit
  if (charLimit > 0 && slug.length > charLimit) {
    slug = slug.slice(0, charLimit);
    // Remove trailing dash if we cut mid-word
    slug = slug.replace(/-+$/g, "");
  }

  return slug;
}

export default function SlugGenerator() {
  const { markInteraction, recordSuccess } = useToolTelemetry();
  const [input, setInput] = useState("");
  const [charLimit, setCharLimit] = useState(0);
  const [removeSpecial, setRemoveSpecial] = useState(true);
  const [removeDiacriticsEnabled, setRemoveDiacriticsEnabled] = useState(true);
  const [copied, handleCopy] = useCopyToClipboard();

  const options = useMemo(
    () => ({ removeSpecial, replaceSpace: true, removeDiacriticsEnabled }),
    [removeSpecial, removeDiacriticsEnabled]
  );

  // Real-time preview
  const liveSlug = useMemo(
    () => generateSlug(input, options, charLimit),
    [input, options, charLimit]
  );

  const originalWords = useMemo(() => {
    if (!input.trim()) return 0;
    return input.trim().split(/\s+/).filter(Boolean).length;
  }, [input]);

  const slugWords = useMemo(() => {
    if (!liveSlug) return 0;
    return liveSlug.split("-").filter(Boolean).length;
  }, [liveSlug]);

  useEffect(() => {
    if (liveSlug.length > 0) recordSuccess("generate");
  }, [liveSlug, recordSuccess]);

  return (
    <div onChangeCapture={markInteraction} className="space-y-6">
      {/* Input */}
      <div>
        <label htmlFor="slug-input" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
          Enter text to convert to a slug
        </label>
        <textarea
          id="slug-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or paste text here…"
          rows={3}
          className="w-full p-4 border rounded-lg text-base resize-y outline-none transition-colors duration-150"
          style={{
            backgroundColor: "var(--color-canvas-soft)",
            borderColor: "var(--color-hairline)",
            color: "var(--color-ink)",
          }}
        />
      </div>

      {/* Options */}
      <div className="flex flex-wrap gap-4 p-3 rounded-lg border" style={{ borderColor: "var(--color-hairline)", backgroundColor: "var(--color-canvas)" }}>
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none" style={{ color: "var(--color-ink)" }}>
          <input
            type="checkbox"
            checked={removeSpecial}
            onChange={(e) => setRemoveSpecial(e.target.checked)}
            className="rounded"
            style={{ accentColor: "var(--color-primary)" }}
          />
          Remove special characters
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none" style={{ color: "var(--color-ink)" }}>
          <input
            type="checkbox"
            checked={removeDiacriticsEnabled}
            onChange={(e) => setRemoveDiacriticsEnabled(e.target.checked)}
            className="rounded"
            style={{ accentColor: "var(--color-primary)" }}
          />
          Remove diacritics (é → e)
        </label>
        <div className="flex items-center gap-2">
          <label htmlFor="slug-limit" className="text-sm" style={{ color: "var(--color-ink)" }}>
            Character limit:
          </label>
          <input
            id="slug-limit"
            type="number"
            min={0}
            max={500}
            value={charLimit}
            onChange={(e) => setCharLimit(Math.max(0, parseInt(e.target.value) || 0))}
            placeholder="No limit"
            className="h-8 w-20 px-2 border rounded-md text-sm outline-none"
            style={{
              backgroundColor: "var(--color-canvas-soft)",
              borderColor: "var(--color-hairline)",
              color: "var(--color-ink)",
            }}
          />
          <span className="text-xs" style={{ color: "var(--color-mute)" }}>0 = no limit</span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-4 text-sm">
        <span style={{ color: "var(--color-ink)" }}>
          Original: <strong>{input.length}</strong> chars, <strong>{originalWords}</strong> words
        </span>
        {liveSlug && (
          <span style={{ color: "var(--color-ink)" }}>
            Slug: <strong>{liveSlug.length}</strong> chars, <strong>{slugWords}</strong> words
          </span>
        )}
      </div>

      {/* Live slug preview */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>
            Generated Slug
          </span>
          {liveSlug && (
            <button
              type="button"
              onClick={() => handleCopy(liveSlug)}
              className="text-sm px-3 py-1 rounded-md transition-colors duration-150"
              style={{
                color: copied ? "var(--color-success)" : "var(--color-link)",
                backgroundColor: "var(--color-canvas-soft-2)",
              }}
            >
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>
        <input
          type="text"
          value={liveSlug}
          readOnly
          placeholder="Slug will appear here…"
          className="w-full h-12 px-4 border rounded-lg text-sm outline-none select-all"
          style={{
            backgroundColor: liveSlug ? "var(--color-canvas-soft-2)" : "var(--color-canvas-soft)",
            borderColor: "var(--color-hairline)",
            color: "var(--color-ink)",
            fontFamily: "var(--font-mono)",
          }}
        />
      </div>
    </div>
  );
}
