import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  { ignores: ["dist", "public"] },
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  { languageOptions: { globals: globals.node } },
  eslintPluginUnicorn.configs["flat/recommended"],
  {
    extends: [
      pluginJs.configs.recommended,
      ...tseslint.configs.recommended,
      prettier,
    ],
    files: ["**/*.ts"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node,
    },

    rules: {
      ...eslintPluginUnicorn.configs["flat/recommended"].rules,
      "unicorn/no-null": "off",
    },
  },
);
