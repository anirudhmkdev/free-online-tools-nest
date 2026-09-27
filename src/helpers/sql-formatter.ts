import { protectSqlLiterals } from "./sql-literals";

const KEYWORDS_MAJOR = [
  "SELECT", "FROM", "WHERE", "SET", "VALUES", "INTO",
  "ORDER BY", "GROUP BY", "HAVING", "LIMIT", "OFFSET",
];

const KEYWORDS_MINOR = [
  "JOIN", "INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL JOIN",
  "LEFT OUTER JOIN", "RIGHT OUTER JOIN", "FULL OUTER JOIN",
  "CROSS JOIN", "ON", "AND", "OR", "UNION", "UNION ALL",
  "INSERT INTO", "UPDATE", "DELETE FROM", "CREATE TABLE",
  "ALTER TABLE", "DROP TABLE", "CREATE INDEX", "DROP INDEX",
];

const ALL_KEYWORDS = [...KEYWORDS_MAJOR, ...KEYWORDS_MINOR].sort(
  (a, b) => b.length - a.length
);

export function formatSql(sql: string, indentSpaces: number): string {
  const indent = " ".repeat(indentSpaces);
  const protectedSql = protectSqlLiterals(sql);
  let result = protectedSql.text;

  for (const kw of ALL_KEYWORDS) {
    const escaped = kw.replace(/ /g, "\\s+");
    const re = new RegExp(`\\b${escaped}\\b`, "gi");
    result = result.replace(re, `\n${kw}\n`);
  }

  const lines = result
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  let depth = 0;
  const out: string[] = [];

  for (let line of lines) {
    const upperLine = line.toUpperCase();

    const isClosingParen = line.startsWith(")");
    const isMajor = KEYWORDS_MAJOR.some(
      (k) => upperLine === k || upperLine.startsWith(k + " ")
    );
    const isMinor = KEYWORDS_MINOR.some(
      (k) => upperLine === k || upperLine.startsWith(k + " ")
    );

    if (isClosingParen) depth = Math.max(0, depth - 1);

    if (isMajor) {
      out.push(line);
    } else if (isMinor) {
      out.push(indent.repeat(depth) + line);
    } else {
      out.push(indent.repeat(depth) + line);
    }

    const openCount = (line.match(/\(/g) || []).length;
    const closeCount = (line.match(/\)/g) || []).length;
    depth += openCount - closeCount;
    depth = Math.max(0, depth);
  }

  return protectedSql.restore(out.join("\n"));
}
