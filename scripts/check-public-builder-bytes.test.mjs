import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { gzipSync } from 'node:zlib';

import { inspectPublicBundles } from './check-public-builder-bytes.mjs';

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'public-bundle-'));
  const site = join(root, 'server/app/[locale]/(site)');
  const chunk = '/_next/static/chunks/public.js';
  mkdirSync(join(site, '[...rest]'), { recursive: true });
  mkdirSync(join(root, 'static/chunks'), { recursive: true });
  function route(directory, module = 'src/modules/home/Home.tsx') {
    mkdirSync(directory, { recursive: true });
    writeFileSync(
      join(directory, 'page_client-reference-manifest.js'),
      `globalThis.__RSC_MANIFEST = { page: { clientModules: { ${JSON.stringify(module)}: { chunks: [${JSON.stringify(chunk)}] } } } };`,
    );
  }
  route(join(site, '[...rest]'));
  route(join(site, 'about'));
  route(join(site, 'r3-loading-test'), 'src/modules/admin-pages/fixture.tsx');
  const chunkFile = join(root, 'static/chunks/public.js');
  writeFileSync(chunkFile, 'console.log("public")');
  return { root, site, route, chunkFile };
}

test('deduplicates public route chunks, excludes only the gated fixture, and enforces gzip cap', () => {
  const { root, chunkFile } = fixture();
  try {
    const bytes = gzipSync('console.log("public")', { mtime: 0 }).byteLength;
    const result = inspectPublicBundles(root, bytes);
    assert.equal(result.routes.length, 2);
    assert.equal(result.chunks.length, 1);
    assert.equal(result.gzipBytes, bytes);
    assert.equal(
      result.publishedTreeRoute.manifest,
      '[locale]/(site)/[...rest]/page_client-reference-manifest.js',
    );
    assert.deepEqual(result.publishedTreeRoute.chunks, ['/_next/static/chunks/public.js']);
    assert.equal(result.publishedTreeRoute.gzipBytes, bytes);
    writeFileSync(chunkFile, 'console.log("public route grew")');
    assert.throws(() => inspectPublicBundles(root, bytes), /gzip exceed/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('rejects forbidden builder references in route manifests and emitted bytes', () => {
  const { root, site, route, chunkFile } = fixture();
  try {
    route(join(site, 'about'), 'src/modules/admin-pages/BuilderShell.tsx');
    assert.throws(() => inspectPublicBundles(root, 1024), /Builder\/editor module/);
    route(join(site, 'about'));
    route(join(site, '[...rest]'), 'src/modules/admin-pages/BuilderShell.tsx');
    assert.throws(() => inspectPublicBundles(root, 1024), /Builder\/editor module/);
    route(join(site, '[...rest]'));
    writeFileSync(chunkFile, 'import "cms-core/react";');
    assert.throws(() => inspectPublicBundles(root, 1024), /Builder\/editor bytes/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('requires the actual public catch-all route', () => {
  const { root, site } = fixture();
  try {
    rmSync(join(site, '[...rest]'), { recursive: true });
    assert.throws(() => inspectPublicBundles(root, 1024), /Published-tree catch-all manifest/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
