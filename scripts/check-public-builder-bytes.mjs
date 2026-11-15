import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import { gzipSync } from 'node:zlib';

const BASELINE_GZIP_BYTES = 90_291;
const MAX_GZIP_BYTES = 102_400;
const PUBLISHED_TREE_MANIFEST = '[locale]/(site)/[...rest]/page_client-reference-manifest.js';
const forbidden =
  /(?:modules\/admin-|SchemaForm|BuilderShell|BlockInspector|cms-core\/react(?!\/server))/i;

function manifests(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory()
      ? manifests(path)
      : entry.name === 'page_client-reference-manifest.js' &&
          path.includes('/(site)/') &&
          !path.includes('/r3-loading-test/')
        ? [path]
        : [];
  });
}

export function inspectPublicBundles(buildRoot, maxGzipBytes = MAX_GZIP_BYTES) {
  const serverRoot = join(buildRoot, 'server/app');
  const paths = manifests(serverRoot);
  assert.ok(paths.length, 'Public custom-page client reference manifest is missing');
  const publishedTreePath = join(serverRoot, PUBLISHED_TREE_MANIFEST);
  assert.ok(paths.includes(publishedTreePath), 'Published-tree catch-all manifest is missing');
  const routes = [];
  const chunkPaths = new Set();
  for (const path of paths) {
    const context = { globalThis: {} };
    runInNewContext(readFileSync(path, 'utf8'), context);
    const routeManifests = Object.values(context.globalThis.__RSC_MANIFEST ?? {});
    assert.ok(routeManifests.length, `Missing route entries in ${path}`);
    const modules = routeManifests.flatMap((manifest) =>
      Object.entries(manifest.clientModules ?? {}),
    );
    for (const [module] of modules) {
      assert.doesNotMatch(module, forbidden, `Builder/editor module in ${path}`);
    }
    const chunks = new Set(
      modules.flatMap(([, entry]) => entry.chunks ?? []).filter((chunk) => chunk.endsWith('.js')),
    );
    assert.ok(chunks.size, `No public client chunks in ${path}`);
    for (const chunk of chunks) chunkPaths.add(chunk);
    routes.push({ manifest: relative(serverRoot, path), chunks: [...chunks].sort() });
  }

  const chunks = [];
  for (const chunk of [...chunkPaths].sort()) {
    assert.ok(chunk.startsWith('/_next/static/chunks/'), `Unexpected chunk path ${chunk}`);
    assert.ok(!chunk.split('/').includes('..'), `Unexpected chunk path ${chunk}`);
    const file = join(buildRoot, chunk.slice('/_next/'.length));
    assert.ok(existsSync(file), `Missing public client chunk ${chunk}`);
    const contents = readFileSync(file);
    assert.doesNotMatch(contents.toString('utf8'), forbidden, `Builder/editor bytes in ${chunk}`);
    chunks.push({ path: chunk, gzipBytes: gzipSync(contents, { mtime: 0 }).byteLength });
  }
  const gzipBytes = chunks.reduce((total, chunk) => total + chunk.gzipBytes, 0);
  const publishedTreeRoute = routes.find((route) => route.manifest === PUBLISHED_TREE_MANIFEST);
  const chunkSizes = new Map(chunks.map((chunk) => [chunk.path, chunk.gzipBytes]));
  const publishedTreeGzipBytes = publishedTreeRoute.chunks.reduce(
    (total, chunk) => total + chunkSizes.get(chunk),
    0,
  );
  assert.ok(
    gzipBytes <= maxGzipBytes,
    `Public chunks ${gzipBytes} B gzip exceed ${maxGzipBytes} B cap`,
  );
  return {
    publishedTreeRoute: { ...publishedTreeRoute, gzipBytes: publishedTreeGzipBytes },
    routes,
    chunks,
    gzipBytes,
    baselineGzipBytes: BASELINE_GZIP_BYTES,
    maxGzipBytes,
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const result = inspectPublicBundles(join(process.cwd(), 'apps/web/.next'));
  const checkoutSha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  const sourceSha = process.env.PUBLIC_BUNDLE_SOURCE_SHA ?? checkoutSha;
  assert.equal(checkoutSha, sourceSha, 'Public bundle build must use the exact PR head');
  const report = { sourceSha, checkoutSha, ...result };
  if (process.env.PUBLIC_BUNDLE_REPORT) {
    writeFileSync(process.env.PUBLIC_BUNDLE_REPORT, `${JSON.stringify(report, null, 2)}\n`);
  }
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      `### Public bundle guard\nHead: \`${sourceSha}\`; checkout: \`${checkoutSha}\`. ` +
        `Published-tree catch-all: ${result.publishedTreeRoute.chunks.length} chunks, ` +
        `${result.publishedTreeRoute.gzipBytes} B gzip; ` +
        `${result.routes.length} routes, ${result.chunks.length} unique chunks, ` +
        `${result.gzipBytes} B gzip (baseline ${result.baselineGzipBytes} B; cap ${result.maxGzipBytes} B). ` +
        `Zero builder/editor matches.\n`,
    );
  }
  console.log(
    `Published-tree catch-all: ${result.publishedTreeRoute.chunks.length} chunks, ` +
      `${result.publishedTreeRoute.gzipBytes} B gzip; ` +
      `public routes: ${result.routes.length} manifests, ${result.chunks.length} unique chunks; ` +
      `${result.gzipBytes}/${result.maxGzipBytes} B gzip; zero builder/editor bytes; head ${sourceSha}`,
  );
}
