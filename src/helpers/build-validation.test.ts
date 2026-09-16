import { afterEach, describe, expect, it, vi } from "vitest";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, sep } from "node:path";
import { EXPECTED_ADS_TXT, inspectPage, resolveRedirect, validateAdsTxt, validateBuiltSite, validatePublishingPolicy } from "../../scripts/validate-built-site.mjs";

const site = "https://freeonlinetoolsnest.com";
const policy = { indexable: true, sitemapEligible: true, canonicalPath: "/", primaryAudience: "students", primaryIntent: "Prepare assignments", adEligible: false, relatedGuides: [], relatedWorkflows: [] };
const html = '<html><head><title>Study tools</title><meta name="description" content="Prepare your assignment"><meta name="robots" content="index, follow"><link rel="canonical" href="' + site + '/"><script>const id = "G-KW0NXYM3MN";</script></head><body><main id="main-content">Tools</main></body></html>';
const page = inspectPage(html, "/");
const fixtures: string[] = [];

function buildFixture() {
  const root = mkdtempSync(join(tmpdir(), "tools-nest-validation-"));
  fixtures.push(root);
  writeFileSync(join(root, "index.html"), html);
  writeFileSync(join(root, "ads.txt"), EXPECTED_ADS_TXT);
  writeFileSync(join(root, "robots.txt"), "User-agent: *\nAllow: /\nSitemap: " + site + "/sitemap-index.xml\n");
  writeFileSync(join(root, "_redirects"), "");
  writeFileSync(join(root, "sitemap-index.xml"), "<sitemapindex><sitemap><loc>" + site + "/sitemap-0.xml</loc></sitemap></sitemapindex>");
  writeFileSync(join(root, "sitemap-0.xml"), "<urlset><url><loc>" + site + "/</loc></url></urlset>");
  return root;
}

afterEach(() => {
  vi.unstubAllGlobals();
  for (const root of fixtures.splice(0)) {
    const resolved = resolve(root);
    if (!resolved.startsWith(resolve(tmpdir()) + sep + "tools-nest-validation-")) throw new Error("Unsafe test cleanup path");
    rmSync(resolved, { recursive: true, force: true });
  }
});

describe("offline ads.txt contract", () => {
  it.each([EXPECTED_ADS_TXT, EXPECTED_ADS_TXT + "\n", EXPECTED_ADS_TXT + "\r\n"])("accepts the publisher record", text => {
    expect(validateAdsTxt(text)).toEqual([]);
  });
  it.each([undefined, "", "<html>Not found</html>", EXPECTED_ADS_TXT.replace("7189536685341014", "0000000000000000"), EXPECTED_ADS_TXT + "\n" + EXPECTED_ADS_TXT, " " + EXPECTED_ADS_TXT])("rejects missing, HTML, incorrect and conflicting records", text => {
    expect(validateAdsTxt(text).length).toBeGreaterThan(0);
  });
});

