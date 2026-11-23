import { setProjectAnnotations } from "@storybook/react-vite"
import { afterEach, beforeAll } from "vitest"
import { commands, page, userEvent } from "vitest/browser"
import * as projectAnnotations from "./preview"

const project = setProjectAnnotations([projectAnnotations])

beforeAll(project.beforeAll)

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
