import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { inspectPage } from "./validate-built-site.mjs";

export const hashText = text => createHash("sha256").update(text.replaceAll("\r\n", "\n")).digest("hex");
export const textOnly = html => html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "").replace(/<!--[^]*?-->/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
/** Protect visible page-owned text, not HTML attributes, bundles, or shared chrome. */
export function ownedSignals(html, route) {
  const page = inspectPage(html, route);
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? "";
  const owned = main.replace(/<section\b[^>]*data-workflow-links[^>]*>[\s\S]*?<\/section>/gi, "");
  const visible = textOnly(owned);
  // This existing tool renders Date.now() during prerender; keep its label and all other copy.
  const stable = route.endsWith("/tools/epoch-converter/") ? visible.replace(/(Current Timestamp \(ms\)) \d+/, "$1 [live clock]") : visible;
  return {
    title: page.title, description: page.description, canonicals: page.canonicals,
    robots: page.robots,
    h1: [...owned.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map(m => textOnly(m[1])),
    ownedTextHash: hashText(stable),
  };
}
export function checkProtection(root, fixture) {
  const failures = [];
  for (const [route, expected] of Object.entries(fixture.pages)) {
    const path = join(root, "dist", route.replace(/^\//, ""), "index.html");
    const actual = ownedSignals(readFileSync(path, "utf8"), route);
    for (const key of Object.keys(expected)) {
      if (JSON.stringify(actual[key]) !== JSON.stringify(expected[key])) failures.push(`${route}: protected ${key} changed`);
    }
  }
  for (const [path, expected] of Object.entries(fixture.sources)) {
    if (hashText(readFileSync(join(root, path), "utf8")) !== expected) failures.push(`${path}: protected source changed`);
  }
  return failures;
}

/** Structural overlap check supports (and does not replace) the recorded editorial review. */
export function checkHubMetadata(hub, category) {
  const failures = [];
  for (const key of ["title", "description", "h1"]) {
    if (JSON.stringify(hub[key]) === JSON.stringify(category[key])) failures.push(`Hub and category must have distinct ${key}`);
  }
  return failures;
}
