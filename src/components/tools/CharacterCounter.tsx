import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useEffect } from "react";

/**
 * CharacterCounter — count characters with/without spaces, track social media limits.
 */
export default function CharacterCounter() {
  const { markInteraction, recordSuccess, clearInteraction } = useToolTelemetry();
  const [text, setText] = useState("");

  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, "").length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  const limits = [
    { name: "Twitter/X", max: 280 },
    { name: "Meta description", max: 160 },
    { name: "SMS", max: 160 },
    { name: "Instagram bio", max: 150 },
  ];

  useEffect(() => {
    if (text.trim()) recordSuccess("analyze");
  }, [text, recordSuccess]);

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="cc-input" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
          Enter your text
        </label>
        <textarea
          id="cc-input"
          value={text}
          onChange={(e) => { markInteraction(); setText(e.target.value); }}
          placeholder="Type or paste your text here…"
          rows={6}
          className="w-full p-4 border rounded-lg text-base resize-y outline-none transition-colors duration-150"
          style={{
            backgroundColor: "var(--color-canvas-soft)",
            borderColor: "var(--color-hairline)",
            color: "var(--color-ink)",
            fontFamily: "var(--font-sans)",
          }}
          spellCheck={false}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Characters", value: chars },
          { label: "No spaces", value: charsNoSpaces },
          { label: "Words", value: words },
        ].map((item) => (
          <div
            key={item.label}
            className="p-3 rounded-lg text-center"
            style={{ backgroundColor: "var(--color-canvas-soft-2)" }}
          >
            <div className="text-2xl font-semibold" style={{ color: "var(--color-ink)", letterSpacing: "-0.96px" }}>
              {item.value}
            </div>
            <div className="text-xs mt-1" style={{ color: "var(--color-mute)" }}>
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {/* Social media limits */}
      <div>
        <h3 className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "var(--color-mute)", fontFamily: "var(--font-mono)" }}>
          Character limits
        </h3>
        <div className="space-y-2">
          {limits.map((limit) => {
            const pct = Math.min((chars / limit.max) * 100, 100);
            const over = chars > limit.max;
            return (
              <div key={limit.name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span style={{ color: "var(--color-body)" }}>{limit.name}</span>
                  <span style={{ color: over ? "var(--color-error)" : "var(--color-mute)" }}>
                    {chars}/{limit.max}
                  </span>
                </div>
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ backgroundColor: "var(--color-canvas-soft-2)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-200"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: over ? "var(--color-error)" : "var(--color-link)",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={() => { clearInteraction(); setText(""); }}
        className="btn-secondary btn-sm"
        style={{ borderColor: "var(--color-hairline)", color: "var(--color-ink)", backgroundColor: "var(--color-canvas)" }}
      >
        Clear
      </button>
    </div>
  );
}
