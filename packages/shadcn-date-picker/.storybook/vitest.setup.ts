import { setProjectAnnotations } from "@storybook/react-vite"
import { configure } from "storybook/test"
import { afterEach, beforeAll } from "vitest"
import { commands, page, userEvent } from "vitest/browser"
import * as projectAnnotations from "./preview"

const project = setProjectAnnotations([projectAnnotations])

beforeAll(project.beforeAll)

// CI runs about 3.5 times slower than a laptop; plays wait on conditions.
configure({ asyncUtilTimeout: 5000 })

declare module "vitest/browser" {
  interface BrowserCommands {
    resetPointer: () => Promise<void>
  }
}

// Real keyboard and viewport for plays that type into the browser's own date
// boxes; only the Vitest run has them (stories/support/play.ts).
Object.assign(globalThis, { dpBrowser: { userEvent, page } })

afterEach(async () => {
  await commands.resetPointer()
  await page.viewport(1280, 800)
})
