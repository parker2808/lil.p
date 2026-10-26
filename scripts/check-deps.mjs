#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FORBIDDEN_LOCK = ['@tiptap-pro/', '@tiptap-cloud/'];
const FORBIDDEN_REGISTRY = 'registry.tiptap.dev';
const SCOPES = ['@tiptap', '@dnd-kit'];

export function scanLockfile(text) {
  return FORBIDDEN_LOCK.filter((needle) => text.includes(needle));
}

export function scanNpmrc(text) {
  return text.includes(FORBIDDEN_REGISTRY);
}

export function collectScopedPackages(rootDir, scopes = SCOPES) {
  const found = [];
  const pnpm = join(rootDir, 'node_modules', '.pnpm');
  if (!existsSync(pnpm)) {
    return found;
  }

  for (const entry of readdirSync(pnpm)) {
    const matches = scopes.some(
      (scope) => entry.startsWith(`${scope.slice(1)}+`) || entry.startsWith(`${scope}+`),
    );
    if (!matches) {
      continue;
    }
    const dir = join(pnpm, entry, 'node_modules');
    if (!existsSync(dir)) {
      continue;
    }
    for (const scope of scopes) {
      const scoped = join(dir, scope);
      if (!existsSync(scoped)) {
        continue;
      }
      for (const name of readdirSync(scoped)) {
        const pkgFile = join(scoped, name, 'package.json');
        if (!existsSync(pkgFile) || !statSync(pkgFile).isFile()) {
          continue;
        }
        found.push(JSON.parse(readFileSync(pkgFile, 'utf8')));
      }
    }
  }

  return found;
}

export function scanLicenses(packages) {
  return packages
    .filter((pkg) => String(pkg.license ?? '') !== 'MIT')
    .map((pkg) => `${pkg.name}@${pkg.version} license=${pkg.license ?? 'missing'}`);
}

export function runCheckDeps(rootDir = ROOT) {
  const failures = [];
  const lockPath = join(rootDir, 'pnpm-lock.yaml');
  if (existsSync(lockPath)) {
    for (const hit of scanLockfile(readFileSync(lockPath, 'utf8'))) {
      failures.push(`pnpm-lock.yaml contains ${hit}`);
    }
  }

  const npmrcPath = join(rootDir, '.npmrc');
  if (existsSync(npmrcPath) && scanNpmrc(readFileSync(npmrcPath, 'utf8'))) {
    failures.push(`.npmrc points at ${FORBIDDEN_REGISTRY}`);
  }

  for (const hit of scanLicenses(collectScopedPackages(rootDir))) {
    failures.push(hit);
  }

  return failures;
}

const invokedDirectly = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (invokedDirectly) {
  const failures = runCheckDeps();
  if (failures.length > 0) {
    console.error('check:deps failed:\n' + failures.map((line) => `  ${line}`).join('\n'));
    process.exit(1);
  }
  console.log('check:deps passed');
}
