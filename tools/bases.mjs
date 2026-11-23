// One tree per shadcn base, registry/<base>; `@/` points at one of them
// (DP_BASE, unset means DEFAULT_BASE).
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

export const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
)
export const BASES = Object.freeze(["base", "radix", "aria"])
export const DEFAULT_BASE = "base"

export const resolveBase = (value) =>
  BASES.find((base) => base === value) ?? DEFAULT_BASE

export const readyBases = () =>
  BASES.filter((base) =>
    fs.existsSync(
      path.join(
        ROOT,
        "registry",
        base,
        "components/date-picker/date-picker.tsx"
      )
    )
  )
