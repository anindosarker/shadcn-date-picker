import type { StorybookConfig } from "@storybook/react-vite"
import { resolveBase } from "../tools/bases.mjs"

const DP_BASE = resolveBase(process.env.DP_BASE)

const config: StorybookConfig = {
  stories: ["../stories/**/*.mdx", "../stories/**/*.stories.tsx"],
  addons: ["@storybook/addon-docs", "@storybook/addon-vitest"],
  framework: { name: "@storybook/react-vite", options: {} },
  core: { disableTelemetry: true },
  // Storybook keys its dep cache by the config dir alone; one cache per base.
  viteFinal: (config) =>
    config.cacheDir
      ? { ...config, cacheDir: `${config.cacheDir}-${DP_BASE}` }
      : config,
}

export default config
