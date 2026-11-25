#!/usr/bin/env node
// Pre-PR check: runs the repo checks in order and prints one line per step.
// Only a failing step prints its output (last 40 lines), to keep agent context small.
// Usage: pnpm check:all [--e2e] [--no-build]
import { spawn, spawnSync } from 'node:child_process';

const args = new Set(process.argv.slice(2));
if (args.has('--static') && args.has('--e2e')) {
  console.error('--static cannot be combined with --e2e');
  process.exit(2);
}
const parallelSteps = [
  ['format', 'pnpm format:check'],
  ['lint', 'pnpm lint'],
];
const steps = [['typecheck', 'pnpm typecheck']];
if (!args.has('--static')) steps.push(['test', 'pnpm test']);
steps.push(['content', 'pnpm check:content'], ['deps', 'pnpm check:deps']);
steps.push(['stage-a-probe', 'node --test scripts/probe-stage-a-d2.test.mjs']);
if (!args.has('--static') && !args.has('--no-build')) steps.push(['build', 'pnpm build']);
if (!args.has('--static') && !args.has('--no-build'))
  steps.push(['public-builder-bytes', 'node scripts/check-public-builder-bytes.mjs']);
if (!args.has('--static') && args.has('--e2e')) {
  // Theme/tree browser matrices live in parker2808/cms-core after the C3 package switch.
  steps.push(['api-e2e', 'pnpm --filter @portfolio/api test:e2e']);
  steps.push(['web-e2e', 'pnpm --filter @portfolio/web test:e2e']);
  steps.push(['fixture-e2e', 'pnpm --filter @parker2808/cms-core-fixture test:e2e']);
}

let failed = 0;
function report(name, cmd, start, res) {
  const secs = ((Date.now() - start) / 1000).toFixed(0);
  if (res.status === 0) {
    console.log(`PASS ${name} (${secs}s)`);
    return;
  }
  failed += 1;
  const out = `${res.stdout ?? ''}${res.stderr ?? ''}${res.error ?? ''}`
    .trimEnd()
    .split('\n')
    .slice(-40)
    .join('\n');
  console.log(`FAIL ${name} (${secs}s): ${cmd}\n${out}\n`);
}

const parallelResults = parallelSteps.map(([name, cmd]) => {
  const start = Date.now();
  const child = spawn(cmd, { shell: true, stdio: ['ignore', 'pipe', 'pipe'] });
  let stdout = '';
  let stderr = '';
  let error = '';
  child.stdout.on('data', (chunk) => (stdout += chunk));
  child.stderr.on('data', (chunk) => (stderr += chunk));
  child.on('error', (cause) => (error = cause.message));
  return new Promise((resolve) => {
    child.on('close', (status) => resolve({ name, cmd, start, status, stdout, stderr, error }));
  });
});
for (const result of await Promise.all(parallelResults)) {
  report(result.name, result.cmd, result.start, result);
}
for (const [name, cmd] of steps) {
  const start = Date.now();
  const res = spawnSync(cmd, { shell: true, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
  report(name, cmd, start, res);
}
console.log(
  failed
    ? `${failed} of ${parallelSteps.length + steps.length} checks failed`
    : `All ${parallelSteps.length + steps.length} checks passed`,
);
process.exit(failed ? 1 : 0);
