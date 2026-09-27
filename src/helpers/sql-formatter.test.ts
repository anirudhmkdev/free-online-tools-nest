import { expect, it } from "vitest";
import { formatSql } from "./sql-formatter";
it("preserves strings, identifiers and comments exactly", () => {
  const result = formatSql(`select 'from here', 'it''s where', "select", [from], \`where\` from users -- where do not change\nwhere name='select'; /* from comment */`, 2);
  for (const literal of ["'from here'", "'it''s where'", '"select"', '[from]', '`where`', '-- where do not change\n', "'select'", '/* from comment */']) expect(result).toContain(literal);
  expect(result).toContain("SELECT"); expect(result).toContain("FROM");
});
it("rejects unsupported quoting instead of corrupting it", () => {
  for(const sql of ["select 'unclosed", "select $$from$$", "select $tag$where$tag$", "select 'it\\'s'", "/* unclosed", "/* outer /* inner */ end */"]) expect(()=>formatSql(sql,2)).toThrow();
});
it("avoids collisions with user text matching placeholder prefixes", () => {
  expect(formatSql("select SQLPROTECTEDTOKEN0END, 'from'",2)).toContain("SQLPROTECTEDTOKEN0END");
});
