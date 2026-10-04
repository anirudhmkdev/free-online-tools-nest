import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useCallback, useRef, useEffect } from "react";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";

/**
 * HashGenerator — compute MD5, SHA-1, SHA-256, SHA-512 hashes.
 * MD5 implemented inline; SHA variants use the Web Crypto API.
 */

/* ---------- MD5 implementation (RFC 1321) ---------- */
function md5(s: string): string {
  function md5cycle(x: number[], k: number[]) {
    let a = x[0], b = x[1], c = x[2], d = x[3];
    // FF
    a = ff(a, b, c, d, k[0], 7, -680876936);
    d = ff(d, a, b, c, k[1], 12, -389564586);
    c = ff(c, d, a, b, k[2], 17, 606105819);
    b = ff(b, c, d, a, k[3], 22, -1044525330);
    a = ff(a, b, c, d, k[4], 7, -176418897);
    d = ff(d, a, b, c, k[5], 12, 1200080426);
    c = ff(c, d, a, b, k[6], 17, -1473231341);
    b = ff(b, c, d, a, k[7], 22, -45705983);
    a = ff(a, b, c, d, k[8], 7, 1770035416);
    d = ff(d, a, b, c, k[9], 12, -1958414417);
    c = ff(c, d, a, b, k[10], 17, -42063);
    b = ff(b, c, d, a, k[11], 22, -1990404162);
    a = ff(a, b, c, d, k[12], 7, 1804603682);
    d = ff(d, a, b, c, k[13], 12, -40341101);
    c = ff(c, d, a, b, k[14], 17, -1502002290);
    b = ff(b, c, d, a, k[15], 22, 1236535329);
    // GG
    a = gg(a, b, c, d, k[1], 5, -165796510);
    d = gg(d, a, b, c, k[6], 9, -1069501632);
    c = gg(c, d, a, b, k[11], 14, 643717713);
    b = gg(b, c, d, a, k[0], 20, -373897302);
    a = gg(a, b, c, d, k[5], 5, -701558691);
    d = gg(d, a, b, c, k[10], 9, 38016083);
    c = gg(c, d, a, b, k[15], 14, -660478335);
    b = gg(b, c, d, a, k[4], 20, -405537848);
    a = gg(a, b, c, d, k[9], 5, 568446438);
    d = gg(d, a, b, c, k[14], 9, -1019803690);
    c = gg(c, d, a, b, k[3], 14, -187363961);
    b = gg(b, c, d, a, k[8], 20, 1163531501);
    a = gg(a, b, c, d, k[13], 5, -1444681467);
    d = gg(d, a, b, c, k[2], 9, -51403784);
    c = gg(c, d, a, b, k[7], 14, 1735328473);
    b = gg(b, c, d, a, k[12], 20, -1926607734);
    // HH
    a = hh(a, b, c, d, k[5], 4, -378558);
    d = hh(d, a, b, c, k[8], 11, -2022574463);
    c = hh(c, d, a, b, k[11], 16, 1839030562);
    b = hh(b, c, d, a, k[14], 23, -35309556);
    a = hh(a, b, c, d, k[1], 4, -1530992060);
    d = hh(d, a, b, c, k[4], 11, 1272893353);
    c = hh(c, d, a, b, k[7], 16, -155497632);
    b = hh(b, c, d, a, k[10], 23, -1094730640);
    a = hh(a, b, c, d, k[13], 4, 681279174);
    d = hh(d, a, b, c, k[0], 11, -358537222);
    c = hh(c, d, a, b, k[3], 16, -722521979);
    b = hh(b, c, d, a, k[6], 23, 76029189);
    a = hh(a, b, c, d, k[9], 4, -640364487);
    d = hh(d, a, b, c, k[12], 11, -421815835);
    c = hh(c, d, a, b, k[15], 16, 530742520);
    b = hh(b, c, d, a, k[2], 23, -995338651);
    // II
    a = ii(a, b, c, d, k[0], 6, -198630844);
    d = ii(d, a, b, c, k[7], 10, 1126891415);
    c = ii(c, d, a, b, k[14], 15, -1416354905);
    b = ii(b, c, d, a, k[5], 21, -57434055);
    a = ii(a, b, c, d, k[12], 6, 1700485571);
    d = ii(d, a, b, c, k[3], 10, -1894986606);
    c = ii(c, d, a, b, k[10], 15, -1051523);
    b = ii(b, c, d, a, k[1], 21, -2054922799);
    a = ii(a, b, c, d, k[8], 6, 1873313359);
    d = ii(d, a, b, c, k[15], 10, -30611744);
    c = ii(c, d, a, b, k[6], 15, -1560198380);
    b = ii(b, c, d, a, k[13], 21, 1309151649);
    a = ii(a, b, c, d, k[4], 6, -145523070);
    d = ii(d, a, b, c, k[11], 10, -1120210379);
    c = ii(c, d, a, b, k[2], 15, 718787259);
    b = ii(b, c, d, a, k[9], 21, -343485551);
    x[0] = add32(a, x[0]);
    x[1] = add32(b, x[1]);
    x[2] = add32(c, x[2]);
    x[3] = add32(d, x[3]);
  }

  function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    a = add32(add32(a, q), add32(x, t));
    return add32((a << s) | (a >>> (32 - s)), b);
  }
  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & c) | ((~b) & d), a, b, x, s, t);
  }
  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & d) | (c & (~d)), a, b, x, s, t);
  }
  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(c ^ (b | (~d)), a, b, x, s, t);
  }

  function add32(a: number, b: number) {
    return (a + b) & 0xffffffff;
  }

  function strToBytes(str: string): number[] {
    const bytes: number[] = [];
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      if (ch < 0x80) {
        bytes.push(ch);
      } else if (ch < 0x800) {
        bytes.push((ch >> 6) | 0xc0);
        bytes.push((ch & 0x3f) | 0x80);
      } else if (ch < 0xd800 || ch >= 0xe000) {
        bytes.push((ch >> 12) | 0xe0);
        bytes.push(((ch >> 6) & 0x3f) | 0x80);
        bytes.push((ch & 0x3f) | 0x80);
      } else {
        // Surrogate pair
        i++;
        const ch2 = str.charCodeAt(i);
        const cp = ((ch & 0x3ff) << 10) + (ch2 & 0x3ff) + 0x10000;
        bytes.push((cp >> 18) | 0xf0);
        bytes.push(((cp >> 12) & 0x3f) | 0x80);
        bytes.push(((cp >> 6) & 0x3f) | 0x80);
        bytes.push((cp & 0x3f) | 0x80);
      }
    }
    return bytes;
  }

  const bytes = strToBytes(s);
  const len = bytes.length;
  // Pad
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  // Append length in bits (64-bit, little-endian)
  const bitLen = len * 8;
  for (let i = 0; i < 8; i++) {
    bytes.push((bitLen >>> (i * 8)) & 0xff);
  }

  // Initialize state
  let h0 = 0x67452301, h1 = 0xefcdab89, h2 = 0x98badcfe, h3 = 0x10325476;

  // Process chunks
  for (let i = 0; i < bytes.length; i += 64) {
    const x: number[] = [];
    for (let j = 0; j < 16; j++) {
      x[j] = bytes[i + j * 4] | (bytes[i + j * 4 + 1] << 8) | (bytes[i + j * 4 + 2] << 16) | (bytes[i + j * 4 + 3] << 24);
    }
    const state = [h0, h1, h2, h3];
    md5cycle(state, x);
    h0 = state[0]; h1 = state[1]; h2 = state[2]; h3 = state[3];
  }

  function toHex(n: number): string {
    const hex = "0123456789abcdef";
    let s = "";
    for (let i = 0; i < 4; i++) {
      s += hex[(n >> (i * 8 + 4)) & 0xf] + hex[(n >> (i * 8)) & 0xf];
    }
    return s;
  }

  return toHex(h0) + toHex(h1) + toHex(h2) + toHex(h3);
}

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
