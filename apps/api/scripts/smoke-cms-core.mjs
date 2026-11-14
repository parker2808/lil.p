import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const apiRoot = path.resolve(
  process.argv[2] ?? path.join(path.dirname(fileURLToPath(import.meta.url)), '..'),
);
const requireFromApi = createRequire(path.join(apiRoot, 'package.json'));

for (const subpath of ['contracts', 'engine']) {
  const moduleName = `@parker2808/cms-core/${subpath}`;
  assert.match(requireFromApi.resolve(moduleName), new RegExp(`[\\/]dist[\\/]${subpath}\\.cjs$`));
  assert.equal(typeof requireFromApi(moduleName), 'object');
}

assert.equal(typeof requireFromApi('@parker2808/cms-core/contracts').createRegistry, 'function');
