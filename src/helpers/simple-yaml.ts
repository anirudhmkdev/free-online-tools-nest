/** Intentionally restricted YAML subset. Reject unsupported syntax rather than guess. */
export type YamlValue = string | number | boolean | null | YamlValue[] | { [key: string]: YamlValue };

function stripComment(value: string): string {
  let quote = "";
  for (let i = 0; i < value.length; i++) {
    const char = value[i];
    if (quote === '"' && char === "\\") { i++; continue; }
    if (quote === "'" && char === "'" && value[i + 1] === "'") { i++; continue; }
    if (quote) { if (char === quote) quote = ""; }
    else if (char === '"' || char === "'") quote = char;
    else if (char === "#" && (i === 0 || /\s/.test(value[i - 1]))) return value.slice(0, i).trimEnd();
  }
  if (quote) throw new Error("Unclosed quoted string; multi-line strings are unsupported.");
  return value.trimEnd();
}

function scalar(text: string): YamlValue {
  if (!text) return null;
  if (text.startsWith('"')) {
    try {
      const parsed: unknown = JSON.parse(text);
      if (typeof parsed !== "string") throw new Error();
      return parsed;
    } catch { throw new Error("Double-quoted strings must use JSON-compatible escapes."); }
  }
  if (text.startsWith("'")) {
    if (!/^'(?:[^']|'')*'$/.test(text)) throw new Error("Invalid single-quoted string.");
    return text.slice(1, -1).replaceAll("''", "'");
  }
  if (/^[&*!|>\[\]{}%@`?,]|^[-?:](?:\s|$)|:\s|\s[&*!]/.test(text)) {
    throw new Error("Unsupported YAML syntax. Anchors, aliases, tags, flow collections and block strings are not supported.");
  }
  if (/^(?:null|~)$/i.test(text)) return null;
  if (/^(?:true|false)$/i.test(text)) return text.toLowerCase() === "true";
  if (/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(text)) {
    if (/^[+-]?0\d/.test(text)) throw new Error("Quote numbers with leading zeros to preserve them as strings.");
    const number = Number(text);
    if (!Number.isFinite(number) || (Number.isInteger(number) && !Number.isSafeInteger(number))) throw new Error("Number cannot be represented safely in JSON; quote it to preserve its text.");
    if (number === 0 && /[1-9]/.test(text.split(/[eE]/)[0])) throw new Error("Number is too small to represent; quote it to preserve its text.");
    return number;
  }
  if (/^[+-]?\.(?:inf|nan)$/i.test(text) || /^[+-]?0[xob][\da-f_]+$/i.test(text) || /^\d[\d_]*_\d/.test(text)) throw new Error("Unsupported numeric notation; use a finite decimal number or quote the value.");
  return text;
}

function mapping(text: string): [string, string] {
  let quote = "";
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quote === '"' && char === "\\") { i++; continue; }
    if (quote === "'" && char === "'" && text[i + 1] === "'") { i++; continue; }
    if (quote) { if (char === quote) quote = ""; continue; }
    if (char === '"' || char === "'") { quote = char; continue; }
    if (char !== ":" || (i + 1 < text.length && !/\s/.test(text[i + 1]))) continue;
    const rawKey = text.slice(0, i).trim();
    if (!rawKey || rawKey === "<<") throw new Error("Empty keys and merge keys are unsupported.");
    const key = scalar(rawKey);
    if (typeof key !== "string") throw new Error("Mapping keys must be strings; quote numeric or boolean keys.");
    return [key, text.slice(i + 1).trim()];
  }
  throw new Error("Expected a string key followed by a colon and space.");
}

export function parseSimpleYaml(input: string): YamlValue {
  if (input.length > 100000) throw new Error("Use at most 100,000 characters.");
  const rawLines = input.replaceAll("\r\n", "\n").split("\n");
  if (rawLines.length > 1000) throw new Error("Use at most 1,000 lines.");
  const lines = rawLines.flatMap((raw, index) => {
    if (/\t/.test(raw.match(/^\s*/)?.[0] ?? "")) throw new Error(`Line ${index + 1}: use spaces, not tabs, for indentation.`);
    const content = stripComment(raw).trim();
    if (!content) return [];
    if (/^(?:---|\.\.\.)(?:\s|$)/.test(content)) throw new Error("Document markers and multiple documents are unsupported.");
    const indent = raw.length - raw.trimStart().length;
    if (indent % 2) throw new Error(`Line ${index + 1}: use two spaces per nesting level.`);
    return [{ content, indent, number: index + 1 }];
  });
  if (!lines.length) throw new Error("Enter a YAML mapping or list.");
  if (lines[0].indent !== 0) throw new Error("The root must start without indentation.");
  let cursor = 0;
  function block(indent: number): YamlValue {
    if (indent > 64) throw new Error("Use at most 32 nesting levels.");
    const isList = /^-(?:\s|$)/.test(lines[cursor].content);
    const list: YamlValue[] = [];
    const object: { [key: string]: YamlValue } = Object.create(null);
    while (cursor < lines.length && lines[cursor].indent >= indent) {
      const line = lines[cursor];
      if (line.indent !== indent) throw new Error(`Line ${line.number}: unexpected indentation.`);
      if (/^-(?:\s|$)/.test(line.content) !== isList) throw new Error(`Line ${line.number}: cannot mix list items and mapping keys.`);
      cursor++;
      if (isList) {
        const value = line.content.slice(1).trim();
        if (!value || (!/^["']/.test(value) && /:\s|:$/.test(value))) throw new Error("Only scalar list items are supported; object or nested list items are unsupported.");
        list.push(scalar(value));
      } else {
        const [key, value] = mapping(line.content);
        if (Object.hasOwn(object, key)) throw new Error(`Line ${line.number}: duplicate key "${key}".`);
        if (value) object[key] = scalar(value);
        else if (cursor < lines.length && lines[cursor].indent > indent) {
          if (lines[cursor].indent !== indent + 2) throw new Error(`Line ${lines[cursor].number}: use exactly two spaces for the next level.`);
          object[key] = block(indent + 2);
        } else object[key] = null;
      }
      if (cursor < lines.length && lines[cursor].indent > indent) throw new Error(`Line ${lines[cursor].number}: unexpected child content.`);
    }
    return isList ? list : object;
  }
  return block(0);
}
