import { describe, expect, it } from "vitest";
import { parseSimpleYaml } from "./simple-yaml";
import { summarize } from "./text-summarizer";
import { checkGrammar } from "./grammar-checker";

describe("restricted YAML conversion without silent loss", () => {
  it("preserves lists and siblings", () => {
    expect(parseSimpleYaml("items:\n  - one\n  - two\nactive: true")).toEqual({ items: ["one", "two"], active: true });
  });
  it("supports nested mappings, root scalar lists, null and decimal numbers", () => {
    expect(parseSimpleYaml("user:\n  name: Ada\n  score: 1.5\nmissing:")).toEqual({user: {name: "Ada", score: 1.5}, missing: null});
    expect(parseSimpleYaml("- true\n- 42\n- null")).toEqual([true, 42, null]);
  });
  it("preserves quoted colons, hashes, URLs and escaped quotes", () => {
    expect(parseSimpleYaml('"a:b": "value # literal" # comment\nurl: https://example.com\nname: \'it\'\'s fine\'')).toEqual({"a:b": "value # literal", url: "https://example.com", name: "it's fine"});
  });
  it.each([
    "name: &person Ada\ncopy: *person", "x: [one, two]", "x: |\n  hello", "x: !!str 12",
    "items:\n  - name: Ada", "items:\n  -\n    - one", "x: 1\nx: 2", "x:\n   y: 2", "x:\n\ty: 2",
    "x: .inf", "x: 1e999", "x: 1e-999", "x: 9007199254740993", "x: 0xff", "x: 01", "x: 1_000",
    'x: "unclosed', "---\nx: 1", "x:\n    y: 2", "x: 1\n  y: 2", "x: 1\n- two", "", "# comment only"
  ])("rejects unsupported or ambiguous input: %s", input => expect(() => parseSimpleYaml(input)).toThrow());
  it("does not mutate prototypes and preserves special keys", () => {
    const parsed = parseSimpleYaml("__proto__:\n  polluted: true\nconstructor: safe");
    expect(JSON.stringify(parsed)).toBe('{"__proto__":{"polluted":true},"constructor":"safe"}');
    expect(Object.hasOwn({}, "polluted")).toBe(false);
  });
  it("enforces application size guards", () => {
    expect(() => parseSimpleYaml("a: " + "x".repeat(100001))).toThrow();
    expect(() => parseSimpleYaml("#\n".repeat(1001))).toThrow();
  });
});

describe("extractive sentence selection", () => {
  it("never expands duplicate sentences beyond the requested count", () => {
    expect(summarize("Cats sleep. Cats sleep. Cats sleep. Cats sleep.", 3)).toHaveLength(3);
  });
  it("returns original sentences in source order without inventing text", () => {
    expect(summarize("Cats sleep. Dogs bark. Cats purr.", 2).map(s => s.text)).toEqual(["Cats sleep.", "Cats purr."]);
    expect(summarize("One sentence.", 6).map(s => s.text)).toEqual(["One sentence."]);
  });
  it("handles empty, punctuation-only and unsupported input", () => {
    expect(summarize("", 3)).toEqual([]);
    expect(summarize("!!!...", 3)).toEqual([]);
    expect(() => summarize("यह हिंदी है।", 3)).toThrow(/English/);
    expect(() => summarize("Text.", 0)).toThrow();
    expect(() => summarize("x".repeat(100001), 3)).toThrow();
  });
});

describe("limited grammar suggestions", () => {
  it("detects repetition and known spelling mistakes", () => {
    expect(checkGrammar("This is is a draft.").issues.some(i => i.type === "Repeated Words")).toBe(true);
    expect(checkGrammar("Please recieve it tomorrow.").issues.some(i => i.suggestion.includes("receive"))).toBe(true);
  });
  it("does not treat valid contextual words as misspellings", () => {
    const issues = checkGrammar("The loose rope may affect eight people immediately. The book is theirs. Do not harass anyone.").issues;
    expect(issues.filter(i => i.type === "Misspellings")).toEqual([]);
  });
  it("documents that subject-verb agreement is outside its checks", () => {
    expect(checkGrammar("She go to school every day.").issues).toEqual([]);
    expect(checkGrammar("").issues).toEqual([]);
  });
});
