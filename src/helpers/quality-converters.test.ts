import { describe, it, expect } from "vitest";
import { createHash } from "node:crypto";
import { md5, minifyCss, parseInteger, jsonToXmlDocument, decimalToWords } from "./quality-converters";
import { calculateAmortization, calculateMortgage, computeDiscount, bmiCategory } from "./quality-calculators";

describe("verified output regressions", () => {
  it.each(["","a","abc","message digest","abcdefghijklmnopqrstuvwxyz","ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789","1234567890".repeat(8),"नमस्ते 👋","\ud800","a".repeat(100000)])("matches independent MD5 reference for %s", text => {
    expect(md5(text)).toBe(createHash("md5").update(text,"utf8").digest("hex"));
  });
  it("preserves CSS strings, math spacing and token boundaries", () => {
    const css = 'a  { width: calc(100% - 2px); content: "a  b /* literal */"; } x/**/y {}';
    expect(minifyCss(css)).toBe('a { width: calc(100% - 2px); content: "a  b /* literal */"; } x/**/y {}');
    expect(() => minifyCss('a { content: "unclosed')).toThrow();
    expect(() => minifyCss("/* unclosed")).toThrow();
    expect(minifyCss('.\\31  a { color: red; }')).toContain('\\31  a');
    expect(minifyCss('.a\\ ')).toBe('.a\\ ');
  });
  it("converts integers beyond Number precision exactly", () => {
    const integer = parseInteger("9007199254740993","decimal");
    expect(integer?.toString(16)).toBe("20000000000001");
    expect(parseInteger("20000000000001","hex")).toBe(integer);
    expect(parseInteger("0","binary")).toBe(0n);
    expect(parseInteger("102","binary")).toBeNull();
    expect(parseInteger("9".repeat(4097),"decimal")).toBeNull();
  });
  it("emits declared nil attributes and empty arrays without invented items", () => {
    const xml = jsonToXmlDocument({items:[],missing:null,text:'< & "'},"root");
    expect(xml).toContain('xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"');
    expect(xml).toContain('<missing xsi:nil="true"/>');
    expect(xml).toContain('<items/>');
    expect(xml).not.toContain('<item/>');
    expect(xml).toContain('&lt; &amp; &quot;');
    expect(() => jsonToXmlDocument({"bad key":1},"root")).toThrow();
    expect(() => jsonToXmlDocument({},"x:y")).toThrow();
    expect(() => jsonToXmlDocument("\u0001","root")).toThrow();
  });
  it("carries rounded fractions and rejects unsupported representations", () => {
    expect(decimalToWords("1.999")).toBe("two and 00/100");
    expect(decimalToWords("-1.995")).toBe("negative two and 00/100");
    expect(decimalToWords("0")).toBe("zero");
    expect(() => decimalToWords("123abc")).toThrow();
    expect(() => decimalToWords("1e30")).toThrow();
  });
  it("settles zero-interest loans, cent residuals and accelerated payoff", () => {
    const loan = calculateAmortization(12000,0,1,0);
    expect(loan.monthlyPayment).toBe(1000);
    expect(loan.totalInterest).toBe(0);
    expect(loan.schedule).toHaveLength(12);
    expect(loan.schedule.at(-1)?.balance).toBe(0);
    const normal = calculateAmortization(20000,5,5,0);
    const extra = calculateAmortization(20000,5,5,100);
    expect(extra.totalInterest).toBeLessThan(normal.totalInterest);
    expect(extra.schedule.length).toBeLessThan(normal.schedule.length);
    expect(normal.schedule.reduce((sum,row) => Math.round((sum + row.principal)*100)/100,0)).toBe(20000);
    expect(() => calculateAmortization(12000,5,1,-100)).toThrow();
    expect(() => calculateAmortization(12000,5,1.001,0)).toThrow();
  });
  it("rejects negative mortgage expenses and allows zero interest", () => {
    expect(calculateMortgage(12000,0,0,1,0,0,0)?.breakdown.total).toBe(1000);
    expect(calculateMortgage(12000,-1,5,1,0,0,0)).toBeNull();
    expect(calculateMortgage(12000,0,5,1,0,-1,0)).toBeNull();
  });
  it("accepts zero savings and complete discounts", () => {
    expect(computeDiscount("discount-pct","100","100")?.discountPct).toBe(0);
    expect(computeDiscount("final-price","100","100")?.finalPrice).toBe(0);
    expect(computeDiscount("savings","100","100")?.finalPrice).toBe(0);
    expect(computeDiscount("savings","100","-1")).toBeNull();
  });
  it("classifies BMI before display rounding", () => {
    expect(bmiCategory(99.84 / 4).label).toBe("Healthy weight");
    expect(bmiCategory(25).label).toBe("Overweight");
    expect(bmiCategory(18.5).label).toBe("Healthy weight");
  });
});
