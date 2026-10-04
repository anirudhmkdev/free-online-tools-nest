import { useToolTelemetry } from "../../hooks/useToolTelemetry";
import { useState, useCallback } from "react";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";

/**
 * LoremIpsumGenerator — generate placeholder text by paragraphs, sentences, or words.
 */

const LOREM_WORDS = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum".split(" ");

function generateWords(count: number): string {
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(LOREM_WORDS[i % LOREM_WORDS.length]);
  }
  // Capitalize first word
  result[0] = result[0].charAt(0).toUpperCase() + result[0].slice(1);
  return result.join(" ") + ".";
}

function generateSentences(count: number): string {
  const sentences: string[] = [];
  for (let i = 0; i < count; i++) {
    const wordCount = 8 + Math.floor(Math.random() * 12);
    const offset = (i * 7) % LOREM_WORDS.length;
    const words: string[] = [];
    for (let j = 0; j < wordCount; j++) {
      words.push(LOREM_WORDS[(offset + j) % LOREM_WORDS.length]);
    }
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    sentences.push(words.join(" ") + ".");
  }
  return sentences.join(" ");
}

function generateParagraphs(count: number): string {
  const paragraphs: string[] = [];
  for (let i = 0; i < count; i++) {
    const sentenceCount = 3 + Math.floor(Math.random() * 4);
    paragraphs.push(generateSentences(sentenceCount));
  }
  return paragraphs.join("\n\n");
}

type Mode = "paragraphs" | "sentences" | "words";

export default function LoremIpsumGenerator() {
  const { markInteraction, recordSuccess } = useToolTelemetry();
  const [mode, setMode] = useState<Mode>("paragraphs");
  const [amount, setAmount] = useState(3);
  const [output, setOutput] = useState("");
  const [copied, handleCopy] = useCopyToClipboard();

  const generate = useCallback(() => {
    markInteraction();
    let result = "";
    switch (mode) {
      case "paragraphs":
        result = generateParagraphs(amount);
        break;
      case "sentences":
        result = generateSentences(amount);
        break;
      case "words":
        result = generateWords(amount);
        break;
    }
    setOutput(result);
    if (result.trim()) recordSuccess("generate");
  }, [mode, amount, markInteraction, recordSuccess]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        {/* Mode selector */}
        <div>
          <label htmlFor="lorem-mode" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            Generate
          </label>
          <select
            id="lorem-mode"
            value={mode}
            onChange={(e) => setMode(e.target.value as Mode)}
            className="h-10 px-3 border rounded-md text-sm outline-none"
            style={{
              backgroundColor: "var(--color-canvas)",
              borderColor: "var(--color-hairline)",
              color: "var(--color-ink)",
            }}
          >
            <option value="paragraphs">Paragraphs</option>
            <option value="sentences">Sentences</option>
            <option value="words">Words</option>
          </select>
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="lorem-amount" className="block text-sm font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            Amount
          </label>
          <input
            id="lorem-amount"
            type="number"
            min={1}
            max={100}
            value={amount}
            onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
            className="h-10 w-24 px-3 border rounded-md text-sm outline-none"
            style={{
              backgroundColor: "var(--color-canvas)",
              borderColor: "var(--color-hairline)",
              color: "var(--color-ink)",
            }}
          />
        </div>

        {/* Generate button */}
        <button
          type="button"
          onClick={generate}
          className="btn-primary btn-sm"
        >
          Generate
        </button>
      </div>

      {/* Output */}
      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>Output</span>
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
          <div
            className="p-4 rounded-lg text-sm whitespace-pre-wrap break-words max-h-96 overflow-y-auto"
            style={{
              backgroundColor: "var(--color-canvas-soft-2)",
              color: "var(--color-body)",
              lineHeight: "1.7",
            }}
          >
            {output}
          </div>
        </div>
      )}
    </div>
  );
}
