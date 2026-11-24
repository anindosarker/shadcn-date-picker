import { promises as fs } from 'node:fs';
import path from 'node:path';

export interface ExampleFile {
  /** Path relative to the demos folder, for example `date.tsx`. */
  path: string;
  source: string;
}

type ExampleSources = Record<string, ExampleFile[]>;

/**
 * demos/sources.json, written by lib/example-variants.mjs (before `build`,
 * `predev` and `types:check`). One literal path, so the bundler resolves the
 * file at build time instead of tracing the whole demos tree.
 */
const SOURCES = () =>
  fs.readFile(path.join(process.cwd(), 'demos/sources.json'), 'utf8');

/**
 * The hand-written demos/<name>.tsx the playground shows, the leading
 * 'use client' directive stripped. It imports `@/components/date-picker/...`,
 * the path a user has after install; the base's variant under demos/.<base>
 * (lib/example-variants.mjs) only feeds the live demo.
 */
export async function readExampleFiles(name: string): Promise<ExampleFile[]> {
  const sources = JSON.parse(await SOURCES()) as ExampleSources;
  const files = Object.hasOwn(sources, name) ? sources[name] : undefined;
  if (!files) {
    throw new Error(`No demo "${name}" in demos/`);
  }
  return files;
}