describe("publishing gate", () => {
  it("accepts a generated, indexable, self-canonical page", () => {
    expect(validatePublishingPolicy({ "/": policy }, [page], "")).toEqual([]);
  });
  it("rejects sitemap-eligible noindex pages even before rendering", () => {
    expect(validatePublishingPolicy({ "/": { ...policy, indexable: false } }, [page], "").join(" ")).toContain("requires indexable");
  });
  it("rejects a missing build output", () => {
    expect(validatePublishingPolicy({ "/": policy }, [], "").join(" ")).toContain("not generated");
  });
  it("rejects both a policy canonical pointing elsewhere and incorrect generated canonical markup", () => {
    expect(validatePublishingPolicy({ "/": { ...policy, canonicalPath: "/other/" } }, [page], "").join(" ")).toContain("self-canonical");
    expect(validatePublishingPolicy({ "/": policy }, [{ ...page, canonicals: [site + "/other/"] }], "").join(" ")).toContain("not self-canonical");
  });
  it("rejects rendered noindex despite an indexable policy", () => {
    expect(validatePublishingPolicy({ "/": policy }, [{ ...page, robots: "noindex, follow" }], "").join(" ")).toContain("indexing disagrees");
  });
  it("rejects case-insensitive noindex, none and meta-refresh redirects", () => {
    for (const robots of ["NOINDEX FOLLOW", "none"]) {
      expect(validatePublishingPolicy({ "/": policy }, [{ ...page, robots }], "").join(" ")).toContain("indexing disagrees");
    }
    const redirected = inspectPage(html.replace("</head>", '<meta http-equiv="refresh" content="0;url=/other/"></head>'), "/");
    expect(validatePublishingPolicy({ "/": policy }, [redirected], "").join(" ")).toContain("meta refresh redirect");
  });
  it("reads apostrophes inside double-quoted descriptions without truncation", () => {
    expect(inspectPage(html.replace("Prepare your assignment", "Check your assignment's length"), "/").description).toBe("Check your assignment's length");
  });
  it.each(["/ /other/ 301", "/ /other/ 302", "/ /other/ 200"])("rejects a redirect or rewrite away from the sitemap URL", redirects => {
    expect(validatePublishingPolicy({ "/": policy }, [page], redirects).join(" ")).toContain("redirects or rewrites");
  });
  it("honors existing first-match wildcard passthroughs", () => {
    expect(resolveRedirect("/tools/word-counter/", "/tools/*/ /tools/:splat/ 200\n/tools/* /tools/:splat/ 301")).toEqual({ status: 200, destination: "/tools/word-counter/" });
    expect(resolveRedirect("/tools/word-counter", "/tools/*/ /tools/:splat/ 200\n/tools/* /tools/:splat/ 301").status).toBe(301);
  });
});

describe("built-site regression validation", () => {
  it("allows only approved additions with review evidence and no advertising", () => {
    const root = buildFixture();
    const baseline = { pages: [{ route: "/", robots: "index, follow", adEligible: false }], sitemap: ["/"], redirects: "" };
    const next = { ...policy, canonicalPath: "/new.html", reviewStatus: "reviewed", lastReviewed: "2026-09-16" };
    const policies = { "/": policy, "/new.html": next };
    writeFileSync(join(root, "new.html"), html.replace("Study tools", "New calculator").replace("Prepare your assignment", "A distinct calculator description").replace('href="' + site + '/"', 'href="' + site + '/new.html"'));
    writeFileSync(join(root, "sitemap-0.xml"), '<urlset><url><loc>' + site + '/</loc></url><url><loc>' + site + '/new.html</loc></url></urlset>');
    const options = { policies, baseline, allowedAdditions: ["/new.html"] };
    expect(validateBuiltSite(root, options).failures).toEqual([]);
    expect(validateBuiltSite(root, { ...options, allowedAdditions: [] }).failures.join(" ")).toContain("unapproved route addition");
    next.adEligible = true;
    expect(validateBuiltSite(root, options).failures.join(" ")).toContain("must remain ad-ineligible");
    next.adEligible = false;
    next.lastReviewed = "";
    expect(validateBuiltSite(root, options).failures.join(" ")).toContain("dated review evidence");
  });
  it("passes without network access", () => {
    vi.stubGlobal("fetch", () => { throw new Error("Network forbidden"); });
    expect(validateBuiltSite(buildFixture(), { policies: { "/": policy } }).failures).toEqual([]);
  });
  it("rejects broken links and anchors", () => {
    const root = buildFixture();
    writeFileSync(join(root, "index.html"), html + '<a href="/missing/">Missing</a><a href="/#missing">Missing anchor</a>');
    const errors = validateBuiltSite(root, { policies: { "/": policy } }).failures.join(" ");
    expect(errors).toContain("broken internal link");
    expect(errors).toContain("missing anchor");
  });
  it("rejects sitemap removal and a lost baseline route", () => {
    const root = buildFixture();
    writeFileSync(join(root, "sitemap-0.xml"), "<urlset></urlset>");
    const baseline = { sitemap: ["/"], pages: [{ route: "/", robots: "index, follow", adEligible: false }, { route: "/lost/" }], redirects: "" };
    const errors = validateBuiltSite(root, { policies: { "/": policy }, baseline }).failures.join(" ");
    expect(errors).toContain("sitemap membership changed");
    expect(errors).toContain("route set changed");
  });
});
