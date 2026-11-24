import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';

const eslintConfig = defineConfig([
  ...nextVitals,
  globalIgnores([
    '.next/**',
    'next-env.d.ts',
    '.source/**',
    'components/ui-radix/**',
    'registry/**',
    'demos/.*/**',
    'lib/bases.d.mts',
  ]),
]);

export default eslintConfig;
