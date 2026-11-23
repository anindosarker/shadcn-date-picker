// The site: one static Storybook per ready base under storybook-static/<base>.
import { execFileSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import { ROOT, readyBases } from "./bases.mjs"

const out = path.join(ROOT, "storybook-static")
const bases = readyBases()

fs.rmSync(out, { recursive: true, force: true })
for (const base of bases) {
  execFileSync("storybook", ["build", "--quiet", "-o", path.join(out, base)], {
    cwd: ROOT,
    stdio: "inherit",
    env: { ...process.env, DP_BASE: base },
  })
}
