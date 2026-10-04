import { describe, expect, it } from "vitest";
import { hasValidSchemaValues, isAbsoluteHttpUrl, isValidSchemaDate } from "./tool-output-validity";

describe("HTTP URL validity for measured output", () => {
  it.each(["https://example.com/page?x=1", "http://localhost:8080/", " https://example.com/ "])("accepts %s", value => {
    expect(isAbsoluteHttpUrl(value)).toBe(true);
  });
  it.each(["", "http://", "https://?bad", "https://[", "/page", "javascript:alert(1)", "ftp://example.com", "https://exa mple.com"])("rejects %s", value => {
    expect(isAbsoluteHttpUrl(value)).toBe(false);
  });
});

describe("schema field validity", () => {
  const article = { headline: "Article", author: "Author", datePublished: "2026-10-04", publisher: "Publisher" };
  const articleRequired = ["headline", "author", "datePublished", "publisher"];
  it("requires populated fields and rejects malformed dates and optional image URLs", () => {
    expect(hasValidSchemaValues("Article", article, articleRequired)).toBe(true);
    expect(hasValidSchemaValues("Article", { ...article, author: "  " }, articleRequired)).toBe(false);
    expect(hasValidSchemaValues("Article", { ...article, datePublished: "nonsense" }, articleRequired)).toBe(false);
    expect(hasValidSchemaValues("Article", { ...article, image: "http://" }, articleRequired)).toBe(false);
  });
  it.each(["2026-02-30", "2025-02-29", "2026-13-01", "2026-00-01", "2026-10-04T25:00", "2026-10-04T12:80"])("rejects invalid calendar value %s", value => {
    expect(isValidSchemaDate(value)).toBe(false);
  });
  it.each(["2024-02-29", "2026-10-04", "2026-10-04T19:30", "2026-10-04T19:30:00+05:30"])("accepts valid calendar value %s", value => {
    expect(isValidSchemaDate(value)).toBe(true);
  });
  it("rejects nonnumeric or negative product prices and malformed currency", () => {
    const required = ["name", "description", "brand", "price", "priceCurrency"];
    const product = { name: "Item", description: "Description", brand: "Brand", price: "29.99", priceCurrency: "USD" };
    expect(hasValidSchemaValues("Product", product, required)).toBe(true);
    expect(hasValidSchemaValues("Product", { ...product, price: "0" }, required)).toBe(true);
    for (const price of ["NaN", "-1", "Infinity", "0x10", "1oops"]) expect(hasValidSchemaValues("Product", { ...product, price }, required)).toBe(false);
    expect(hasValidSchemaValues("Product", { ...product, priceCurrency: "dollars" }, required)).toBe(false);
  });
  it("checks event date order and ISO recipe durations", () => {
    const event = { name: "Event", startDate: "2026-10-04T19:00", endDate: "2026-10-04T20:00", location: "Venue", description: "Description" };
    expect(hasValidSchemaValues("Event", event, ["name", "startDate", "location", "description"])).toBe(true);
    expect(hasValidSchemaValues("Event", { ...event, endDate: "2026-10-04T18:00" }, ["name", "startDate", "location", "description"])).toBe(false);
    const recipe = { name: "Recipe", author: "Chef", cookTime: "PT30M", recipeYield: "4 servings" };
    expect(hasValidSchemaValues("Recipe", recipe, ["name", "author", "cookTime", "recipeYield"])).toBe(true);
    expect(hasValidSchemaValues("Recipe", { ...recipe, cookTime: "30 minutes" }, ["name", "author", "cookTime", "recipeYield"])).toBe(false);
  });
  it("checks organization URLs and founding dates without requiring optional fields", () => {
    const organization = { name: "Organization", description: "Description", url: "https://example.com", foundingDate: "2020" };
    const required = ["name", "description", "url"];
    expect(hasValidSchemaValues("Organization", organization, required)).toBe(true);
    expect(hasValidSchemaValues("Organization", { ...organization, url: "bad" }, required)).toBe(false);
    expect(hasValidSchemaValues("Organization", { ...organization, foundingDate: "yesterday" }, required)).toBe(false);
  });
});
