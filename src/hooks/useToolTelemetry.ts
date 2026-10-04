import { useCallback } from "react";
import { createToolTelemetry, type ToolAction } from "../helpers/tool-telemetry";

type Session = ReturnType<typeof createToolTelemetry>;
const visits = new WeakMap<Document, Map<string, Session>>();

function getSession(): Session | undefined {
  if (typeof document === "undefined" || typeof window === "undefined") return;
  const workspace = document.querySelector<HTMLElement>("[data-tool-slug][data-tool-locale][data-tool-tier]");
  if (!workspace) return;
  const { toolSlug: slug, toolLocale: locale, toolTier: tier } = workspace.dataset;
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
      (locale !== "en" && locale !== "es" && locale !== "hi") ||
      (tier !== "primary" && tier !== "secondary")) return;
  let page = visits.get(document);
  if (!page) { page = new Map(); visits.set(document, page); }
  const key = `${locale}:${slug}`;
  let session = page.get(key);
  if (!session) {
    session = createToolTelemetry({ slug, locale, tier }, window.location.hostname, (event, payload) => {
      const analyticsWindow = window as Window & { gtag?: (...args: unknown[]) => void };
      if (typeof analyticsWindow.gtag === "function") analyticsWindow.gtag("event", event, payload);
    });
    page.set(key, session);
  }
  return session;
}

/** Stable callbacks; the Document-scoped session also deduplicates island remounts. */
export function useToolTelemetry() {
  const markInteraction = useCallback(() => getSession()?.markInteraction(), []);
  const clearInteraction = useCallback(() => getSession()?.clearInteraction(), []);
  const recordSuccess = useCallback((action: ToolAction) => getSession()?.recordSuccess(action), []);
  return { markInteraction, clearInteraction, recordSuccess };
}
