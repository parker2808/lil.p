import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**'] },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    plugins: { 'simple-import-sort': simpleImportSort },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@portfolio/*', '@/modules/*', 'apps/*', 'packages/*'],
              message: 'Import only package or public peer modules.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['scripts/**/*.{js,mjs}', 'test/**/*.{js,mjs}'],
    languageOptions: { globals: { console: 'readonly', process: 'readonly' } },
  },
  eslintConfigPrettier,
);
