import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { checkDependencies, scanSource } from './check-deps.mjs';

test('rejects host imports across static, side-effect, re-export, type and dynamic forms', () => {
  const root = '/tmp/standalone-cms-core';
  const file = join(root, 'src', 'entry.ts');
  for (const source of [
    "import '@portfolio/contracts';",
    "export * from '@/modules/pages';",
    "import type { Foo } from 'packages/contracts';",
    "type Foo = import('@portfolio/contracts').Foo;",
    "const host = require('apps/web');",
    "const host = import('../../apps/web');",
    "import foo from '@parker2808/other';",
  ]) {
    assert.equal(scanSource(source, file, root).length, 1, source);
  }
});

test('allows local modules, peers, built output and package self-references', () => {
  const root = '/tmp/standalone-cms-core';
  const file = join(root, 'src', 'entry.ts');
  assert.deepEqual(
    scanSource(
      "import { z } from 'zod'; export * from './engine'; import '@parker2808/cms-core/contracts';",
      file,
      root,
    ),
    [],
  );
});

test('standalone manifest and source reject workspace dependencies and host imports', () => {
  const root = mkdtempSync(join(tmpdir(), 'cms-core-deps-'));
  for (const directory of ['src', 'scripts', 'test']) mkdirSync(join(root, directory));
  writeFileSync(
    join(root, 'package.json'),
    JSON.stringify({
      name: '@parker2808/cms-core',
      dependencies: { '@portfolio/contracts': 'workspace:*' },
    }),
  );
  writeFileSync(join(root, 'src', 'entry.ts'), "import '@portfolio/ui';");
  assert.equal(checkDependencies(root).length, 2);
  writeFileSync(
    join(root, 'package.json'),
    JSON.stringify({ name: '@parker2808/cms-core', peerDependencies: { zod: '^4.0.0' } }),
  );
  writeFileSync(join(root, 'src', 'entry.ts'), "import { z } from 'zod';");
  assert.deepEqual(checkDependencies(root), []);
});
