import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import {
  runCheckDeps,
  scanCmsCoreImports,
  scanLicenses,
  scanLockfile,
  scanNpmrc,
} from './check-deps.mjs';

test('scanLockfile flags paid Tiptap packages', () => {
  assert.deepEqual(scanLockfile('  @tiptap-pro/foo: 1.0.0\n'), ['@tiptap-pro/']);
  assert.deepEqual(scanLockfile('  @tiptap-cloud/bar: 1.0.0\n'), ['@tiptap-cloud/']);
  assert.deepEqual(scanLockfile('  @tiptap/core: 3.32.0\n'), []);
});

test('scanNpmrc flags the private Tiptap registry', () => {
  assert.equal(scanNpmrc('registry=https://registry.tiptap.dev\n'), true);
  assert.equal(scanNpmrc('registry=https://registry.npmjs.org\n'), false);
});

test('scanLicenses requires MIT on scoped packages', () => {
  assert.deepEqual(
    scanLicenses([{ name: '@tiptap-pro/foo', version: '1.0.0', license: 'UNLICENSED' }]),
    ['@tiptap-pro/foo@1.0.0 license=UNLICENSED'],
  );
  assert.deepEqual(scanLicenses([{ name: '@tiptap/core', version: '3.32.0', license: 'MIT' }]), []);
});

test('runCheckDeps fails when a lockfile lists @tiptap-pro/', () => {
  const dir = mkdtempSync(join(tmpdir(), 'check-deps-'));
  writeFileSync(
    join(dir, 'pnpm-lock.yaml'),
    'importers:\n  packages/ui:\n    @tiptap-pro/core: 1.0.0\n',
  );
  const failures = runCheckDeps(dir);
  assert.ok(failures.some((line) => line.includes('@tiptap-pro/')));
});

test('cms-core cannot import host modules', () => {
  const dir = mkdtempSync(join(tmpdir(), 'check-cms-core-'));
  const source = join(dir, 'packages/cms-core/src');
  mkdirSync(source, { recursive: true });
  writeFileSync(join(source, 'contracts.ts'), "import { foo } from '@portfolio/contracts';\n");
  assert.equal(scanCmsCoreImports(dir).length, 1);
  assert.equal(runCheckDeps(dir).length, 1);
  writeFileSync(join(source, 'contracts.ts'), "import { foo } from '@/modules/pages';\n");
  assert.equal(scanCmsCoreImports(dir).length, 1);
  for (const statement of [
    "import '@portfolio/contracts';",
    'import "@/modules/pages";',
    "export * from '@portfolio/contracts';",
    "export { foo } from '@/modules/pages';",
    "export * as host from '@portfolio/contracts';",
    "const host = require('@portfolio/contracts');",
    "const host = import('@/modules/pages');",
  ]) {
    writeFileSync(join(source, 'contracts.ts'), `${statement}\n`);
    assert.equal(scanCmsCoreImports(dir).length, 1, statement);
  }
  writeFileSync(join(source, 'contracts.ts'), "import { z } from 'zod';\n");
  assert.deepEqual(scanCmsCoreImports(dir), []);
});
