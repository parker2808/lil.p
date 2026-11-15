import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { runInNewContext } from 'node:vm';

const buildRoot = join(process.cwd(), 'apps/web/.next');
const serverRoot = join(buildRoot, 'server/app');

function manifests(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory()
      ? manifests(path)
      : entry.name === 'page_client-reference-manifest.js' && path.includes('/(site)/')
        ? [path]
        : [];
  });
}

const paths = manifests(serverRoot);
assert.ok(paths.length, 'Public custom-page client reference manifest is missing');
assert.ok(
  paths.some((path) => path.includes('/(site)/[...rest]/')),
  'Public custom-page client reference manifest is missing',
);
const forbidden =
  /(?:modules\/admin-|SchemaForm|BuilderShell|BlockInspector|cms-core\/react(?!\/server))/i;
let inspected = 0;
for (const path of paths) {
  const context = { globalThis: {} };
  runInNewContext(readFileSync(path, 'utf8'), context);
  const manifests = Object.values(context.globalThis.__RSC_MANIFEST ?? {});
  assert.ok(manifests.length, `Missing route entries in ${path}`);
  const modules = manifests.flatMap((manifest) => Object.entries(manifest.clientModules ?? {}));
  for (const [module] of modules) {
    assert.doesNotMatch(module, forbidden, `Builder/editor module in ${path}`);
  }
  const chunks = new Set(
    modules.flatMap(([, entry]) => entry.chunks ?? []).filter((chunk) => chunk.endsWith('.js')),
  );
  assert.ok(chunks.size, `No public client chunks in ${path}`);
  for (const chunk of chunks) {
    assert.ok(chunk.startsWith('/_next/static/chunks/'), `Unexpected chunk path ${chunk}`);
    const file = join(buildRoot, chunk.slice('/_next/'.length));
    assert.ok(existsSync(file), `Missing public client chunk ${chunk}`);
    assert.doesNotMatch(readFileSync(file, 'utf8'), forbidden, `Builder/editor bytes in ${chunk}`);
    inspected += 1;
  }
}
console.log(
  `Public routes: ${paths.length} manifests, ${inspected} chunks; zero builder/editor bytes`,
);
