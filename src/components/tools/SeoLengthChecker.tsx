import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useMemo, useEffect } from "react";

const FONT_SIZE_PX = 20;

function estimatePixelWidth(text: string): number {
  let width = 0;
  for (const char of text) {
    if (char >= "\u4e00" && char <= "\u9fff") width += FONT_SIZE_PX;
    else if (char >= "\u3040" && char <= "\u30ff") width += FONT_SIZE_PX;
    else if (char >= "\uac00" && char <= "\ud7af") width += FONT_SIZE_PX;
    else if (char >= "A" && char <= "Z") width += FONT_SIZE_PX * 0.7;
    else if (char >= "a" && char <= "z") width += FONT_SIZE_PX * 0.55;
    else if (char >= "0" && char <= "9") width += FONT_SIZE_PX * 0.55;
    else if (char === " ") width += FONT_SIZE_PX * 0.3;
    else if (char === "." || char === "," || char === "!" || char === "?") width += FONT_SIZE_PX * 0.3;
    else width += FONT_SIZE_PX * 0.55;
  }
  return Math.round(width);
}

function getTitleStatus(chars: number): { label: string; color: string } {
  if (chars === 0) return { label: "Empty", color: "var(--color-mute)" };
  if (chars < 30) return { label: "Below guide", color: "var(--color-warning, #d97706)" };
  if (chars <= 60) return { label: "Within guide", color: "var(--color-success, #22c55e)" };
  if (chars <= 70) return { label: "Warning", color: "var(--color-warning, #d97706)" };
  return { label: "Above guide", color: "var(--color-error)" };
}

function getDescStatus(chars: number): { label: string; color: string } {
  if (chars === 0) return { label: "Empty", color: "var(--color-mute)" };
  if (chars < 120) return { label: "Below guide", color: "var(--color-warning, #d97706)" };
  if (chars <= 160) return { label: "Within guide", color: "var(--color-success, #22c55e)" };
  if (chars <= 180) return { label: "Warning", color: "var(--color-warning, #d97706)" };
  return { label: "Above guide", color: "var(--color-error)" };
}

