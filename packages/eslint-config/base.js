import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
  js.configs.recommended,
  ...tseslint.configs.recommended,
  importPlugin.flatConfigs.typescript,
  prettier,
  {
    settings: {
      "import/internal-regex": "^\\$",
    },

    rules: {
      "no-undef": "off",

      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "index",
            "sibling",
            "parent",
          ],
          distinctGroup: false,
          pathGroupsExcludedImportTypes: ["builtin"],
          "newlines-between": "always",
          named: { enabled: true, import: true, export: false, types: "mixed" },
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],

      curly: "error",
      "import/first": "error",
      "import/newline-after-import": "error",
      "import/no-duplicates": [
        "error",
        {
          "prefer-inline": true,
          considerQueryString: true,
        },
      ],
    },
  },
]);
