/* eslint-disable no-console */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const SITE_URL = "https://freeonlinetoolsnest.com";
export const EXPECTED_ADS_TXT = "google.com, pub-7189536685341014, DIRECT, f08c47fec0942fa0";
const AD_SCRIPT = "pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7189536685341014";
function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}
function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map(m => [m[1].toLowerCase(), m[2] ?? m[3]]));
}
export function inspectPage(html, route) {
  const meta = [...html.matchAll(/<meta\b[^>]*>/g)].map(m => attributes(m[0]));
  const links = [...html.matchAll(/<link\b[^>]*>/g)].map(m => attributes(m[0]));
  return {
    route, html,
    robots: meta.find(t => t.name === "robots")?.content ?? "",
    canonicals: links.filter(t => t.rel === "canonical").map(t => t.href),
    alternates: links.filter(t => t.rel === "alternate" && t.hreflang),
    title: html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "",
    description: meta.find(t => t.name === "description")?.content ?? "",
    adEligible: html.includes(AD_SCRIPT),
    redirects: meta.some(t => t["http-equiv"]?.toLowerCase() === "refresh"),
  };
}
/** Respect first-match rules, including 200 passthroughs before wildcard redirects. */
export function resolveRedirect(route, redirects) {
  for (const line of redirects.split(/\r?\n/)) {
    const [source, target, statusText] = line.trim().split(/\s+/);
    if (!source?.startsWith("/") || !target || !statusText) continue;
    const pattern = source.split("*").map(p => p.replace(/[.*+?^{}$()|[\]\\]/g, "\\$&")).join("(.*)");
    const match = route.match(new RegExp("^" + pattern + "$"));
    if (match) return { status: Number.parseInt(statusText, 10), destination: target.replaceAll(":splat", match[1] ?? "") };
  }
  return { status: 200, destination: route };
}
export function validatePublishingPolicy(policies, pages, redirects, site = SITE_URL) {
  const failures = [];
  const generated = new Map(pages.map(p => [p.route, p]));
  for (const [route, policy] of Object.entries(policies)) {
    const page = generated.get(route);
    if (!page) failures.push(route + ": policy page was not generated");
    if (typeof policy.indexable !== "boolean" || typeof policy.sitemapEligible !== "boolean") failures.push(route + ": indexing decisions must be explicit booleans");
    if (!policy.primaryAudience?.trim() || !policy.primaryIntent?.trim()) failures.push(route + ": audience and intent are required");
    if (policy.sitemapEligible && !policy.indexable) failures.push(route + ": sitemapEligible requires indexable");
    if (policy.sitemapEligible && policy.canonicalPath !== route) failures.push(route + ": sitemapEligible requires a self-canonical policy");
    const response = resolveRedirect(route, redirects);
    if (policy.sitemapEligible && (response.status >= 300 || response.destination !== route)) failures.push(route + ": sitemapEligible page redirects or rewrites elsewhere");
    if (!page) continue;
    if (page.canonicals.length !== 1 || page.canonicals[0] !== site + policy.canonicalPath) failures.push(route + ": generated canonical disagrees with policy");
    if (policy.sitemapEligible && page.canonicals[0] !== site + route) failures.push(route + ": generated sitemap page is not self-canonical");
    if (policy.sitemapEligible && page.redirects) failures.push(route + ": sitemapEligible page has a meta refresh redirect");
    const isNoindex = page.robots.toLowerCase().split(/[\s,]+/).some(value => value === "noindex" || value === "none");
    if (!page.robots || isNoindex === policy.indexable) failures.push(route + ": generated indexing disagrees with policy");
    if (page.adEligible !== policy.adEligible) failures.push(route + ": existing AdSense loading changed");
    for (const target of [...(policy.relatedGuides ?? []), ...(policy.relatedWorkflows ?? [])]) {
      if (!generated.has(target)) failures.push(route + ": related content missing: " + target);
    }
  }
  for (const page of pages) if (!policies[page.route]) failures.push(page.route + ": generated page has no publishing policy");
  return failures;
}
export function validateAdsTxt(text) {
  return typeof text === "string" && text.replace(/\r?\n$/, "") === EXPECTED_ADS_TXT
    ? [] : ["ads.txt must contain exactly the expected publisher line (with an optional final newline)"];
}
/** @typedef {{pages: Array<{route: string, robots?: string, adEligible?: boolean, title?: string, description?: string}>, sitemap: string[], redirects: string}} RouteBaseline */
/** Local output only: no production requests or network-dependent checks. */
export function validateBuiltSite(rootPath, { policies, baseline = /** @type {RouteBaseline | undefined} */ (undefined), site = SITE_URL }) {
  const failures = [];
  if (!existsSync(rootPath)) return { failures: ["Build output directory is missing"], pageCount: 0, sitemapCount: 0 };
  const pages = walk(rootPath).filter(f => extname(f) === ".html").map(file => {
    const route = "/" + relative(rootPath, file).replaceAll("\\", "/").replace(/index\.html$/, "");
    return inspectPage(readFileSync(file, "utf8"), route);
  });
  const generated = new Map(pages.map(p => [p.route, p]));
  const read = path => existsSync(join(rootPath, path)) ? readFileSync(join(rootPath, path), "utf8") : "";
  const redirects = read("_redirects");
  failures.push(...validateAdsTxt(read("ads.txt")), ...validatePublishingPolicy(policies, pages, redirects, site));
  const sitemapFiles = [...read("sitemap-index.xml").matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  if (!sitemapFiles.length) failures.push("Sitemap index is empty or missing");
  const sitemapUrls = [];
  for (const location of sitemapFiles) {
    if (!location.startsWith(site + "/")) { failures.push("Unexpected sitemap host: " + location); continue; }
    const xml = read(new URL(location).pathname.slice(1));
    if (!xml) failures.push("Missing generated sitemap: " + location);
    sitemapUrls.push(...[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]));
  }
  const expectedUrls = Object.entries(policies).filter(([, p]) => p.sitemapEligible).map(([route]) => site + route).sort();
  if (JSON.stringify([...sitemapUrls].sort()) !== JSON.stringify(expectedUrls)) failures.push("Generated sitemap does not match publishing policy");
  // Frozen evidence is for regression checks only, never production eligibility.
  if (baseline) {
    if (JSON.stringify(pages.map(p => p.route).sort()) !== JSON.stringify(baseline.pages.map(p => p.route).sort())) failures.push("Phase 1 route set changed");
    if (JSON.stringify([...sitemapUrls].sort()) !== JSON.stringify(baseline.sitemap.map(r => site + r).sort())) failures.push("Phase 1 sitemap membership changed");
    if (redirects.replaceAll("\r\n", "\n") !== baseline.redirects.replaceAll("\r\n", "\n")) failures.push("Phase 1 redirect rules changed");
    for (const before of baseline.pages) {
      const after = generated.get(before.route);
      if (after && after.robots !== before.robots) failures.push(before.route + ": Phase 1 robots directive changed");
      if (after && after.adEligible !== before.adEligible) failures.push(before.route + ": Phase 1 AdSense loader changed");
    }
  }
  if (!read("robots.txt").includes("Sitemap: " + site + "/sitemap-index.xml")) failures.push("robots.txt is missing the sitemap declaration");
  for (const page of pages) {
    if (!page.title || !page.description) failures.push(page.route + ": missing title or description");
    if (page.html.includes('name="google-adsense-account"')) failures.push(page.route + ": unexpected AdSense verification meta tag");
    if (!page.html.includes("G-KW0NXYM3MN")) failures.push(page.route + ": existing GA4 configuration missing");
    for (const m of page.html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/g)) {
      try { JSON.parse(m[1]); } catch { failures.push(page.route + ": invalid JSON-LD"); }
    }
    for (const alternate of page.alternates) {
      let target;
      try { target = new URL(alternate.href); } catch { failures.push(page.route + ": invalid hreflang URL"); continue; }
      const other = generated.get(target.pathname);
      if (target.origin !== site || !other) failures.push(page.route + ": missing hreflang target " + alternate.href);
      else if (alternate.hreflang !== "x-default" && !other.alternates.some(link => link.href === site + page.route)) failures.push(page.route + ": nonreciprocal hreflang " + alternate.href);
    }
    for (const m of page.html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/g)) {
      const href = m[1];
      if (href.startsWith("//") || /^(?:https?:|mailto:|tel:|javascript:)/i.test(href)) continue;
      let target;
      try { target = new URL(href.replaceAll("&amp;", "&"), site + page.route); } catch { failures.push(page.route + ": invalid internal link " + href); continue; }
      const targetPage = generated.get(target.pathname);
      if (!targetPage && !existsSync(join(rootPath, decodeURIComponent(target.pathname)))) failures.push(page.route + ": broken internal link " + href);
      if (targetPage && target.hash) {
        const id = decodeURIComponent(target.hash.slice(1));
        if (!targetPage.html.includes('id="' + id + '"') && !targetPage.html.includes("id='" + id + "'")) failures.push(page.route + ": missing anchor " + href);
      }
    }
  }
  for (const key of ["title", "description"]) {
    const groups = new Map();
    for (const page of pages) groups.set(page[key], [...(groups.get(page[key]) ?? []), page.route]);
    for (const [value, routes] of groups) {
      if (routes.length < 2) continue;
      const unchanged = baseline && routes.every(route => baseline.pages.some(p => p.route === route && p[key] === value));
      if (!unchanged) failures.push("New duplicate " + key + ": " + routes.join(", "));
    }
  }
  return { failures, pageCount: pages.length, sitemapCount: sitemapUrls.length };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const rootPath = fileURLToPath(new URL("../dist/", import.meta.url));
  const policies = JSON.parse(readFileSync(new URL("../src/data/page-policies.json", import.meta.url), "utf8"));
  const baseline = JSON.parse(readFileSync(new URL("../src/data/__fixtures__/pre-pivot-routes.json", import.meta.url), "utf8"));
  const result = validateBuiltSite(rootPath, { policies, baseline });
  if (result.failures.length) { console.error(result.failures.join("\n")); process.exitCode = 1; }
  else console.log("Validated " + result.pageCount + " pages and " + result.sitemapCount + " sitemap URLs offline: routes, indexing, canonicals, redirects, links, hreflang, JSON-LD, ads.txt and existing integrations.");
}
