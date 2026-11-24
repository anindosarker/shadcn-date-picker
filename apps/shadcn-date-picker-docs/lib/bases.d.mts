export const BASES: readonly ['base', 'radix', 'aria'];
export type Base = (typeof BASES)[number];
export const DEFAULT_BASE: 'base';
export const BASE_LABELS: Readonly<Record<Base, string>>;
