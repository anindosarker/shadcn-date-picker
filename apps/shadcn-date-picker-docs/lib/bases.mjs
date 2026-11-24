// The picker's bases for the docs app, in reader order. Literals with no node
// imports so client code can bundle it; lib/registry-trees.mjs fails the
// build when it differs from tools/bases.mjs of the repository.
export const BASES = Object.freeze(['base', 'radix', 'aria']);
export const DEFAULT_BASE = 'base';

export const BASE_LABELS = Object.freeze({
  base: 'Base UI',
  radix: 'Radix UI',
  aria: 'React Aria',
});
