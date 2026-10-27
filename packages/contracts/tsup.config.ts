import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  // In watch mode (pnpm dev) the API compiles in parallel; wiping dist/ would
  // leave it without index.d.ts until the DTS pass finishes.
  clean: !options.watch,
  sourcemap: true,
}));
