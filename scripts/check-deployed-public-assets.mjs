import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

export async function verifyDeployedPublicAssets(report, baseUrl, fetchAsset = globalThis.fetch) {
  const origin = new URL(baseUrl);
  assert.equal(origin.protocol, 'https:', 'Deployment URL must use HTTPS');
  assert.match(report.sourceSha, /^[a-f0-9]{40}$/, 'Missing exact source SHA');
  assert.equal(report.checkoutSha, report.sourceSha, 'Build checkout differs from source SHA');
  assert.ok(report.publishedTreeRoute?.chunks?.length, 'Missing published-tree route');
  assert.ok(report.routes?.length, 'Missing public routes');
  assert.ok(report.chunks?.length, 'Missing build chunk inventory');
  const chunkPaths = new Set(report.chunks.map((chunk) => chunk.path));
  for (const route of report.routes) {
    assert.ok(route.chunks.length, `Empty public route ${route.manifest}`);
    for (const path of route.chunks) {
      assert.ok(chunkPaths.has(path), `Unrecorded route asset ${path}`);
    }
  }
  for (const path of report.publishedTreeRoute.chunks) {
    assert.ok(chunkPaths.has(path), `Unrecorded published-tree asset ${path}`);
  }
  for (const chunk of report.chunks) {
    assert.match(chunk.path, /^\/_next\/static\/chunks\/[a-zA-Z0-9/_-]+\.js$/);
    assert.ok(!chunk.path.split('/').includes('..'), `Unsafe asset path ${chunk.path}`);
    assert.match(chunk.sha256, /^[a-f0-9]{64}$/, `Missing build hash for ${chunk.path}`);
    const response = await fetchAsset(new URL(chunk.path, origin));
    assert.equal(response.status, 200, `Deployed asset ${chunk.path} returned ${response.status}`);
    const actual = createHash('sha256')
      .update(Buffer.from(await response.arrayBuffer()))
      .digest('hex');
    assert.equal(actual, chunk.sha256, `Deployed asset differs from build: ${chunk.path}`);
  }
  return { sourceSha: report.sourceSha, origin: origin.origin, checked: report.chunks.length };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const [reportPath, deploymentUrl] = process.argv.slice(2);
  assert.ok(
    reportPath && deploymentUrl,
    'Usage: node scripts/check-deployed-public-assets.mjs <build-report.json> <https-deployment-url>',
  );
  const result = await verifyDeployedPublicAssets(
    JSON.parse(readFileSync(reportPath, 'utf8')),
    deploymentUrl,
  );
  console.log(JSON.stringify(result));
}
