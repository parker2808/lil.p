import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import react from 'eslint-plugin-react';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/coverage/**',
      '**/uploads/**',
      '**/storybook-static/**',
      '**/src/generated/**',
    ],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
  {
    files: ['scripts/**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
      },
    },
  },
  {
    files: [
      'packages/ui/src/components/**/*.{js,jsx,ts,tsx}',
      'src/components/**/*.{js,jsx,ts,tsx}',
    ],
    ignores: ['**/*.{test,stories}.{js,jsx,ts,tsx}'],
    plugins: { react },
    rules: {
      'react/jsx-no-literals': [
        'error',
        {
          noStrings: true,
          allowedStrings: ['·', '→', '—', '>', '_'],
          ignoreProps: true,
        },
      ],
    },
  },
  eslintConfigPrettier,
);
