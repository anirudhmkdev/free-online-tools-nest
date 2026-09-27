/* eslint-disable no-console */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { inspectPage } from "./validate-built-site.mjs";
import { textOnly } from "./phase-3-protection.mjs";

// Coverage inventory, deliberately not an automated editorial quality score.
const root = process.cwd();
const policies = JSON.parse(readFileSync(join(root, "src/data/page-policies.json"), "utf8"));
const baseline = JSON.parse(readFileSync(join(root, "src/data/__fixtures__/post-phase-2-routes.json"), "utf8"));
const expected = baseline.pages.filter(p => p.adEligible).map(p => p.route).sort();
const members = Object.entries(policies).filter(([, p]) => p.adEligible).map(([route]) => route).sort();
if (JSON.stringify(expected) !== JSON.stringify(members)) throw new Error("AdSense-loader membership changed");
const failures = [];
const rows = members.map(route => {
  const html = readFileSync(join(root, "dist", route.slice(1), "index.html"), "utf8");
  const page = inspectPage(html, route);
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? "";
  const pass = page.adEligible && !!page.title && !!page.description && page.canonicals[0] === "https://freeonlinetoolsnest.com" + route && /<h1\b/.test(main) && !!textOnly(main);
  if (!pass) failures.push(route);
  const slug = route.match(/\/tools\/([^/]+)\//)?.[1];
  const locale = /^\/(es|hi)\//.test(route);
  const priority = !slug && /\/(?:categories|tools|blog)\/$/.test(route) ? "Review navigation-heavy content and ad suitability manually" : slug ? "Verify every advertised feature and edge case; see repair report for tested cases" : "Review original content, sources and visible ownership information";
  return `| ${route} | ${pass ? "Pass" : "FAIL"} | ${locale ? "Localized copy and shared tool behavior" : slug ? "Tool functionality and page claims" : "Editorial/structural page"} | ${priority} |`;
});
if (failures.length) throw new Error("Generated-page audit failed: " + failures.join(", "));
const report = `# Publisher-page coverage audit\n\nReviewed against the local generated output on 2026-09-27. All ${members.length} original loader members are present with their existing canonicals, titles, descriptions and nonempty main content. The full publishing validator separately checks indexing, sitemap, redirects, links and integrations.\n\nThis is a complete **structural coverage inventory**, not a claim of complete functional or editorial sign-off. Passing these checks does not prove unique value, correct advertised functionality or AdSense eligibility. Read [the verification report](content-remediation-verification.md) for the exact browser and logic tests; remaining reviews below must not be marked passed without evidence. No traffic, queries, user inputs or private performance history are included.\n\nNo advertising settings changed. Navigation-heavy inventories need a human content/ad-suitability review; the existing preservation requirement is not evidence that every page should remain monetized indefinitely. Any proposed advertising change is separate from this repair branch.\n\n| Route | Structural check | Manual review scope | Next review |\n| --- | --- | --- | --- |\n${rows.join("\n")}\n`;
writeFileSync(join(root, "docs/publisher-page-audit.md"), report);
console.log(`Audited ${members.length} exact legacy loader members; structural checks passed. Editorial sign-off remains separate.`);
