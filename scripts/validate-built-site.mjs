/* eslint-disable no-console */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { extname, join, relative } from "node:path";

const root = new URL("../dist/", import.meta.url);
const rootPath = root.pathname.replace(/^\/(?:[A-Za-z]:)/, (match) => match.slice(1)).replaceAll("/", "\\");

function walk(directory, extension) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path, extension) : extname(path) === extension ? [path] : [];
  });
}

function outputExists(href) {
  const clean = href.replace(/^\//, "");
  const direct = join(rootPath, clean);
  return existsSync(direct) || existsSync(join(direct, "index.html")) || existsSync(`${direct}.html`);
}

const htmlFiles = walk(rootPath, ".html");
const brokenLinks = [];
for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  for (const match of html.matchAll(/href=["'](\/[^"'#?]*)["']/g)) {
    const href = match[1];
    if (href.startsWith("//") || href.startsWith("/_astro/") || extname(href)) continue;
    if (!outputExists(href)) brokenLinks.push(`${relative(rootPath, file)} -> ${href}`);
  }
}

const adScript = "pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
const requiredAds = ["index.html", "about/index.html", "faq/index.html", "blog/index.html", "tools/json-formatter/index.html"];
const forbiddenAds = ["404.html", "500.html", "contact/index.html", "privacy-policy/index.html", "terms-and-conditions/index.html", "favorites/index.html", "tools/age-calculator/index.html"];
const failures = [...brokenLinks];

for (const file of requiredAds) {
  if (!readFileSync(join(rootPath, file), "utf8").includes(adScript)) failures.push(`${file} is missing the AdSense loader`);
}
for (const file of forbiddenAds) {
  if (readFileSync(join(rootPath, file), "utf8").includes(adScript)) failures.push(`${file} must not load AdSense`);
}
for (const locale of ["es", "hi"]) {
  for (const category of ["calculators", "seo-tools"]) {
    if (existsSync(join(rootPath, locale, "categories", category, "index.html"))) failures.push(`withdrawn route still built: /${locale}/categories/${category}/`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Validated ${htmlFiles.length} HTML files: links, ad eligibility, and withdrawn locale routes are correct.`);
