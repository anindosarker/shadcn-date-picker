// Install commands for the library item. Pure: safe to
// import from server components, client components and the page checks'
// expectations.
import { DEFAULT_BASE, BASE_LABELS, BASES, type Base } from './bases.mjs';
import pkg from '../../../packages/shadcn-date-picker/package.json';
import { gitConfig } from './shared';

export const packageManagers = ['pnpm', 'npm', 'yarn', 'bun'] as const;
export type PackageManager = (typeof packageManagers)[number];

const runners: Record<PackageManager, string> = {
  pnpm: 'pnpm dlx shadcn@latest',
  npm: 'npx shadcn@latest',
  yarn: 'yarn shadcn@latest',
  bun: 'bunx --bun shadcn@latest',
};

/**
 * The shadcn bases the table supports, as `shadcn init --base` names them, in
 * reader order: the library's BASES (Base UI, Radix UI, React Aria). The docs'
 * base selector (components/base-selector.tsx) picks one; a project's base is
 * the `style` in its `components.json` (`base-*`, `radix-*` or `aria-*`, the
 * React Aria base's style being `aria-nova`).
 */
export const bases = BASES;
export type { Base };
/** The base shown before the reader picks one (DEFAULT_BASE, Base UI). */
export const defaultBase: Base = DEFAULT_BASE;

/** Reader-facing name per base, the library's BASE_LABELS. */
export const baseLabels: Readonly<Record<Base, string>> = BASE_LABELS;

export const isBase = (value: unknown): value is Base =>
  bases.includes(value as Base);

/** The same value for every base, keyed by base. */
export const perBase = <T>(fn: (base: Base) => T): Record<Base, T> =>
  Object.fromEntries(bases.map((base) => [base, fn(base)])) as Record<Base, T>;

/**
 * `shadcn add` of the picker for a base with the given package manager, at the
 * tag of this build's version.
 */
export const addCommand = (base: Base, pm: PackageManager): string =>
  `${runners[pm]} add ${gitConfig.user}/${gitConfig.repo}/date-picker-${base}#v${pkg.version}`;

/** `shadcn add` of the library item for a base. */
export const libraryAddCommand = (
  base: Base = defaultBase,
  pm: PackageManager = 'pnpm',
) => addCommand(base, pm);
