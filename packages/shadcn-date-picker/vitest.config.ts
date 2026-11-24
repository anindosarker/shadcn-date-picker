import path from "node:path"
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin"
import { playwright } from "@vitest/browser-playwright"
import { defineConfig, mergeConfig } from "vitest/config"
import type { BrowserCommand } from "vitest/node"
import viteConfig, { DP_BASE } from "./vite.config"
import { PACKAGE } from "../../tools/bases.mjs"

// A play that moved the real pointer leaves it over the next story's canvas.
const resetPointer: BrowserCommand<[]> = async ({ page }) => {
  await page.mouse.move(-1, -1)
}

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      projects: [
        {
          extends: true,
          plugins: [
            storybookTest({
              configDir: path.join(PACKAGE, ".storybook"),
              storybookScript: "storybook dev -p 5359 --ci",
              storybookUrl: "http://localhost:5359",
            }),
            {
              // One dep cache per base, so a base switch never reads stale deps.
              name: "dp-base-cache-dir",
              enforce: "post",
              config: (config) =>
                config.cacheDir
                  ? { cacheDir: `${config.cacheDir}-${DP_BASE}` }
                  : undefined,
            },
          ],
          test: {
            name: "storybook",
            browser: {
              enabled: true,
              // The browser's own date boxes order their parts by the browser's language.
              provider: playwright({
                launchOptions: { args: ["--lang=en-US"] },
                contextOptions: { locale: "en-US" },
              }),
              headless: true,
              viewport: { width: 1280, height: 800 },
              instances: [{ browser: "chromium" }],
              commands: { resetPointer },
            },
            setupFiles: ["./.storybook/vitest.setup.ts"],
            testTimeout: 60_000,
          },
        },
      ],
    },
  })
)
