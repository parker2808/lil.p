import assert from 'node:assert/strict';
import { test } from 'node:test';

import { mutations, probe } from './probe-stage-a-d2.mjs';

function mockFetch({ wrongPath, wrongStatus, wrongBody, wrongHealth } = {}) {
  const requests = [];
  async function fetchImpl(url, options) {
    requests.push({ url, options });
    const path = new globalThis.URL(url).pathname;
    const frozen = path.startsWith('/api/admin/pages');
    const status = path === wrongPath ? wrongStatus : frozen ? 503 : 200;
    const body = frozen
      ? {
          statusCode: 503,
          code: 'INTERNAL',
          message:
            wrongBody && path === wrongPath ? 'Other error' : 'Page writes temporarily paused',
          requestId: 'test-id',
        }
      : wrongHealth && path === '/api/health'
        ? { status: 'ok', db: 'down' }
        : { status: 'ok', db: 'ok' };
    return {
      status,
      headers: new globalThis.Headers({ 'Retry-After': frozen ? '120' : '' }),
      json: async () => body,
    };
  }
  return { fetchImpl, requests };
}

test('checks both ingresses and every legacy/D2 path without credentials or valid page IDs', async () => {
  const { fetchImpl, requests } = mockFetch();
  const lines = [];
  assert.equal(
    await probe({
      renderUrl: 'https://render.example',
      fetchImpl,
      log: (line) => lines.push(line),
    }),
    true,
  );
  assert.equal(requests.length, 32);
  assert.deepEqual(
    requests
      .filter(({ url }) => url.includes('/api/admin/pages'))
      .map(({ url, options }) => [options.method, new globalThis.URL(url).pathname]),
    [...mutations, ...mutations],
  );
  assert.ok(
    requests.every(
      ({ options }) => options.credentials === 'omit' && !('Authorization' in options.headers),
    ),
  );
  assert.ok(lines.some((line) => line.includes('drain NOT proven')));
  assert.ok(lines.at(-1).includes('unavailable'));
});

test('fails closed on missing freeze, wrong JSON and unhealthy DB', async () => {
  for (const failure of [
    { wrongPath: '/api/admin/pages', wrongStatus: 401 },
    { wrongPath: '/api/admin/pages', wrongStatus: 503, wrongBody: true },
    { wrongHealth: true },
  ]) {
    const { fetchImpl } = mockFetch(failure);
    assert.equal(
      await probe({ renderUrl: 'https://render.example', fetchImpl, log: () => {} }),
      false,
    );
  }
});

test('rejects URLs with credentials or paths before any network call', async () => {
  const credentialed = new globalThis.URL('https://render.example');
  credentialed.password = 'x';
  for (const renderUrl of [credentialed.href, 'https://render.example/api', 'file:///tmp/local']) {
    await assert.rejects(probe({ renderUrl, fetchImpl: () => assert.fail('network called') }));
  }
});
