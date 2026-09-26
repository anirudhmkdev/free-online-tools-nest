import { CONTENT_PAGES } from "../data/content-page-quality";
import { PAGE_POLICIES, type PagePolicy } from "../data/page-policy";
import { getToolBySlug } from "../data/tools";
import type { ContentPage } from "../data/content-types";

export function contentPage(path: string): ContentPage {
  const page = CONTENT_PAGES.find(page => page.path === path);
  if (!page) throw new Error(`Missing content destination: ${path}`);
  return page;
}
export function isReviewedDestination(path: string, policies: Record<string, PagePolicy> = PAGE_POLICIES) {
  const policy = policies[path];
  return Boolean(policy?.indexable && policy.sitemapEligible && policy.reviewStatus === "reviewed" && policy.lastReviewed);
}
export function contentReferences(page: ContentPage) {
  return [...page.decisions.flatMap(d => d.links), ...page.sections.flatMap(s => s.links ?? []), ...page.related];
}
export function validateContentReferences(pages: ContentPage[], policies: Record<string, PagePolicy>) {
  const errors: string[] = [];
  for (const page of pages) {
    for (const link of contentReferences(page)) {
      if (!policies[link.path]) errors.push(`${page.path}: missing ${link.path}`);
      if (link.path === page.path) errors.push(`${page.path}: self-link`);
      if (link.path.startsWith("/tools/") && !getToolBySlug(link.path.split("/")[2])) errors.push(`${page.path}: unknown tool ${link.path}`);
    }
    if (page.primaryHub && !pages.some(p => p.kind === "hub" && p.path === page.primaryHub)) errors.push(`${page.path}: missing primary hub`);
  }
  return errors;
}

export function getToolContext(route: string) {
  if (!route.startsWith("/tools/")) return undefined;
  const slug = route.split("/")[2];
  const paths: Record<string, string[]> = {
    "/student-tools/": ["attendance-calculator", "sgpa-calculator", "cgpa-calculator", "marks-percentage-calculator", "required-marks-calculator", "percentage-calculator"],
    "/document-tools/": ["image-to-pdf", "pdf-merger", "pdf-compressor", "pdf-splitter", "pdf-to-text", "pdf-to-images", "image-compressor", "image-resizer", "image-cropper"],
    "/writing-tools/": ["word-counter", "character-counter", "grammar-checker", "readability-score", "text-analyzer", "word-cloud-generator"],
  };
  const hubPath = Object.keys(paths).find(path => paths[path].includes(slug));
  if (!hubPath || !isReviewedDestination(hubPath)) return undefined;
  const workflowPaths = PAGE_POLICIES[route].relatedWorkflows;
  const workflows = workflowPaths.map(path => {
    const page = contentPage(path);
    if (!isReviewedDestination(path)) throw new Error(`Unreviewed promoted workflow: ${path}`);
    return page;
  });
  return { hub: contentPage(hubPath), workflows };
}

/** Deliberately emits no review/publication/modification schema dates. */
export function contentSchema(page: ContentPage) {
  const site = "https://freeonlinetoolsnest.com";
  const listLinks = page.path === "/workflows/" ? page.decisions.flatMap(d => d.links) : contentReferences(page);
  const destinations = [...new Map(listLinks.map(link => [link.path, link])).values()];
  return {
    "@context": "https://schema.org",
    "@type": page.kind === "hub" ? "CollectionPage" : "WebPage",
    "@id": site + page.path, url: site + page.path, name: page.heading,
    description: page.description, inLanguage: "en",
    isPartOf: { "@type": page.kind === "hub" ? "WebSite" : "CollectionPage", "@id": site + (page.kind === "hub" ? "/" : "/workflows/") },
    ...(page.kind === "hub" ? { mainEntity: {
      "@type": "ItemList", itemListElement: destinations.map((link, i) => ({ "@type": "ListItem", position: i + 1, name: link.label, url: site + link.path })),
    } } : {}),
  };
}
