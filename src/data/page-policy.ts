import records from "./page-policies.json";

/** Publishing decisions are independent of homepage prominence and ad loading. */
export interface PagePolicy {
  indexable: boolean;
  sitemapEligible: boolean;
  canonicalPath: string;
  primaryAudience: string;
  primaryIntent: string;
  hub: "study-assignment" | "documents" | "writing" | "more-tools" | "reference" | "utility";
  tier: "core" | "secondary" | "legacy" | "utility";
  lastReviewed: string | null;
  adEligible: boolean;
  relatedGuides: string[];
  relatedWorkflows: string[];
  reviewStatus: "pending-evidence" | "reviewed";
}

export const PAGE_POLICIES = records as Record<string, PagePolicy>;

export function getPagePolicy(pathname: string): PagePolicy {
  const path = pathname === "/" || pathname.endsWith("/") || /\.[a-z0-9]+$/i.test(pathname)
    ? pathname : `${pathname}/`;
  const policy = PAGE_POLICIES[path];
  if (!policy) throw new Error(`Missing publishing policy for ${path}`);
  return policy;
}

export function isSitemapEligible(page: string): boolean {
  const policy = PAGE_POLICIES[new URL(page).pathname];
  return Boolean(policy?.sitemapEligible && policy.indexable);
}
