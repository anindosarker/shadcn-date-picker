// pnpm registry:build writes, for every base with a picker, the generated
// install files (registry/<base>/generated/components/date-picker: the source
// run through shadcn's own createStyleMap and transformStyle with the nova
// style) and registry/<base>/registry.json from registry.ts.
// pnpm registry:check (--check) writes nothing and exits 1 when a generated
// file or registry.json is out of step with the source, or an item file is
// missing.
import fs from "node:fs"
import path from "node:path"
import { pathToFileURL } from "node:url"
import * as prettier from "prettier"
import { registrySchema } from "shadcn/schema"
import { createStyleMap, transformStyle } from "shadcn/utils"
import { BASES, ROOT, readyBases } from "./bases.mjs"

const CHECK = process.argv.includes("--check")
const PICKER = "components/date-picker"
const GENERATED = "generated"
const STYLE = path.join(ROOT, "registry/styles/style-nova.css")

const walk = (dir) =>
  fs.existsSync(dir)
    ? fs
        .readdirSync(dir, { withFileTypes: true })
        .flatMap((entry) => {
          const p = path.join(dir, entry.name)
          return entry.isDirectory() ? walk(p) : [p]
        })
        .sort()
    : []

const posix = (p) => p.split(path.sep).join("/")

const packageName = (specifier) =>
  specifier
    .split("/")
    .slice(0, specifier.startsWith("@") ? 2 : 1)
    .join("/")

// registryDependencies from the `@/components/ui/<part>` and `@/hooks/<hook>`
// imports, dependencies from the package imports (react is the user's own).
const importsOf = (sources) => {
  const registryDependencies = new Set()
  const dependencies = new Set()
  for (const source of sources) {
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

const styleMap = createStyleMap(fs.readFileSync(STYLE, "utf8"))

let failed = false
const fail = (message) => {
  console.error(message)
  failed = true
}

const ready = readyBases()
for (const base of BASES) {
  const treeDir = path.join(ROOT, "registry", base)
  const sourceDir = path.join(treeDir, PICKER)
  const generatedDir = path.join(treeDir, GENERATED, PICKER)
  const isReady = ready.includes(base)

  // Generated file contents keyed by their path inside components/date-picker.
  const generated = new Map()
  if (isReady) {
    for (const file of walk(sourceDir)) {
      const rel = posix(path.relative(sourceDir, file))
      const source = fs.readFileSync(file, "utf8")
      generated.set(
        rel,
        /\.(tsx?|jsx?)$/.test(rel)
          ? await transformStyle(source, { styleMap })
          : source
      )
    }
  }

  const { registry } = await import(
    pathToFileURL(path.join(treeDir, "registry.ts")).href
  )
  const built = {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    ...registry,
    items: isReady
      ? registry.items.map((item) => ({
          ...item,
          ...importsOf(generated.values()),
          files: [...generated.keys()].map((rel) => ({
            path: `${GENERATED}/${PICKER}/${rel}`,
            type: "registry:component",
            target: `@components/date-picker/${rel}`,
          })),
        }))
      : [],
  }
  registrySchema.parse(built)

  const out = path.join(treeDir, "registry.json")
  const json = await prettier.format(JSON.stringify(built), {
    ...(await prettier.resolveConfig(out)),
    filepath: out,
  })
  const relOut = posix(path.relative(ROOT, out))
  const relGenerated = posix(path.relative(ROOT, generatedDir))
  const summary = built.items
    .map((item) => `${item.name} (${item.files.length} files)`)
    .join(", ")

  if (!CHECK) {
    fs.rmSync(path.join(treeDir, GENERATED), { recursive: true, force: true })
    for (const [rel, content] of generated) {
      const target = path.join(generatedDir, rel)
      fs.mkdirSync(path.dirname(target), { recursive: true })
      fs.writeFileSync(target, content)
    }
    fs.writeFileSync(out, json)
    console.log(`${relOut}: ${summary || "no items"}`)
    continue
  }

  const before = failed
  const committed = new Map(
    walk(path.join(treeDir, GENERATED)).map((file) => [
      posix(path.relative(generatedDir, file)),
      fs.readFileSync(file, "utf8"),
    ])
  )
  for (const [rel, content] of generated) {
    if (!committed.has(rel)) fail(`${relGenerated}/${rel}: missing`)
    else if (committed.get(rel) !== content)
      fail(`${relGenerated}/${rel}: out of step with the source`)
  }
  for (const rel of committed.keys())
    if (!generated.has(rel)) fail(`${relGenerated}/${rel}: no source file`)

  const committedJson = fs.existsSync(out) ? fs.readFileSync(out, "utf8") : ""
  if (committedJson !== json) fail(`${relOut}: stale`)
  if (committedJson)
    for (const p of JSON.parse(committedJson)
      .items.flatMap((item) => item.files)
      .map((file) => file.path)
      .filter((p) => !fs.existsSync(path.join(treeDir, p))))
      fail(`${relOut}: item file missing: ${p}`)

  if (failed === before)
    console.log(`${relOut}: up to date, ${summary || "no items"}`)
}
if (failed) console.error("run pnpm registry:build")
process.exit(failed ? 1 : 0)
