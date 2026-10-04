import type { Lang } from "../i18n/ui";

export const discoveryLabels: Record<Lang, {
  primary: string;
  more: string;
  filter: string;
  showing: string;
  tool: string;
  tools: string;
  noResults: string;
  noResultsHelp: string;
}> = {
  en: { primary: "Start with these tools", more: "More tools", filter: "Filter tools", showing: "Showing {count} {label}", tool: "tool", tools: "tools", noResults: "No tools match your search.", noResultsHelp: "Try a broader keyword or another category." },
  es: { primary: "Empieza con estas herramientas", more: "Más herramientas", filter: "Filtrar herramientas", showing: "Mostrando {count} {label}", tool: "herramienta", tools: "herramientas", noResults: "Ninguna herramienta coincide con tu búsqueda.", noResultsHelp: "Prueba una palabra más general u otra categoría." },
  hi: { primary: "इन टूल से शुरुआत करें", more: "और टूल", filter: "टूल फ़िल्टर करें", showing: "{count} {label} दिखाए जा रहे हैं", tool: "टूल", tools: "टूल", noResults: "आपकी खोज से कोई टूल नहीं मिला।", noResultsHelp: "कोई सामान्य शब्द या दूसरी श्रेणी आज़माएँ।" },
};
