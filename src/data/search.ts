/** Build-time projection only: never import this module from a client script. */
import { getLocalizedCategories, getLocalizedTools } from "./localized";
import { useTranslations } from "../i18n/utils";
import type { Lang } from "../i18n/ui";
import type { SearchEntry, SearchLabels } from "../helpers/search";
import { getToolDiscoveryTier } from "./tool-discovery";

const closeLabels: Record<Lang, string> = {
  en: "Close search",
  es: "Cerrar búsqueda",
  hi: "खोज बंद करें",
};

export function buildSearchData(lang: Lang, includeKeywords = false) {
  const prefix = lang === "en" ? "" : `/${lang}`;
  const t = useTranslations(lang);
  const entries: SearchEntry[] = [
    ...getLocalizedTools(lang).map((tool) => ({
      type: "tool" as const,
      name: tool.name,
      description: tool.description,
      icon: tool.icon,
      url: `${prefix}/tools/${tool.slug}/`,
      discoveryTier: getToolDiscoveryTier(tool.slug),
      ...(includeKeywords ? { keywords: tool.keywords } : {}),
    })),
    ...getLocalizedCategories(lang).map((category) => ({
      type: "category" as const,
      name: category.name,
      description: category.description,
      icon: category.icon,
      url: `${prefix}/categories/${category.slug}/`,
    })),
  ];
  const labels: SearchLabels = {
    title: t("cmdk.searchTools"),
    placeholder: t("cmdk.placeholder"),
    noResults: t("cmdk.noResults"),
    category: t("cmdk.category"),
    tool: t("cmdk.tool"),
    close: closeLabels[lang],
  };
  return { entries, labels };
}
