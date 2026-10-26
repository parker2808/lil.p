import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const allowedStrings = ['·', '→', '—', '>', '_'];

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: [
      'app/**/*.{js,jsx,ts,tsx}',
      'src/modules/**/components/**/*.{js,jsx,ts,tsx}',
      'src/modules/**/views/**/*.{js,jsx,ts,tsx}',
    ],
    ignores: ['**/*.{test,stories}.{js,jsx,ts,tsx}'],
    rules: {
      'react/jsx-no-literals': [
        'error',
        {
          noStrings: true,
          allowedStrings,
          ignoreProps: true,
        },
      ],
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);
