import { copyFileSync, readFileSync, writeFileSync } from 'node:fs';

import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    contracts: 'src/contracts.ts',
    engine: 'src/engine.ts',
    tree: 'src/tree.ts',
    react: 'src/react.ts',
    'react/server': 'src/react/server.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  minify: true,
  splitting: false,
  external: ['react', 'react-dom', 'zod'],
  onSuccess: async () => {
    copyFileSync('src/theme/theme.css', 'dist/theme.css');
    const file = 'dist/react.cjs';
    const output = readFileSync(file, 'utf8');
    if (output.startsWith('"use strict";"use client";')) {
      writeFileSync(file, `"use client";${output.replace('"use client";', '')}`);
    }
  },
});
