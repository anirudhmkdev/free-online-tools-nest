/** Protect SQL strings, quoted identifiers and comments before heuristic formatting. */
export function protectSqlLiterals(sql: string) {
  const values: string[] = [];
  let tokenPrefix = "SQLPROTECTEDTOKEN";
  while (sql.includes(tokenPrefix)) tokenPrefix += "X";
  let text = "";
  for (let i = 0; i < sql.length;) {
    const start = i;
    const quote = sql[i];
    if (sql.startsWith("--", i)) {
      const end = sql.indexOf("\n", i);
      i = end === -1 ? sql.length : end + 1;
    } else if (sql.startsWith("/*", i)) {
      const end = sql.indexOf("*/", i + 2);
      if (end === -1) throw new Error("Unclosed SQL comment.");
      if (sql.slice(i + 2, end).includes("/*")) throw new Error("Nested comments are unsupported.");
      i = end + 2;
    } else if (quote === "'" || quote === '"' || quote === "`" || quote === "[") {
      const closing = quote === "[" ? "]" : quote;
      let closed = false;
      i++;
      for (; i < sql.length; i++) {
        if (sql[i] === "\\") throw new Error("Backslash-escaped SQL strings are dialect-dependent; use a dialect-aware formatter.");
        if (sql[i] === closing) {
          if (sql[i + 1] === closing) { i++; continue; }
          i++; closed = true; break;
        }
      }
      if (!closed) throw new Error("Unclosed quoted SQL value or identifier.");
    } else {
      if (quote === "$" && /^\$(?:[A-Za-z_][\w]*)?\$/.test(sql.slice(i))) throw new Error("Dollar-quoted SQL is unsupported; use a dialect-aware formatter.");
      text += quote; i++; continue;
    }
    const token = `${tokenPrefix}${values.length}END`;
    values.push(sql.slice(start, i)); text += token;
  }
  return {text, restore: (formatted: string) => formatted.replace(new RegExp(`${tokenPrefix}(\\d+)END`, "g"), (_, index) => values[Number(index)])};
}
