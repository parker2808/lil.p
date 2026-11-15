import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const packageDirectory = dirname(dirname(fileURLToPath(import.meta.url)));

test('packed tarball installs with only subpath exports', { timeout: 60_000 }, () => {
  const scratchDirectory = mkdtempSync(join(tmpdir(), 'cms-core-packed-'));
  try {
    execFileSync('pnpm', ['pack', '--pack-destination', scratchDirectory], {
      cwd: packageDirectory,
      stdio: 'pipe',
    });
    const tarballs = readdirSync(scratchDirectory).filter((name) => name.endsWith('.tgz'));
    assert.equal(tarballs.length, 1);
    const consumerDirectory = join(scratchDirectory, 'consumer');
    mkdirSync(consumerDirectory);
    writeFileSync(
      join(consumerDirectory, 'package.json'),
      JSON.stringify({
        name: 'cms-core-packed-consumer',
        private: true,
        type: 'module',
        dependencies: { '@parker2808/cms-core': `file:../${tarballs[0]}` },
      }),
    );
    execFileSync(
      'pnpm',
      ['install', '--offline', '--ignore-scripts', '--config.auto-install-peers=false'],
      {
        cwd: consumerDirectory,
        stdio: 'pipe',
      },
    );
    writeFileSync(
      join(consumerDirectory, 'verify.mjs'),
      `import assert from 'node:assert/strict';
import { existsSync, realpathSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const packageName = '@parker2808/cms-core';
for (const subpath of ['contracts', 'engine', 'tree', 'react', 'react/server', 'theme.css']) {
  const specifier = packageName + '/' + subpath;
  const esmPath = fileURLToPath(import.meta.resolve(specifier));
  const cjsPath = require.resolve(specifier);
  for (const resolvedPath of [esmPath, cjsPath]) {
    assert.ok(existsSync(resolvedPath), specifier + ' must exist in the tarball');
    assert.ok(realpathSync(resolvedPath).startsWith(realpathSync(join('node_modules', '@parker2808', 'cms-core')) + sep), specifier + ' must resolve from the installed tarball');
  }
}
assert.throws(() => import.meta.resolve(packageName), { code: 'ERR_PACKAGE_PATH_NOT_EXPORTED' });
assert.throws(() => require.resolve(packageName), { code: 'ERR_PACKAGE_PATH_NOT_EXPORTED' });
`,
    );
    execFileSync(process.execPath, ['verify.mjs'], { cwd: consumerDirectory, stdio: 'pipe' });
    assert.equal(
      JSON.parse(
        readFileSync(join(consumerDirectory, 'node_modules/@parker2808/cms-core/package.json')),
      ).name,
      '@parker2808/cms-core',
    );
  } finally {
    rmSync(scratchDirectory, { recursive: true, force: true });
  }
});
