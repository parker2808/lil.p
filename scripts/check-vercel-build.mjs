#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

if (existsSync('packages/cms-core')) {
  throw new Error(
    'C3: in-repo packages/cms-core must stay removed; consumers use vendor/cms-core/*.tgz',
  );
}

const { buildCommand } = JSON.parse(readFileSync('vercel.json', 'utf8'));
if (typeof buildCommand !== 'string' || !buildCommand.trim()) {
  throw new Error('Missing repository-owned Vercel build command');
}

const result = spawnSync(buildCommand, { shell: true, stdio: 'inherit' });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
