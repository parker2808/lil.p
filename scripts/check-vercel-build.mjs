#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

if (existsSync('packages/cms-core/dist/contracts.d.ts')) {
  throw new Error('Vercel build regression must start without built CMS-core types');
}

const { buildCommand } = JSON.parse(readFileSync('vercel.json', 'utf8'));
if (typeof buildCommand !== 'string' || !buildCommand.trim()) {
  throw new Error('Missing repository-owned Vercel build command');
}

const result = spawnSync(buildCommand, { shell: true, stdio: 'inherit' });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
