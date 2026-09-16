// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import { isSitemapEligible } from "./src/data/page-policy";

export default defineConfig({
  integrations: [
    react(),
    sitemap({ filter: isSitemapEligible }),
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
