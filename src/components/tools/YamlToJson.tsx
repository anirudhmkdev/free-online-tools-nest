import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useCallback } from "react";
import ErrorBanner from "../ErrorBanner";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";

type YamlValue = string | number | boolean | null | YamlValue[] | { [key: string]: YamlValue };

function parseYamlLine(line: string): { indent: number; key: string; value: string | null } {
  const trimmed = line.trimEnd();
  const indent = trimmed.length - trimmed.trimStart().length;
  const stripped = trimmed.trimStart();
  const colonIdx = stripped.indexOf(":");
  if (colonIdx === -1) {
    throw new Error(`Invalid YAML: no colon in "${stripped}"`);
  }
  const key = stripped.slice(0, colonIdx).trim();
  const valuePart = stripped.slice(colonIdx + 1).trim();
  const value = valuePart === "" ? null : valuePart;
  return { indent, key, value };
}

function parseYaml(input: string): Record<string, YamlValue> {
  const lines = input.split("\n").filter((l) => l.trim() !== "" && !l.trim().startsWith("#"));
  if (lines.length === 0) return {};

  const root: Record<string, YamlValue> = {};
  const stack: { indent: number; obj: Record<string, YamlValue> }[] = [];
  let currentArray: YamlValue[] | null = null;
  let currentArrayIndent = -1;

  for (const rawLine of lines) {
    const trimmed = rawLine.trimStart();

    if (trimmed.startsWith("- ")) {
      const itemIndent = rawLine.length - rawLine.trimStart().length;
      const value = trimmed.slice(2).trim();

      while (stack.length > 0 && stack[stack.length - 1].indent >= itemIndent) {
        stack.pop();
      }

      if (currentArray === null || itemIndent <= currentArrayIndent) {
        currentArray = [];
        currentArrayIndent = itemIndent;
        if (stack.length === 0) {
          throw new Error("Top-level arrays not supported at root");
        }
        const parent = stack[stack.length - 1].obj;
        const lastKey = Object.keys(parent).length > 0
          ? Object.keys(parent).filter((k) => parent[k] === null).pop()
          : null;
        if (lastKey) {
          parent[lastKey] = currentArray;
        }
      }

      if (value === "") {
        currentArray.push({} as Record<string, YamlValue>);
      } else {
        currentArray.push(parseScalar(value));
      }
      continue;
    }

    const { indent, key, value } = parseYamlLine(rawLine);

    while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }

    const target = stack.length === 0 ? root : stack[stack.length - 1].obj;

    if (value === null) {
      target[key] = null;
      const newObj: Record<string, YamlValue> = {};
      target[key] = newObj;
      stack.push({ indent, obj: newObj });
    } else {
      target[key] = parseScalar(value);
    }

    currentArray = null;
  }

  return root;
}

function parseScalar(value: string): string | number | boolean | null {
  if (value === "null" || value === "~") return null;
  if (value === "true") return true;
  if (value === "false") return false;
  const num = Number(value);
  if (!isNaN(num) && value.trim() !== "") return num;
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

export default function YamlToJson() {
  const { markInteraction, recordSuccess } = useToolTelemetry();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, handleCopy] = useCopyToClipboard();

  const convert = useCallback(() => {
    markInteraction();
    if (!input.trim()) {
      setOutput("");
      setError("");
      return;
    }
    try {
      const parsed = parseYaml(input);
      setOutput(JSON.stringify(parsed, null, 2));
      setError("");
      recordSuccess("convert");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Invalid YAML";
      setError(msg);
      setOutput("");
    }
  }, [input]);

  return (
    <div onChangeCapture={markInteraction} className="space-y-6">
      <div>
        <label htmlFor="yaml-input" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
          YAML Input
        </label>
        <textarea
          id="yaml-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
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
