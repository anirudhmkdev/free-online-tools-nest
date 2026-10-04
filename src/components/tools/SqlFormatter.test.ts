import { describe, expect, it } from "vitest";
import { formatSql } from "./SqlFormatter";

describe("SQL formatting preserves non-code segments", () => {
  it("formats code keywords without rewriting keywords inside string values", () => {
    const result = formatSql("select 'from here', 'rock and roll' from t where name='MiXeD';", 2);
    expect(result).toContain("'from here'");
    expect(result).toContain("'rock and roll'");
    expect(result).toContain("'MiXeD'");
    expect(result).toMatch(/^SELECT\n/);
    expect(result).toContain("\nFROM\n");
    expect(result).toContain("\nWHERE\n");
  });

  it("retains quoted identifiers, escaped quotes, whitespace and parentheses exactly", () => {
    const values = ["'It''s from (here)  and there'", '"select from"', '`order by`', '[where ]] and]', "'line one\n  from line two'"];
    const result = formatSql(`select ${values.join(", ")} from example`, 4);
    for (const value of values) expect(result).toContain(value);
  });

  it("retains line comment text and its original line ending", () => {
    const comment = "-- from  here and there  \r\n";
    const result = formatSql(`select 1 ${comment}from example`, 2);
    expect(result).toContain(comment);
    expect(result.slice(result.indexOf(comment) + comment.length)).toContain("FROM");
    expect(formatSql("select 1 -- keep trailing spaces   ", 2)).toContain("-- keep trailing spaces   ");
  });

  it("preserves nested block comments and dollar-quoted bodies", () => {
    const comment = "/* from\n  /* and */ where  */";
    const body = "$query$select '(x)'\n  from x where y = 1$query$";
    const result = formatSql(`select ${body} ${comment} from t`, 2);
    expect(result).toContain(comment);
    expect(result).toContain(body);
  });

  it("handles input resembling its internal markers without corrupting it", () => {
    expect(formatSql("select '\uE0000\uE001 from here' from t", 2)).toContain("'\uE0000\uE001 from here'");
  });

  it.each(["select 'unfinished", 'select "unfinished', "select /* unfinished", "select $$unfinished"])(
    "rejects an unterminated protected segment: %s",
    sql => expect(() => formatSql(sql, 2)).toThrow(/Unterminated/),
  );
});