export default function SeoLengthChecker() {
  const { markInteraction, recordSuccess } = useToolTelemetry();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const titleChars = title.length;
  const descChars = description.length;
  const titlePx = useMemo(() => estimatePixelWidth(title), [title]);
  const descPx = useMemo(() => estimatePixelWidth(description), [description]);
  const titleStatus = useMemo(() => getTitleStatus(titleChars), [titleChars]);
  const descStatus = useMemo(() => getDescStatus(descChars), [descChars]);

  const googleSnippetTitle = useMemo(() => {
    if (!title) return "Search Result Title Preview";
    return title.length > 60 ? title.slice(0, 57) + "..." : title;
  }, [title]);

  const googleSnippetDesc = useMemo(() => {
    if (!description) return "Approximate description preview…";
    return description.length > 160 ? description.slice(0, 157) + "..." : description;
  }, [description]);

  useEffect(() => {
    if (title.trim() || description.trim()) recordSuccess("check");
  }, [title, description, recordSuccess]);

  return (
    <div onChangeCapture={markInteraction} className="space-y-6">
      <p className="text-sm">Character ranges are editing guides, not search-engine limits. Width is a rough character-based estimate, not a font measurement. Google may rewrite or truncate titles and snippets differently by query and device. A green indicator does not guarantee display or ranking.</p>
      {/* Title */}
      <div>
        <label htmlFor="slc-title" className="block text-sm font-medium mb-1" style={{ color: "var(--color-ink)" }}>
          Title Tag
        </label>
        <input
          id="slc-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter your page title..."
          className="w-full h-10 px-3 border rounded-lg text-sm outline-none"
          style={{ backgroundColor: "var(--color-canvas-soft)", borderColor: "var(--color-hairline)", color: "var(--color-ink)" }}
        />
        <div className="flex flex-wrap items-center gap-3 mt-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium" style={{ color: "var(--color-mute)" }}>Characters:</span>
            <span className="text-sm font-semibold" style={{ color: "var(--color-ink)" }}>{titleChars}</span>
            <span className="text-xs" style={{ color: "var(--color-mute)" }}>/ 50-60</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium" style={{ color: "var(--color-mute)" }}>Estimated width:</span>
            <span className="text-sm font-semibold" style={{ color: "var(--color-ink)" }}>{titlePx}px</span>
          </div>
          <span
            className="inline-block px-2 py-0.5 text-xs font-medium rounded-full"
            style={{ backgroundColor: titleStatus.color, color: "#fff" }}
          >
            {titleStatus.label}
          </span>
        </div>

        {/* Title progress bar */}
        <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-canvas-soft-2)" }}>
          <div
            className="h-full rounded-full transition-all duration-200"
            style={{
              width: `${Math.min((titleChars / 70) * 100, 100)}%`,
              backgroundColor: titleStatus.color,
            }}
          />
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span style={{ color: "var(--color-mute)" }}>0</span>
          <span style={{ color: titleChars >= 50 ? "var(--color-success, #22c55e)" : "var(--color-mute)" }}>50</span>
          <span style={{ color: titleChars > 60 ? "var(--color-error)" : "var(--color-success, #22c55e)" }}>60</span>
          <span style={{ color: titleChars > 70 ? "var(--color-error)" : "var(--color-mute)" }}>70</span>
        </div>
      </div>

      {/* Meta Description */}
      <div>
        <label htmlFor="slc-desc" className="block text-sm font-medium mb-1" style={{ color: "var(--color-ink)" }}>
          Meta Description
        </label>
        <textarea
          id="slc-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter your meta description..."
          rows={3}
          className="w-full p-3 border rounded-lg text-sm resize-y outline-none"
          style={{ backgroundColor: "var(--color-canvas-soft)", borderColor: "var(--color-hairline)", color: "var(--color-ink)" }}
        />
        <div className="flex flex-wrap items-center gap-3 mt-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium" style={{ color: "var(--color-mute)" }}>Characters:</span>
            <span className="text-sm font-semibold" style={{ color: "var(--color-ink)" }}>{descChars}</span>
            <span className="text-xs" style={{ color: "var(--color-mute)" }}>/ 150-160</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium" style={{ color: "var(--color-mute)" }}>Estimated width:</span>
            <span className="text-sm font-semibold" style={{ color: "var(--color-ink)" }}>{descPx}px</span>
          </div>
          <span
            className="inline-block px-2 py-0.5 text-xs font-medium rounded-full"
            style={{ backgroundColor: descStatus.color, color: "#fff" }}
          >
            {descStatus.label}
          </span>
        </div>

        {/* Description progress bar */}
        <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-canvas-soft-2)" }}>
          <div
            className="h-full rounded-full transition-all duration-200"
            style={{
              width: `${Math.min((descChars / 180) * 100, 100)}%`,
              backgroundColor: descStatus.color,
            }}
          />
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span style={{ color: "var(--color-mute)" }}>0</span>
          <span style={{ color: descChars >= 120 ? "var(--color-success, #22c55e)" : "var(--color-mute)" }}>120</span>
          <span style={{ color: descChars > 160 ? "var(--color-error)" : "var(--color-success, #22c55e)" }}>160</span>
          <span style={{ color: descChars > 180 ? "var(--color-error)" : "var(--color-mute)" }}>180</span>
        </div>
      </div>

      {/* Google-style snippet preview */}
      <div>
        <span className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>Search Result Snippet Preview</span>
        <div
          className="p-4 rounded-lg border"
          style={{ backgroundColor: "var(--color-canvas)", borderColor: "var(--color-hairline)" }}
        >
          <div className="text-xs" style={{ color: "var(--color-mute)" }}>https://example.com/page</div>
          <div className="text-lg font-medium leading-tight mt-1" style={{ color: "#1a0dab" }}>{googleSnippetTitle}</div>
          <div className="text-sm mt-1 leading-snug" style={{ color: "#545454" }}>{googleSnippetDesc}</div>
        </div>
      </div>
    </div>
  );
}
