import reactHooks from "eslint-plugin-react-hooks"
import { defineConfig, globalIgnores } from "eslint/config"
import tseslint from "typescript-eslint"

export default defineConfig([
  // Parts and the hook are what `shadcn add` writes for each style, the
  // generated folder what pnpm registry:build writes; never edited.
  globalIgnores([
    "docs",
    "storybook-static",
    "registry/*/components/ui",
    "registry/*/hooks",
    "registry/*/generated",
  ]),
  {
    files: ["**/*.{ts,tsx,mjs}"],
    extends: [
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
    ],
    linterOptions: { reportUnusedDisableDirectives: "error" },
  },
])
