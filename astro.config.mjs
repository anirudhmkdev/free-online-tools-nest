// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  integrations: [
    react(),
    sitemap({
      filter: (page) => {
        const url = new URL(page);
        const path = url.pathname;

        // Always include structural pages
        if (
          path === "/" ||
          path === "/tools/" ||
          path === "/categories/" ||
          path === "/blog/" ||
          path === "/about/" ||
          path === "/standards/"
        )
          return true;

        // All 7 category pages
        if (/^\/categories\/[\w-]+\/$/.test(path)) return true;

        // All 3 blog posts
        if (/^\/blog\/[\w-]+\/$/.test(path)) return true;

        // Content-rich tool pages (those with additionalContent sections)
        const contentRichSlugs = [
          "word-counter",
          "json-formatter",
          "qr-code-generator",
          "color-converter",
          "image-compressor",
          "pdf-merger",
          "pdf-compressor",
          "grammar-checker",
          "word-cloud-generator",
          "jwt-decoder",
          "epoch-converter",
        ];

        // Tier 2 — remaining high-value tools
        const tier2Slugs = [
          "character-counter",
          "unit-converter",
          "csv-to-json",
          "password-generator",
          // Text tools
          "case-converter",
          "text-analyzer",
          "text-diff",
          "text-humanizer",
          "plagiarism-checker",
          "readability-score",
          "lorem-ipsum-generator",
          // Developer tools
          "url-encoder-decoder",
          "base64-encoder-decoder",
          "html-formatter",
          "regex-tester",
          "html-to-markdown",
          "sql-formatter",
          "css-minifier",
          "uuid-generator",
          // Converters
          "markdown-to-html",
          "image-resizer",
          "image-cropper",
          "json-to-csv",
          "temperature-converter",
          // Calculators
          "percentage-calculator",
          "age-calculator",
          "bmi-calculator",
          "discount-calculator",
          "loan-calculator",
          // SEO tools
          "meta-tag-generator",
          "sitemap-generator",
          "keyword-density-checker",
          "serp-preview-generator",
          "schema-markup-generator",
          // PDF tools
          "pdf-splitter",
          "pdf-to-text",
          // Design tools
          "color-contrast-checker",
          "gradient-generator",
          "color-palette-generator",
        ];

        const toolSlug = path.match(/^\/tools\/([\w-]+)\/$/)?.[1];
        if (toolSlug && (contentRichSlugs.includes(toolSlug) || tier2Slugs.includes(toolSlug)))
          return true;

        return false;
      },
    }),
  ],
  site: "https://freeonlinetoolsnest.com",
  trailingSlash: "always",
  build: {
    format: "directory",
  },
  vite: {
    esbuild: {
      jsxDev: false,
    },
    plugins: [tailwindcss()],
  },
  server: {
    host: true,
  },
});
