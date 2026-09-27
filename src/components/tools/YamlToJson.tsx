import { useState, useCallback } from "react";
import ErrorBanner from "../ErrorBanner";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";

import { parseSimpleYaml as parseYaml } from "../../helpers/simple-yaml";

export default function YamlToJson() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, handleCopy] = useCopyToClipboard();

  const convert = useCallback(() => {
    if (!input.trim()) {
      setOutput("");
      setError("");
      return;
    }
    try {
      const parsed = parseYaml(input);
      setOutput(JSON.stringify(parsed, null, 2));
      setError("");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Invalid YAML";
      setError(msg);
      setOutput("");
    }
  }, [input]);

  return (
    <div className="space-y-6">
      <p className="text-sm">A limited YAML subset: mappings, scalar lists, strings, finite numbers, booleans and null. Use two spaces per nesting level. Anchors, aliases, tags, flow collections, block strings and object items in lists are rejected. Maximum 100,000 characters, 1,000 lines and 32 nesting levels are application guardrails.</p>
      <div>
        <label htmlFor="yaml-input" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
          YAML Input
        </label>
        <textarea
          id="yaml-input"
          value={input}
          onChange={(e) => { setInput(e.target.value); setOutput(""); setError(""); }}
          placeholder={"key: value\nnested:\n  inner: hello\nitems:\n  - one\n  - two"}
          rows={8}
          className="w-full p-4 border rounded-lg text-sm resize-y outline-none transition-colors duration-150"
          style={{
            backgroundColor: "var(--color-canvas-soft)",
            borderColor: error ? "var(--color-error)" : "var(--color-hairline)",
            color: "var(--color-ink)",
            fontFamily: "var(--font-mono)",
          }}
          spellCheck={false}
        />
      </div>

      <ErrorBanner message={error} />

      <button
        type="button"
        onClick={convert}
        className="btn-primary btn-sm"
        style={{ backgroundColor: "var(--color-primary)", color: "var(--color-on-primary)" }}
      >
        Convert to JSON
      </button>

      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>JSON Output</span>
            <button
              type="button"
              onClick={() => handleCopy(output)}
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
            className="p-4 rounded-lg text-sm overflow-x-auto max-h-96"
            style={{
              backgroundColor: "var(--color-canvas-soft-2)",
              color: "var(--color-ink)",
              fontFamily: "var(--font-mono)",
              lineHeight: "1.6",
            }}
          >
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}
