#!/usr/bin/env node
// Pre-PR check: runs the repo checks in order and prints one line per step.
// Only a failing step prints its output (last 40 lines), to keep agent context small.
// Usage: pnpm check:all [--e2e] [--no-build]
import { spawnSync } from 'node:child_process';

const args = new Set(process.argv.slice(2));
const steps = [
  ['format', 'pnpm format:check'],
  ['lint', 'pnpm lint'],
  ['typecheck', 'pnpm typecheck'],
  ['test', 'pnpm test'],
  ['content', 'pnpm check:content'],
  ['deps', 'pnpm check:deps'],
];
if (!args.has('--no-build')) steps.push(['build', 'pnpm build']);
if (args.has('--e2e')) {
  steps.push(['api-e2e', 'pnpm --filter @portfolio/api test:e2e']);
  steps.push(['web-e2e', 'pnpm --filter @portfolio/web test:e2e']);
}

let failed = 0;
for (const [name, cmd] of steps) {
  const start = Date.now();
  const res = spawnSync(cmd, { shell: true, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
  const secs = ((Date.now() - start) / 1000).toFixed(0);
  if (res.status === 0) {
    console.log(`PASS ${name} (${secs}s)`);
    continue;
  }
  failed += 1;
  const out = `${res.stdout ?? ''}${res.stderr ?? ''}`.trimEnd().split('\n').slice(-40).join('\n');
  console.log(`FAIL ${name} (${secs}s): ${cmd}\n${out}\n`);
}
console.log(
  failed ? `${failed} of ${steps.length} checks failed` : `All ${steps.length} checks passed`,
);
process.exit(failed ? 1 : 0);
