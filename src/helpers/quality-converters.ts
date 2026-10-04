/** RFC 1321 digest of UTF-8 text. MD5 is a checksum, not a security primitive. */
export function md5(text: string): string {
  const input = new TextEncoder().encode(text);
  const bytes = new Uint8Array(Math.ceil((input.length + 9) / 64) * 64);
  bytes.set(input);
  bytes[input.length] = 0x80;
  const view = new DataView(bytes.buffer);
  const bits = BigInt(input.length) * 8n;
  view.setUint32(bytes.length - 8, Number(bits & 0xffffffffn), true);
  view.setUint32(bytes.length - 4, Number(bits >> 32n), true);
  const shifts = [[7,12,17,22], [5,9,14,20], [4,11,16,23], [6,10,15,21]];
  const constants = Array.from({length: 64}, (_, i) => Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32));
  const state = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476];
  for (let offset = 0; offset < bytes.length; offset += 64) {
    let [a, b, c, d] = state;
    for (let i = 0; i < 64; i++) {
      const round = Math.floor(i / 16);
      const f = round === 0 ? (b & c) | (~b & d) : round === 1 ? (d & b) | (~d & c) : round === 2 ? b ^ c ^ d : c ^ (b | ~d);
      const word = round === 0 ? i : round === 1 ? (5 * i + 1) % 16 : round === 2 ? (3 * i + 5) % 16 : (7 * i) % 16;
      const sum = (a + f + constants[i] + view.getUint32(offset + word * 4, true)) | 0;
      const shift = shifts[round][i % 4];
      [a, b, c, d] = [d, (b + ((sum << shift) | (sum >>> (32 - shift)))) | 0, b, c];
    }
    [a,b,c,d].forEach((value, i) => { state[i] = (state[i] + value) | 0; });
  }
  return state.map(value => [0,8,16,24].map(shift => ((value >>> shift) & 255).toString(16).padStart(2, "0")).join("")).join("");
}

/** Conservative compaction: preserve strings, escapes, token boundaries and math spaces. */
export function minifyCss(input: string): string {
  let output = "";
  let quote = "";
  let whitespace = false;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === "\\") {
      if (i + 1 >= input.length) throw new Error("Incomplete CSS escape.");
      const escape = input.slice(i + 1).match(/^[\da-fA-F]{1,6}(?:\r\n|[\t\r\n\f ])?/);
      if (escape) { output += ch + escape[0]; i += escape[0].length; }
      else output += ch + input[++i];
      whitespace = false;
      continue;
    }
    if (quote) {
      output += ch;
      if (ch === quote) quote = "";
      whitespace = false;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
      output += ch;
      whitespace = false;
    } else if (ch === "/" && input[i + 1] === "*") {
      const end = input.indexOf("*/", i + 2);
      if (end === -1) throw new Error("Unclosed CSS comment.");
      // Keep an empty comment: deleting it could join two CSS tokens into a different token.
      output += "/**/";
      i = end + 1;
      whitespace = false;
    } else if (/\s/.test(ch)) {
      if (!whitespace && output) output += " ";
      whitespace = true;
    } else { output += ch; whitespace = false; }
  }
  if (quote) throw new Error("Unclosed CSS string.");
  return whitespace && output.endsWith(" ") ? output.slice(0, -1) : output;
}

export type IntegerBase = "binary" | "decimal" | "hex" | "octal";
export function parseInteger(value: string, base: IntegerBase): bigint | null {
  const text = value.trim();
  if (!text || text.length > 4096) return null;
  const patterns = {binary: /^[01]+$/, decimal: /^\d+$/, hex: /^[\da-f]+$/i, octal: /^[0-7]+$/};
  if (!patterns[base].test(text)) return null;
  return BigInt(({binary:"0b", decimal:"", hex:"0x", octal:"0o"})[base] + text);
}

export function jsonToXmlDocument(value: unknown, rootName: string): string {
  let nodes = 0;
  const validName = (name: string) => {
    if (!/^[A-Za-z_][A-Za-z0-9_.-]*$/.test(name) || /^xml/i.test(name)) throw new Error(`Unsupported XML element name: ${name}. Use a letter or underscore first; then letters, digits, _, - or . No namespace prefixes.`);
  };
  const escape = (value: string) => {
    if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffe\uffff]/.test(value) || /[\ud800-\udbff](?![\udc00-\udfff])|(?<![\ud800-\udbff])[\udc00-\udfff]/u.test(value)) throw new Error("Text contains a character XML 1.0 cannot represent.");
    return value.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;");
  };
  const serialize = (value: unknown, name: string, depth: number): string => {
    validName(name);
    if (++nodes > 10000 || depth > 32) throw new Error("Use at most 10,000 XML nodes and 32 levels of nesting.");
    const indent = "  ".repeat(depth);
    const namespace = depth === 0 ? ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' : "";
    const open = `${indent}<${name}${namespace}`;
    if (value === null) return `${open} xsi:nil="true"/>\n`;
    if (typeof value === "number" && !Number.isFinite(value)) throw new Error("JSON numbers must be finite.");
    if (typeof value !== "object") return `${open}>${escape(String(value))}</${name}>\n`;
    const entries = Array.isArray(value) ? value.map(item => ["item", item] as const) : Object.entries(value as Record<string, unknown>);
    if (!entries.length) return `${open}/>\n`;
    return `${open}>\n${entries.map(([key, val]) => serialize(val, key, depth + 1)).join("")}${indent}</${name}>\n`;
  };
  return '<?xml version="1.0" encoding="UTF-8"?>\n' + serialize(value, rootName, 0);
}

const ones = ["zero","one","two","three","four","five","six","seven","eight","nine"];
const teens = ["ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"];
const tens = ["","","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"];
function integerWords(n: bigint): string {
  if (n === 0n) return "zero";
  const parts: string[] = [];
  const scales = ["","thousand","million","billion","trillion"];
  for (let i = 0; n > 0n; n /= 1000n, i++) {
    const chunk = Number(n % 1000n);
    if (!chunk) continue;
    const rest = chunk % 100;
    const small = rest < 10 ? (rest ? ones[rest] : "") : rest < 20 ? teens[rest - 10] : tens[Math.floor(rest / 10)] + (rest % 10 ? "-" + ones[rest % 10] : "");
    parts.unshift([chunk >= 100 ? ones[Math.floor(chunk / 100)] + " hundred" : "",small,scales[i]].filter(Boolean).join(" "));
  }
  return parts.join(" ");
}
/** Decimal strings avoid floating-point carry errors; fractions round half away from zero. */
export function decimalToWords(input: string): string {
  const match = input.trim().match(/^([+-]?)(\d{1,15})(?:\.(\d+))?$/);
  if (!match) throw new Error("Enter a plain decimal number, with up to 15 digits before the decimal point. Commas and scientific notation are not supported.");
  const fraction = match[3];
  let cents = BigInt(match[2]) * 100n + BigInt((fraction ?? "").slice(0,2).padEnd(2,"0"));
  if (fraction && Number(fraction[2] ?? 0) >= 5) cents++;
  if (cents > 99999999999999999n) throw new Error("Rounded value exceeds 999,999,999,999,999.99.");
  return (match[1] === "-" && cents !== 0n ? "negative " : "") + integerWords(cents / 100n) + (fraction ? ` and ${String(cents % 100n).padStart(2,"0")}/100` : "");
}
