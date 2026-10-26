import { cpSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const esbuild = require('esbuild');

await esbuild.build({
  entryPoints: [resolve(root, 'prisma/seed/seed.ts')],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile: resolve(root, 'dist/seed.js'),
  packages: 'external',
  logLevel: 'info',
});

const dataDir = resolve(root, 'prisma/seed/data');
const outDir = resolve(root, 'dist');
for (const name of ['portfolio-data.json', 'portfolio-unmapped.json']) {
  const from = resolve(dataDir, name);
  if (existsSync(from)) {
    cpSync(from, resolve(outDir, name));
  }
}
