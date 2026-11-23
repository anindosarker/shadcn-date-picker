# Registry: one tree per base

Each shadcn base has its own tree: Base UI in `registry/base` (style `base-nova`), Radix UI in `registry/radix` (`radix-nova`), React Aria in `registry/aria` (`aria-nova`). The list lives in `tools/bases.mjs`. `@/` points at one tree: `tsconfig.<base>.json` through `paths`, Vite, Vitest and Storybook through `DP_BASE` (unset means `base`).

```
registry/<base>/
  components/date-picker/   the picker of this base, installed to the user's components/date-picker/
  components/ui/            the shadcn parts of the style, as the shadcn CLI writes them
  hooks/use-mobile.ts       the shadcn hook, as the CLI writes it
  components.json           the style and aliases the CLI used
  index.css                 Tailwind 4 and the shadcn theme
  registry.ts               the item definition
  registry.json             generated from registry.ts, never edited by hand
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

## Build and check

- `pnpm registry:build` writes every `registry/<base>/registry.json`: each item lists every file under its `components/date-picker/`, its `registryDependencies` are the `@/components/ui/<part>` and `@/hooks/<hook>` imports, its `dependencies` the package imports.
- `pnpm registry:check` writes nothing and exits 1 on a stale `registry.json` or a listed file that does not exist.
- `pnpm typecheck` checks every tree, `pnpm lint` runs ESLint and Prettier.
