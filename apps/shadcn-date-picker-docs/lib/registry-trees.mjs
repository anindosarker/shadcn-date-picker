#!/usr/bin/env node
/**
 * Copies each base's picker tree (registry/<base>/components/date-picker and
 * hooks of packages/shadcn-date-picker) into the app's registry/<base>/
 * (gitignored). Its `@/components/ui/` imports point at the app's
 * components/ui-<base>/, the table docs' parts that follow the chosen style;
 * its other `@/components/` and `@/hooks/` imports point at the copy by the
 * same rewrite the demos get (lib/example-variants.mjs). Stale files are
 * removed. Never writes under the package's registry/.
 *
 * Runs first in `build`, `predev` and `types:check`, and fails when the base
 * list of lib/bases.mjs differs from tools/bases.mjs.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as repoBases from '../../../tools/bases.mjs';
import * as docsBases from './bases.mjs';
import { rewriteImports } from './example-variants.mjs';

const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FOLDERS = ['components/date-picker', 'hooks'];

const describe = (list) =>
  `BASES ${JSON.stringify(list.BASES)}, DEFAULT_BASE ${JSON.stringify(list.DEFAULT_BASE)}`;

if (describe(repoBases) !== describe(docsBases)) {
  console.error(
    `lib/bases.mjs differs from tools/bases.mjs:\n  docs: ${describe(docsBases)}\n  repository: ${describe(repoBases)}`,
  );
  process.exit(1);
}

/** Every file under `dir`, relative to it with `/` separators. */
const listFiles = async (dir) => {
  const files = [];
  for (const entry of await fs.readdir(dir, {
    withFileTypes: true,
    recursive: true,
  })) {
    if (!entry.isFile()) continue;
    files.push(
      path
        .relative(dir, path.join(entry.parentPath, entry.name))
        .split(path.sep)
        .join('/'),
    );
  }
  return files.sort();
};

for (const base of docsBases.BASES) {
  const out = path.join(APP, 'registry', base);
  let count = 0;
  const written = new Set();
  for (const folder of FOLDERS) {
    const from = path.join(repoBases.PACKAGE, 'registry', base, folder);
    for (const rel of await listFiles(from)) {
      const source = await fs.readFile(path.join(from, rel), 'utf8');
      const target = path.join(out, folder, rel);
      await fs.mkdir(path.dirname(target), { recursive: true });
      const text = rewriteImports(source, base).replaceAll(
        `@/registry/${base}/components/ui/`,
        `@/components/ui-${base}/`,
      );
      const current = await fs.readFile(target, 'utf8').catch(() => null);
      if (current !== text) await fs.writeFile(target, text);
      written.add(path.join(folder, rel).split(path.sep).join('/'));
      count += 1;
    }
  }
  for (const rel of await listFiles(out)) {
    if (!written.has(rel)) await fs.rm(path.join(out, rel));
  }
  console.log(`registry/${base}: ${count} files`);
}
