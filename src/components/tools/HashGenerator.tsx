import { md5 } from "../../helpers/quality-converters";
import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useCallback, useRef, useEffect } from "react";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";

/* ---------- SHA via Web Crypto API ---------- */
async function shaHash(algorithm: string, text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/* ---------- MD5 (synchronous, wrapped for consistent API) ---------- */
function md5Hash(text: string): string {
  return md5(text);
}

type Algorithm = "MD5" | "SHA-1" | "SHA-256" | "SHA-512";

const ALGORITHMS: { key: Algorithm; label: string }[] = [
  { key: "MD5", label: "MD5" },
  { key: "SHA-1", label: "SHA-1" },
  { key: "SHA-256", label: "SHA-256" },
  { key: "SHA-512", label: "SHA-512" },
];

export default function HashGenerator() {
  const { markInteraction, recordSuccess, clearInteraction } = useToolTelemetry();
  const operationRevision = useRef(0);
  const [input, setInput] = useState("");
  const [algorithm, setAlgorithm] = useState<Algorithm>("SHA-256");
  const [hash, setHash] = useState("");
  const [compareHash, setCompareHash] = useState("");
  const [showCompare, setShowCompare] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, handleCopy] = useCopyToClipboard();

  const handleGenerate = useCallback(async () => {
    markInteraction();
    const revision = ++operationRevision.current;
    if (!input.trim()) {
      setHash("");
      setError("");
      return;
    }
    setLoading(true);
    setError("");
    try {
      let result: string;
      if (algorithm === "MD5") {
        result = md5Hash(input);
      } else {
        result = await shaHash(algorithm, input);
      }
      if (revision !== operationRevision.current) return;
      setHash(result);
      if (/^[0-9a-f]+$/i.test(result)) recordSuccess("generate");
    } catch (err: unknown) {
      if (revision !== operationRevision.current) return;
      setError(err instanceof Error ? err.message : "Hash computation failed.");
      setHash("");
    } finally {
      if (revision === operationRevision.current) setLoading(false);
    }
  }, [input, algorithm, markInteraction, recordSuccess]);

  const matchResult = hash && showCompare && compareHash
    ? (hash === compareHash.trim().toLowerCase() ? "Match" : "No match")
    : null;

  useEffect(() => () => { operationRevision.current++; clearInteraction(); }, [clearInteraction]);

  return (
    <div className="space-y-6">
      {/* Input */}
      <div>
        <label htmlFor="hash-input" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
          Input Text
        </label>
        <textarea
          id="hash-input"
          value={input}
          onChange={(e) => { operationRevision.current++; clearInteraction(); setLoading(false); setInput(e.target.value); }}
          placeholder="Enter text to hash…"
          rows={5}
          className="w-full p-4 border rounded-lg text-base resize-y outline-none transition-colors duration-150"
          style={{
            backgroundColor: "var(--color-canvas-soft)",
            borderColor: "var(--color-hairline)",
            color: "var(--color-ink)",
            fontFamily: "var(--font-mono)",
          }}
          spellCheck={false}
        />
      </div>

      {/* Algorithm + Generate */}
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label htmlFor="hash-algo" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            Algorithm
          </label>
          <div className="flex flex-wrap rounded-lg border" style={{ borderColor: "var(--color-hairline)" }}>
            {ALGORITHMS.map((algo) => (
              <button
                key={algo.key}
                type="button"
                onClick={() => { operationRevision.current++; clearInteraction(); setLoading(false); setHash(""); setAlgorithm(algo.key); }}
                className="px-4 py-2 text-sm font-mono transition-colors duration-150 outline-none"
                style={{
                  backgroundColor: algorithm === algo.key ? "var(--color-primary)" : "var(--color-canvas)",
                  color: algorithm === algo.key ? "var(--color-on-primary)" : "var(--color-body)",
                }}
              >
                {algo.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading || !input.trim()}
          className="btn-primary btn-sm"
          style={{
            backgroundColor: loading ? "var(--color-mute)" : "var(--color-primary)",
            color: "var(--color-on-primary)",
            opacity: !input.trim() ? 0.5 : 1,
          }}
        >
          {loading ? "Computing…" : "Generate Hash"}
        </button>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: "var(--color-error)", color: "#fff" }} role="alert">
          {error}
        </div>
      )}

      {/* Hash result */}
      {hash && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>
              Hash ({algorithm})
            </span>
            <button
              type="button"
              onClick={() => handleCopy(hash)}
              className="text-sm px-3 py-1 rounded-md transition-colors duration-150"
              style={{
                color: copied ? "var(--color-success)" : "var(--color-link)",
                backgroundColor: "var(--color-canvas-soft-2)",
              }}
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <div
            className="p-4 rounded-lg text-sm break-all select-all"
            style={{
              backgroundColor: "var(--color-canvas-soft-2)",
              color: "var(--color-ink)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {hash}
          </div>

          {/* Compare section */}
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowCompare(!showCompare)}
              className="text-sm font-medium mb-2"
              style={{ color: "var(--color-link)" }}
            >
              {showCompare ? "Hide compare" : "Compare with another hash"}
            </button>

            {showCompare && (
              <div className="space-y-3">
                <input
                  type="text"
                  value={compareHash}
                  onChange={(e) => setCompareHash(e.target.value)}
                  placeholder="Paste another hash to compare…"
                  className="w-full h-10 px-3 border rounded-md text-sm font-mono outline-none"
                  style={{
                    backgroundColor: "var(--color-canvas-soft)",
                    borderColor: "var(--color-hairline)",
                    color: "var(--color-ink)",
                  }}
                  spellCheck={false}
                />
                {compareHash && matchResult && (
                  <div
                    className="px-4 py-2 rounded-lg text-sm font-semibold"
                    style={{
                      backgroundColor: matchResult === "Match" ? "var(--color-success)" : "var(--color-error)",
                      color: "#fff",
                    }}
                  >
                    {matchResult === "Match" ? "✓ Hashes match!" : "✗ Hashes do not match"}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
