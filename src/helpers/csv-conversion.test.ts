import { describe, expect, it } from "vitest";
import { csvToRecords, parseCsv } from "./csv-conversion";

describe("CSV conversion", () => {
  it("preserves quoted commas, escaped quotes, multiline fields and leading zeros", () => {
    const rows = parseCsv('\uFEFFid,note\r\n001,"comma, and ""quote"""\r\n002,"two\r\nlines"\r\n');
    expect(csvToRecords(rows, true)).toEqual([
      { id: "001", note: 'comma, and "quote"' },
      { id: "002", note: "two\r\nlines" },
    ]);
  });
  it("rejects unclosed quotes and misplaced quote characters", () => {
    expect(() => parseCsv('a,b\n1,"unfinished')).toThrow(/closing quote/);
    expect(() => parseCsv('a,b\n1,un"quoted')).toThrow(/start with a quote/);
    expect(() => parseCsv('a,b\n1,"quoted"suffix')).toThrow(/after a closing quote/);
  });
  it("rejects duplicate and blank headers instead of overwriting cells", () => {
    expect(() => csvToRecords(parseCsv("id,id\n001,002"), true)).toThrow(/unique/);
    expect(() => csvToRecords(parseCsv("id, \n001,002"), true)).toThrow(/name/);
    expect(() => csvToRecords(parseCsv("id, id \n001,002"), true)).toThrow(/unique/);
  });
  it("rejects short and extra rows with or without headers", () => {
    expect(() => csvToRecords(parseCsv("a,b\n1"), true)).toThrow(/Row 2.*expected 2/);
    expect(() => csvToRecords(parseCsv("a,b\n1,2,3"), true)).toThrow(/Row 2.*expected 2/);
    expect(() => csvToRecords(parseCsv("1,2\n3"), false)).toThrow(/expected 2/);
  });
  it("keeps explicit empty fields and data whitespace while skipping blank lines", () => {
    expect(parseCsv('\n \n""\n')).toEqual([[""]]);
    expect(csvToRecords(parseCsv("a,b\n,\n 001 , value "), true)).toEqual([
      { a: "", b: "" }, { a: " 001 ", b: " value " },
    ]);
  });
  it("supports a selected delimiter and safely retains special property names", () => {
    expect(csvToRecords(parseCsv("__proto__;id\nvalue;001", ";"), true)).toEqual([JSON.parse('{"__proto__":"value","id":"001"}')]);
    expect(() => parseCsv("a,b", "")).toThrow(/delimiter/);
  });
});
