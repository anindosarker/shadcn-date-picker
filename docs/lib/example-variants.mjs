#!/usr/bin/env node
/**
 * Per-base variants of the docs demos. demos/<name>.tsx is the hand-written
 * source, the same for every base. It imports `@/components/date-picker/...`,
 * the path a user has after `shadcn add`; the code view shows it as is. The
 * docs app holds the three picker trees side by side (lib/registry-trees.mjs,
 * under registry/<base>), so for each base every demo is copied to
 * demos/<variant dir>/<name>.tsx (gitignored, folder names in
 * lib/example-variant-dir.mjs) with its `@/components/` and `@/hooks/`
 * imports pointed at `@/registry/<base>/`. Nothing else changes.
 * components/example-variant.tsx lazy-loads the variant for the selected base;
 * the output is formatted with the docs app's prettier config. demos/
 * sources.json holds the hand-written files the code view shows
 * (lib/example-source.ts reads it from a fixed path, so the docs build does
 * not trace the demos tree).
 *
 * Runs before `next build` and `next dev` (package.json `build`, `predev`).
 * Stale variant files are removed.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import prettier from 'prettier';
import { stripDirective } from './example-files.mjs';
import { VARIANT_DIRS } from './example-variant-dir.mjs';

const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEMOS = path.join(APP, 'demos');

/**
 * demos/sources.json: { [name]: ExampleFile[] }, the files the code view
 * shows (lib/example-source.ts), with the leading 'use client' directive
 * stripped.
 */
const SOURCES_FILE = 'sources.json';

/**
 * `@/components/...` and `@/hooks/...` imports to the base's tree copy under
 * registry/<base>. Both quote styles; nothing else changes.
 * @param {string} source
 * @param {keyof typeof VARIANT_DIRS} base
 */
export const rewriteImports = (source, base) =>
  source.replace(
    /(['"])@\/(components|hooks)\//g,
    `$1@/registry/${base}/$2/`,
  );

/**
 * One base's variant of one example source file, formatted.
 * @param {{ source: string, fileName: string, base: keyof typeof VARIANT_DIRS }} file
 *   fileName is absolute, for prettier's parser choice
 */
export const toVariant = async ({ source, fileName, base }) => {
  const text = rewriteImports(source, base);
  if (text === source) return source;
  const config = await prettier.resolveConfig(fileName);
  return prettier.format(text, { ...config, filepath: fileName });
};

/** The demo names: every .tsx file directly in demos/. */
const listDemos = async () =>
  (await fs.readdir(DEMOS, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith('.tsx'))
    .map((entry) => entry.name.slice(0, -'.tsx'.length))
    .sort();

async function main() {
  await fs.mkdir(DEMOS, { recursive: true });
  const names = await listDemos();
  /** @type {Record<string, { path: string, source: string }[]>} */
  const sources = {};
  /** @type {Record<string, string>} */
  const raw = {};
  for (const name of names) {
    const source = await fs.readFile(path.join(DEMOS, `${name}.tsx`), 'utf8');
    raw[name] = source;
    sources[name] = [{ path: `${name}.tsx`, source: stripDirective(source) }];
  }
  // The code view's sources: the hand-written files, not the variants.
  await fs.writeFile(
    path.join(DEMOS, SOURCES_FILE),
    `${JSON.stringify(sources)}\n`,
  );
  for (const [base, variantDir] of Object.entries(VARIANT_DIRS)) {
    const out = path.join(DEMOS, variantDir);
    await fs.mkdir(out, { recursive: true });
    for (const name of names) {
      const target = path.join(out, `${name}.tsx`);
      await fs.writeFile(
        target,
        await toVariant({ source: raw[name], fileName: target, base }),
      );
    }
    // Variant files whose demo is gone.
    const kept = new Set(names.map((name) => `${name}.tsx`));
    for (const entry of await fs.readdir(out, { withFileTypes: true })) {
      if (!kept.has(entry.name)) {
        await fs.rm(path.join(out, entry.name), { recursive: true });
      }
    }
    console.log(`demos/${variantDir}: ${names.length} demos`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
