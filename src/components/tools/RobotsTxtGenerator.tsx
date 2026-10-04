import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { isAbsoluteHttpUrl } from "../../helpers/tool-output-validity";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";

interface Rule {
  id: number;
  type: "allow" | "disallow";
  path: string;
}

interface SitemapRef {
  id: number;
  url: string;
}

let ruleId = 1;
let sitemapId = 1;

const USER_AGENTS = [
  "* (All robots)",
  "Googlebot",
  "Googlebot-Image",
  "Googlebot-News",
  "Googlebot-Video",
  "Bingbot",
  "Slurp (Yahoo!)",
  "DuckDuckBot",
  "Baiduspider",
  "YandexBot",
  "Sogou",
  "Custom",
];

function createRule(): Rule {
  return { id: ruleId++, type: "disallow", path: "" };
}

function createSitemap(): SitemapRef {
  return { id: sitemapId++, url: "" };
}

export default function RobotsTxtGenerator() {
  const { markInteraction, recordSuccess, clearInteraction } = useToolTelemetry();
  const [userAgent, setUserAgent] = useState("* (All robots)");
  const [customUserAgent, setCustomUserAgent] = useState("");
  const [rules, setRules] = useState<Rule[]>([createRule()]);
  const [sitemaps, setSitemaps] = useState<SitemapRef[]>([createSitemap()]);
  const [crawlDelay, setCrawlDelay] = useState("");
  const [copied, handleCopy] = useCopyToClipboard();
  const [preset, setPreset] = useState("");

  const applyPreset = useCallback((name: string) => {
    clearInteraction();
    setPreset(name);
    if (name === "standard") {
      setUserAgent("* (All robots)");
      setCustomUserAgent("");
      setRules([{ id: ruleId++, type: "allow", path: "/" }]);
      setCrawlDelay("");
    } else if (name === "strict") {
      setUserAgent("* (All robots)");
      setCustomUserAgent("");
      setRules([{ id: ruleId++, type: "disallow", path: "/" }]);
      setCrawlDelay("");
    }
  }, []);

  const addRule = useCallback(() => {
    setRules((prev) => [...prev, createRule()]);
  }, []);

  const removeRule = useCallback((id: number) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const updateRule = useCallback((id: number, field: "type" | "path", value: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  }, []);

  const addSitemap = useCallback(() => {
    setSitemaps((prev) => [...prev, createSitemap()]);
  }, []);

  const removeSitemap = useCallback((id: number) => {
    setSitemaps((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const updateSitemap = useCallback((id: number, url: string) => {
    setSitemaps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, url } : s))
    );
  }, []);

  const effectiveUserAgent = userAgent === "Custom" ? customUserAgent : userAgent.replace(/\s*\(.*\)/, "").trim();

  const robotsTxt = useMemo(() => {
    const lines: string[] = [];
    if (!effectiveUserAgent) {
      lines.push("# Configure the user-agent above to generate robots.txt");
      return lines.join("\n");
    }
    lines.push(`User-agent: ${effectiveUserAgent}`);
    const validRules = rules.filter((r) => r.path.trim().length > 0);
    if (validRules.length === 0) {
      lines.push("Disallow:");
    } else {
      for (const rule of validRules) {
        lines.push(`${rule.type === "allow" ? "Allow" : "Disallow"}: ${rule.path.trim()}`);
      }
    }
    if (crawlDelay.trim()) {
      const delay = parseFloat(crawlDelay);
      if (!isNaN(delay) && delay >= 0) {
        lines.push(`Crawl-Delay: ${delay}`);
      }
    }
    const validSitemaps = sitemaps.filter((s) => s.url.trim().length > 0);
    if (lines.length > 1 && validSitemaps.length > 0) {
      lines.push("");
    }
    for (const s of validSitemaps) {
      lines.push(`Sitemap: ${s.url.trim()}`);
    }
    return lines.join("\n");
  }, [effectiveUserAgent, rules, crawlDelay, sitemaps]);

  const handleGenerateCopy = useCallback(() => {
    if (robotsTxt) handleCopy(robotsTxt);
  }, [handleCopy, robotsTxt]);

  useEffect(() => {
    if (effectiveUserAgent.trim().length > 0 && (!crawlDelay.trim() || (Number.isFinite(Number(crawlDelay)) && Number(crawlDelay) >= 0)) && sitemaps.every(s => !s.url.trim() || isAbsoluteHttpUrl(s.url))) recordSuccess("generate");
  }, [robotsTxt, effectiveUserAgent, crawlDelay, sitemaps, recordSuccess]);

  return (
    <div onChangeCapture={markInteraction} className="space-y-6">
      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm self-center" style={{ color: "var(--color-mute)" }}>Presets:</span>
        {[
          { name: "Standard", value: "standard" },
          { name: "Strict", value: "strict" },
        ].map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => applyPreset(p.value)}
            className="px-3 py-1.5 text-sm rounded-md transition-colors"
            style={{
              backgroundColor: preset === p.value ? "var(--color-primary)" : "var(--color-canvas-soft-2)",
              color: preset === p.value ? "var(--color-on-primary)" : "var(--color-ink)",
            }}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* User-agent */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="rt-user-agent" className="block text-sm font-medium mb-1" style={{ color: "var(--color-ink)" }}>User-agent</label>
          <select
            id="rt-user-agent"
            value={userAgent}
            onChange={(e) => setUserAgent(e.target.value)}
            className="w-full h-10 px-3 border rounded-lg text-sm outline-none"
            style={{ backgroundColor: "var(--color-canvas-soft)", borderColor: "var(--color-hairline)", color: "var(--color-ink)" }}
          >
            {USER_AGENTS.map((ua) => (
              <option key={ua} value={ua}>{ua}</option>
            ))}
          </select>
        </div>
        {userAgent === "Custom" && (
          <div>
            <label htmlFor="rt-custom-ua" className="block text-sm font-medium mb-1" style={{ color: "var(--color-ink)" }}>Custom User-agent</label>
            <input
              id="rt-custom-ua"
              type="text"
              value={customUserAgent}
              onChange={(e) => setCustomUserAgent(e.target.value)}
              placeholder="MyCustomBot"
              className="w-full h-10 px-3 border rounded-lg text-sm outline-none"
              style={{ backgroundColor: "var(--color-canvas-soft)", borderColor: "var(--color-hairline)", color: "var(--color-ink)" }}
            />
          </div>
        )}
      </div>

      {/* Rules */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>Rules</span>
          <button
            type="button"
            onClick={addRule}
            className="text-sm px-3 py-1 rounded-md transition-colors"
            style={{ color: "var(--color-link)", backgroundColor: "var(--color-canvas-soft-2)" }}
          >
            + Add Rule
          </button>
        </div>
        <div className="space-y-2">
          {rules.map((rule, i) => (
            <div
              key={rule.id}
              className="flex items-center gap-2 p-3 rounded-lg border"
              style={{ borderColor: "var(--color-hairline)", backgroundColor: "var(--color-canvas)" }}
            >
              <span className="text-xs shrink-0" style={{ color: "var(--color-mute)", width: "20px" }}>{i + 1}</span>
              <select
                value={rule.type}
                onChange={(e) => updateRule(rule.id, "type", e.target.value)}
                className="h-9 px-2 border rounded-md text-sm outline-none shrink-0"
                style={{ backgroundColor: "var(--color-canvas-soft)", borderColor: "var(--color-hairline)", color: "var(--color-ink)" }}
              >
                <option value="allow">Allow</option>
                <option value="disallow">Disallow</option>
              </select>
              <input
                type="text"
                value={rule.path}
                onChange={(e) => updateRule(rule.id, "path", e.target.value)}
                placeholder="/path"
                className="flex-1 h-9 px-3 border rounded-md text-sm outline-none"
                style={{ backgroundColor: "var(--color-canvas-soft)", borderColor: "var(--color-hairline)", color: "var(--color-ink)" }}
              />
              {rules.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRule(rule.id)}
                  className="text-xs px-2 py-1 rounded shrink-0"
                  style={{ color: "var(--color-error)", backgroundColor: "var(--color-canvas-soft-2)" }}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Crawl Delay */}
      <div>
        <label htmlFor="rt-crawl" className="block text-sm font-medium mb-1" style={{ color: "var(--color-ink)" }}>Crawl Delay (seconds)</label>
        <input
          id="rt-crawl"
          type="number"
          min={0}
          step={1}
          value={crawlDelay}
          onChange={(e) => setCrawlDelay(e.target.value)}
          placeholder="e.g., 10"
          className="w-full sm:w-48 h-10 px-3 border rounded-lg text-sm outline-none"
          style={{ backgroundColor: "var(--color-canvas-soft)", borderColor: "var(--color-hairline)", color: "var(--color-ink)" }}
        />
      </div>

      {/* Sitemaps */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>Sitemap URLs</span>
          <button
            type="button"
            onClick={addSitemap}
            className="text-sm px-3 py-1 rounded-md transition-colors"
            style={{ color: "var(--color-link)", backgroundColor: "var(--color-canvas-soft-2)" }}
          >
            + Add Sitemap
          </button>
        </div>
        <div className="space-y-2">
          {sitemaps.map((s, i) => (
            <div
              key={s.id}
              className="flex items-center gap-2"
            >
              <input
                type="url"
                value={s.url}
                onChange={(e) => updateSitemap(s.id, e.target.value)}
                placeholder="https://example.com/sitemap.xml"
                className="flex-1 h-10 px-3 border rounded-lg text-sm outline-none"
                style={{ backgroundColor: "var(--color-canvas-soft)", borderColor: "var(--color-hairline)", color: "var(--color-ink)" }}
              />
              {sitemaps.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSitemap(s.id)}
                  className="text-xs px-2 py-1 rounded shrink-0"
                  style={{ color: "var(--color-error)", backgroundColor: "var(--color-canvas-soft-2)" }}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Output */}
      {robotsTxt && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>Generated robots.txt</span>
            <button
              type="button"
              onClick={handleGenerateCopy}
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
            {robotsTxt}
          </pre>
        </div>
      )}
    </div>
  );
}
