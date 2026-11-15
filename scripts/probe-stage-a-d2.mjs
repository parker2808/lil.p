import { pathToFileURL } from 'node:url';

const freezeMessage = 'Page writes temporarily paused';
const probeKey = 'stage-a-probe-not-a-page';
const pagePath = `/api/admin/pages/${probeKey}`;

export const mutations = [
  ['POST', '/api/admin/pages'],
  ['PATCH', pagePath],
  ['POST', `${pagePath}/blocks`],
  ['PATCH', `${pagePath}/blocks/order`],
  ['PATCH', `${pagePath}/blocks/0`],
  ['POST', `${pagePath}/blocks/0/duplicate`],
  ['DELETE', `${pagePath}/blocks/0`],
  ['POST', `${pagePath}/publish`],
  ['POST', `${pagePath}/versions/0/restore`],
  ['POST', `${pagePath}/discard`],
  ['POST', `${pagePath}/builder/activate`],
  ['PUT', `${pagePath}/builder/draft`],
  ['POST', `${pagePath}/builder/publish`],
  ['POST', `${pagePath}/versions/0/builder/restore`],
];

function origin(input) {
  const url = new globalThis.URL(input);
  if (
    !['https:', 'http:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  ) {
    throw new Error('URL must be an HTTP(S) origin without credentials, path or query');
  }
  return url.origin;
}

export async function probe({
  renderUrl,
  vercelUrl = 'https://lil-p.vercel.app',
  fetchImpl = globalThis.fetch,
  log = console.log,
}) {
  const render = origin(renderUrl);
  const vercel = origin(vercelUrl);
  const failures = [];

  async function check(label, base, method, path, frozen = false) {
    try {
      const response = await fetchImpl(`${base}${path}`, {
        method,
        headers: {
          Accept: 'application/json',
          ...(frozen ? { 'Content-Type': 'application/json' } : {}),
        },
        ...(frozen && method !== 'DELETE' ? { body: '{}' } : {}),
        credentials: 'omit',
        redirect: 'manual',
        signal: globalThis.AbortSignal.timeout(10000),
      });
      let valid = response.status === (frozen ? 503 : 200);
      if (frozen) {
        const body = await response.json();
        valid &&=
          response.headers.get('retry-after') === '120' &&
          body.statusCode === 503 &&
          body.code === 'INTERNAL' &&
          body.message === freezeMessage &&
          typeof body.requestId === 'string' &&
          body.requestId.length > 0;
      } else if (path === '/api/health') {
        const body = await response.json();
        valid &&= body.status === 'ok' && body.db === 'ok';
      }
      log(`${valid ? 'PASS' : 'FAIL'} ${label} ${method} ${path} (${response.status})`);
      if (!valid) failures.push(`${label} ${method} ${path}`);
    } catch (error) {
      log(
        `FAIL ${label} ${method} ${path} (${error instanceof SyntaxError ? 'invalid JSON' : 'request failed'})`,
      );
      failures.push(`${label} ${method} ${path}`);
    }
  }

  for (const path of ['/', '/vi']) await check('Vercel', vercel, 'GET', path);
  for (const [label, base] of [
    ['Render', render],
    ['Vercel', vercel],
  ]) {
    await check(label, base, 'GET', '/api/health');
    for (const [method, path] of mutations) await check(label, base, method, path, true);
  }
  log(
    `Stage A: ${failures.length ? `${failures.length} mismatch(es); STOP` : '32/32 public probes passed; instance drain NOT proven'}`,
  );
  log(
    'Instance identity/commit: unavailable on unauthenticated endpoints; verify via authorized inventory.',
  );
  return failures.length === 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  if (args.length === 1 && args[0] === '--help') {
    console.log(
      'Usage: node scripts/probe-stage-a-d2.mjs --render-url https://<actual-render-host> [--vercel-url https://lil-p.vercel.app]',
    );
  } else {
    try {
      if (
        args.length < 2 ||
        args.length % 2 !== 0 ||
        args.some(
          (value, index) => index % 2 === 0 && !['--render-url', '--vercel-url'].includes(value),
        )
      )
        throw new Error('Expected --render-url and optional --vercel-url');
      const options = Object.fromEntries(
        Array.from({ length: args.length / 2 }, (_, index) => [
          args[index * 2],
          args[index * 2 + 1],
        ]),
      );
      if (!options['--render-url']) throw new Error('Missing --render-url');
      if (
        !(await probe({ renderUrl: options['--render-url'], vercelUrl: options['--vercel-url'] }))
      )
        process.exitCode = 1;
    } catch (error) {
      console.error(error.message);
      process.exitCode = 1;
    }
  }
}
