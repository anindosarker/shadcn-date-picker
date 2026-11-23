# Registry: one tree per base

Each shadcn base has its own tree: Base UI in `registry/base` (style `base-nova`), Radix UI in `registry/radix` (`radix-nova`), React Aria in `registry/aria` (`aria-nova`). The list lives in `tools/bases.mjs`. `@/` points at one tree: `tsconfig.<base>.json` through `paths`, Vite, Vitest and Storybook through `DP_BASE` (unset means `base`).

```
registry/<base>/
  components/date-picker/   the picker of this base, the source
  generated/components/date-picker/
                            the install files: the source with shadcn's nova style applied,
                            written by pnpm registry:build, never edited by hand
  components/ui/            the shadcn parts of the style, as the shadcn CLI writes them
  hooks/use-mobile.ts       the shadcn hook, as the CLI writes it
  components.json           the style and aliases the CLI used
  index.css                 Tailwind 4 and the shadcn theme
  registry.ts               the item definition
  registry.json             generated from registry.ts, never edited by hand
registry/styles/style-nova.css
                            shadcn's nova style, the input of the build
registry.json               root catalog the CLI reads for anindosarker/shadcn-date-picker/<item>
```

## Exact copy

`registry/base/components/date-picker/` is the approved code, byte for byte. It is never reformatted, renamed or fixed here. Something it fails is solved in a config (`eslint.config.mjs`, `tsconfig.*.json`), never in the code. Check:

```bash
diff -r <approved folder> registry/base/components/date-picker   # prints nothing
```

## Parts

The parts and the hook are never edited. To add or refresh them for one base, let the shadcn CLI write them in a scratch project that carries the tree's `components.json` and `index.css`, then copy `components/ui/*` and `hooks/*` back:

```bash
R=$PWD S=$(mktemp -d)
cp registry/base/components.json registry/base/index.css "$S"
echo '{ "name": "parts", "private": true }' > "$S/package.json"
echo '{ "compilerOptions": { "baseUrl": ".", "paths": { "@/*": ["./*"] } } }' > "$S/tsconfig.json"
(cd "$S" && "$R/node_modules/.bin/shadcn" add badge button button-group calendar dialog field input-group native-select popover use-mobile --yes --overwrite)
cp "$S"/components/ui/* registry/base/components/ui/ && cp "$S"/hooks/* registry/base/hooks/
```

`git status --short` prints nothing after a rerun.

## Install files

The source uses shadcn's style hook classes (`cn-dialog-close`, `cn-field`, `cn-button-group-orientation-horizontal`), as shadcn's own parts do. The shadcn CLI strips every `cn-*` class when it installs a file, so the build resolves them first, the way shadcn's registry build does: `tools/registry-build.mjs` runs `createStyleMap` and `transformStyle` from `shadcn/utils` with the nova style over each file of `components/date-picker/` and writes the result to `generated/components/date-picker/`. Only the lines with those classes differ from the source.

The items serve the generated files as `registry:component`, so at install the CLI rewrites the imports to the user's aliases. The three places carry nova's classes on every style.

`registry/styles/style-nova.css` is the stock file, unchanged: https://github.com/shadcn-ui/ui/blob/4233ed1caded8c38f4bc14b14afe1f93ebcaf966/apps/v4/registry/styles/style-nova.css (shadcn-ui/ui at 4233ed1; the `shadcn` package does not ship it). To refresh it, replace it with a newer commit's file, update the link and run `pnpm registry:build`.

A base gets its item and generated folder once `registry/<base>/components/date-picker/date-picker.tsx` exists (`readyBases()` in `tools/bases.mjs`); until then its `registry.json` lists no item. ESLint, Prettier and `tsc` skip `generated/`.

## Build and check

- `pnpm registry:build` writes every `registry/<base>/generated/` and `registry/<base>/registry.json`: each item lists every generated file, installed to the user's `components/date-picker/` with the same relative path; its `registryDependencies` are the `@/components/ui/<part>` and `@/hooks/<hook>` imports, its `dependencies` the package imports. Run it after any change to `components/date-picker/`, `registry.ts` or the style file, and commit the result.
- `pnpm registry:check` writes nothing and exits 1 when a generated file is out of step with the source (a changed source file, a hand-edited generated file, a missing or extra generated file), on a stale `registry.json`, or a listed file that does not exist.
- `pnpm typecheck` checks every tree, `pnpm lint` runs ESLint and Prettier.
