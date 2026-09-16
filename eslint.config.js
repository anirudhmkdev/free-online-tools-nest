import eslintPluginAstro from "eslint-plugin-astro";
import globals from "globals";
import tseslint from "typescript-eslint";

const browserGlobals = {
  ...globals.browser,
  ...globals.es2024,
};

export default [
  {
    ignores: ["dist/**", ".astro/**", "node_modules/**", "output/playwright/**", ".playwright-cli/**"],
  },
  ...eslintPluginAstro.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: browserGlobals,
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      "no-console": "warn",
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      globals: browserGlobals,
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      "no-console": "warn",
      "no-unused-vars": "off",
      "prefer-const": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    files: ["**/*.astro"],
    rules: {
      "no-var": "off",
      "prefer-rest-params": "off",
      "prefer-const": "off",
    },
  },
];
