const RETIRED_ROUTE = "/tools/text-humanizer/";
const RETIRED_SOURCES = ["src/pages/tools/text-humanizer.astro", "src/components/tools/TextHumanizer.tsx"];
/** A single owner-approved retirement; never relax the preservation set globally. */
export function applyApprovedRetirements(fixture, manifest) {
  const result = structuredClone(fixture);
  const failures = [];
  if (manifest?.retirements?.length !== 1) return {fixture:result,failures:["Exactly one explicit Text Humanizer retirement is required"],routes:[]};
  const retirement = manifest.retirements[0];
  const policy = retirement.beforePolicy;
  if (retirement.route !== RETIRED_ROUTE || !retirement.reason?.trim() || policy?.adEligible !== false || policy?.canonicalPath !== RETIRED_ROUTE || JSON.stringify(retirement.sources) !== JSON.stringify(RETIRED_SOURCES)) return {fixture:result,failures:["Invalid tool retirement approval"],routes:[]};
  if (Array.isArray(result.pages)) {
    const before = result.pages.find(page => page.route === RETIRED_ROUTE);
    if (!before || before.adEligible !== false) failures.push("Retirement does not match the frozen non-advertising route");
    else {
      result.pages = result.pages.filter(page => page.route !== RETIRED_ROUTE);
      result.sitemap = result.sitemap.filter(route => route !== RETIRED_ROUTE);
    }
  } else {
    const before = result.pages[RETIRED_ROUTE];
    if (!retirement.beforePage || (before && (Object.keys(before).some(key => JSON.stringify(before[key]) !== JSON.stringify(retirement.beforePage[key])) || Object.keys(before).length !== Object.keys(retirement.beforePage).length))) failures.push("Retired page signals differ from the recorded Campus baseline");
    else if (before) delete result.pages[RETIRED_ROUTE];
    for (const path of RETIRED_SOURCES) {
      if (result.sources?.[path]) {
        if (result.sources[path] !== retirement.beforeSources[path]) failures.push(path + ": retirement source hash differs");
        else delete result.sources[path];
      }
    }
  }
  return {fixture:result,failures,routes:failures.length ? [] : [RETIRED_ROUTE]};
}
