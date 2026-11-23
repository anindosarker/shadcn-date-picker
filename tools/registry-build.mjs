// pnpm registry:build writes registry/<base>/registry.json from registry.ts;
// pnpm registry:check (--check) writes nothing and exits 1 on a stale file or
// an item file that does not exist.
import fs from "node:fs"
import path from "node:path"
import { pathToFileURL } from "node:url"
import * as prettier from "prettier"
import { registrySchema } from "shadcn/schema"
import { BASES, ROOT } from "./bases.mjs"

const CHECK = process.argv.includes("--check")
const PICKER = "components/date-picker"

const walk = (dir) =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const p = path.join(dir, entry.name)
      return entry.isDirectory() ? walk(p) : [p]
    })
    .sort()

const posix = (p) => p.split(path.sep).join("/")

const packageName = (specifier) =>
  specifier
    .split("/")
    .slice(0, specifier.startsWith("@") ? 2 : 1)
    .join("/")

// registryDependencies from the `@/components/ui/<part>` and `@/hooks/<hook>`
// imports, dependencies from the package imports (react is the user's own).
const importsOf = (files) => {
  const registryDependencies = new Set()
  const dependencies = new Set()
  for (const file of files) {
    const source = fs.readFileSync(file, "utf8")
    for (const [, specifier] of source.matchAll(
      /(?:from|import)\s+["']([^"']+)["']/g
    )) {
      const local = specifier.match(/^@\/(?:components\/ui|hooks)\/([^/]+)$/)
      if (local) registryDependencies.add(local[1])
      else if (specifier.startsWith(".") || specifier.startsWith("@/")) continue
      else if (!["react", "react-dom"].includes(packageName(specifier)))
        dependencies.add(packageName(specifier))
    }
  }
  return {
    dependencies: [...dependencies].sort(),
    registryDependencies: [...registryDependencies].sort(),
  }
}

const buildItem = (treeDir, item) => {
  const files = walk(path.join(treeDir, PICKER))
  return {
    ...item,
    ...importsOf(files),
    files: files.map((file) => {
      const rel = posix(path.relative(treeDir, file))
      // registry:file is written as is; the CLI's code transforms would drop the cn-* classes of the exact copy.
      return { path: rel, type: "registry:file", target: `@${rel}` }
    }),
  }
}

let failed = false
for (const base of BASES) {
  const treeDir = path.join(ROOT, "registry", base)
  const out = path.join(treeDir, "registry.json")
  const { registry } = await import(
    pathToFileURL(path.join(treeDir, "registry.ts")).href
  )
  const built = {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    ...registry,
    items: registry.items.map((item) => buildItem(treeDir, item)),
  }
  registrySchema.parse(built)
  const text = await prettier.format(JSON.stringify(built), {
    ...(await prettier.resolveConfig(out)),
    filepath: out,
  })
  const rel = posix(path.relative(ROOT, out))
  const summary = built.items
    .map((item) => `${item.name} (${item.files.length} files)`)
    .join(", ")

  if (!CHECK) {
    fs.writeFileSync(out, text)
    console.log(`${rel}: ${summary || "no items"}`)
    continue
  }
  const committed = fs.existsSync(out) ? fs.readFileSync(out, "utf8") : ""
  const missing = committed
    ? JSON.parse(committed)
        .items.flatMap((item) => item.files)
        .map((file) => file.path)
        .filter((p) => !fs.existsSync(path.join(treeDir, p)))
    : []
  for (const p of missing) console.error(`${rel}: item file missing: ${p}`)
  if (committed !== text)
    console.error(`${rel}: stale, run pnpm registry:build`)
  if (missing.length || committed !== text) failed = true
  else console.log(`${rel}: up to date, ${summary || "no items"}`)
}
process.exit(failed ? 1 : 0)
