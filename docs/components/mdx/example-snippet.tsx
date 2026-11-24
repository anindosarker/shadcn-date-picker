import path from 'node:path';
import { readExampleFiles } from '@/lib/example-source';
import { bases, type Base } from '@/lib/install';
import { gitConfig } from '@/lib/shared';
import {
  ExamplePlayground,
  type ExampleVariantData,
} from '@/components/example-playground';
import { ExampleVariant } from '@/components/example-variant';

interface Props {
  /** File name under demos/, also the panel's anchor id. */
  name: string;
}

const LANGS: Record<string, string> = {
  '.tsx': 'tsx',
  '.ts': 'ts',
  '.css': 'css',
  '.json': 'json',
};

/**
 * Server side: reads the hand-written demo (demos/<name>.tsx, with its
 * `@/components/date-picker/` imports) and hands the raw source with its
 * shiki language and GitHub address to the client playground panel, the same
 * for every base, next to the lazily loaded live demo of the selected base.
 * Nothing is highlighted here: the explorer highlights the active file in the
 * browser, so the page carries strings instead of a rendered tree per file.
 */
export const ExampleSnippet = async ({ name }: Props) => {
  const sources = await readExampleFiles(name);
  const variant: ExampleVariantData = {
    files: sources.map((file) => ({
      path: file.path,
      source: file.source,
      lang: LANGS[path.extname(file.path)] ?? 'text',
    })),
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/docs/demos/${name}.tsx`,
  };

  const variants = Object.fromEntries(
    bases.map((base) => [base, variant] as const),
  ) as Record<Base, ExampleVariantData>;

  return (
    <ExamplePlayground name={name} variants={variants}>
      <ExampleVariant name={name} />
    </ExamplePlayground>
  );
};
