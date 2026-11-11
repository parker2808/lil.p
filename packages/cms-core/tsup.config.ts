import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    contracts: 'src/contracts.ts',
    engine: 'src/engine.ts',
    react: 'src/react.ts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
  minify: true,
  splitting: false,
  external: ['react', 'react-dom', 'zod'],
});
