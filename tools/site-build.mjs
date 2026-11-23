// The site: one static Storybook per ready base, a landing page and version.txt.
import { execFileSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import { ROOT, readyBases } from "./bases.mjs"

const out = path.join(ROOT, "storybook-static")
const bases = readyBases()
const { version } = JSON.parse(
  fs.readFileSync(path.join(ROOT, "package.json"), "utf8")
)
const names = { base: "Base UI", radix: "Radix UI", aria: "React Aria" }

fs.rmSync(out, { recursive: true, force: true })
for (const base of bases) {
  execFileSync("storybook", ["build", "--quiet", "-o", path.join(out, base)], {
    cwd: ROOT,
    stdio: "inherit",
    env: { ...process.env, DP_BASE: base },
  })
}

const items = bases
  .map(
    (base) => `      <li>
        <h2>${names[base]}</h2>
        <pre><code>pnpm dlx shadcn@latest add anindosarker/shadcn-date-picker/date-picker-${base}</code></pre>
        <a href="./${base}/">Storybook</a>
      </li>`
  )
  .join("\n")

fs.writeFileSync(
  path.join(out, "index.html"),
  `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>shadcn-date-picker</title>
    <style>
      body { font-family: system-ui, sans-serif; max-width: 40rem; margin: 3rem auto; padding: 0 1rem; line-height: 1.5; }
      ul { list-style: none; padding: 0; }
      pre { overflow-x: auto; padding: 0.75rem; background: #f4f4f5; border-radius: 0.5rem; }
    </style>
  </head>
  <body>
    <h1>shadcn-date-picker</h1>
    <p>A date picker for shadcn/ui: date, date and time, time, week, month and year, one value or a range. It is installed into your project with the shadcn CLI and uses the shadcn parts of your own style.</p>
    <ul>
${items}
    </ul>
    <p><a href="https://github.com/anindosarker/shadcn-date-picker">GitHub</a> · version ${version}</p>
  </body>
</html>
`
)
fs.writeFileSync(path.join(out, "version.txt"), `${version}\n`)
