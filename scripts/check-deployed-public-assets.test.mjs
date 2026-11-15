import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { test } from 'node:test';

import { verifyDeployedPublicAssets } from './check-deployed-public-assets.mjs';

const payload = Buffer.from('public JS bytes');
const path = '/_next/static/chunks/public.js';
const report = {
  sourceSha: 'a'.repeat(40),
  checkoutSha: 'a'.repeat(40),
  publishedTreeRoute: { chunks: [path] },
  routes: [
    { manifest: '[locale]/(site)/[...rest]/page_client-reference-manifest.js', chunks: [path] },
  ],
  chunks: [{ path, sha256: createHash('sha256').update(payload).digest('hex') }],
};

test('compares each deployed public asset byte-for-byte with the exact build head', async () => {
  const fetched = [];
  const result = await verifyDeployedPublicAssets(
    report,
    'https://example.test/vi',
    async (url) => {
      fetched.push(url.href);
      return new globalThis.Response(payload);
    },
  );
  assert.deepEqual(fetched, ['https://example.test/_next/static/chunks/public.js']);
  assert.equal(result.checked, 1);
  await assert.rejects(
    verifyDeployedPublicAssets(
      report,
      'https://example.test',
      async () => new globalThis.Response('wrong'),
    ),
    /Deployed asset differs/,
  );
});

test('rejects missing provenance, unsafe paths, missing published chunks and HTTP deployments', async () => {
  const fetchAsset = async () => new globalThis.Response(payload);
  for (const invalid of [
    { ...report, checkoutSha: 'b'.repeat(40) },
    { ...report, chunks: [{ ...report.chunks[0], sha256: null }] },
    { ...report, publishedTreeRoute: { chunks: ['/missing.js'] } },
    { ...report, chunks: [{ ...report.chunks[0], path: '/_next/static/chunks/../../bad.js' }] },
  ]) {
    await assert.rejects(verifyDeployedPublicAssets(invalid, 'https://example.test', fetchAsset));
  }
  await assert.rejects(
    verifyDeployedPublicAssets(report, 'http://example.test', fetchAsset),
    /HTTPS/,
  );
});
