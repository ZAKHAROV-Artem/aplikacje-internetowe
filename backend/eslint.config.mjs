import pluginJs from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: ["dist/**"],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts}"]
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];
