#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PHONE = /(?:\+84[\s.-]?\d{8,13}|\b0\d{8,10}\b)/g;
const DENYLIST = ['Parker Vu', 'Vu Van Hung', 'Hung Vu Van', 'Hanoi', 'Hà Nội', 'Samsung SDS'];
const CONTENT_ROOTS = ['apps/web/', 'packages/ui/src/components/'];
const CONTENT_SKIP = /\.(stories|test|spec)\.(tsx|ts|jsx|js)$/;
const SKIP_SCAN = /^(pnpm-lock\.yaml|docs\/design\/)/;

const files = execFileSync('git', ['ls-files'], { encoding: 'utf8' }).split('\n').filter(Boolean);

const failures = [];

for (const file of files) {
  if (SKIP_SCAN.test(file)) {
    continue;
  }
  const text = readFileSync(file, 'utf8');
  const emails = text.match(EMAIL) ?? [];
  for (const email of emails) {
    failures.push(`${file}: email ${email}`);
  }
  const phones = text.match(PHONE) ?? [];
  for (const phone of phones) {
    failures.push(`${file}: phone ${phone.trim()}`);
  }

  const inContentTree = CONTENT_ROOTS.some((root) => file.startsWith(root));
  if (!inContentTree || CONTENT_SKIP.test(file)) {
    continue;
  }
  for (const needle of DENYLIST) {
    if (text.includes(needle)) {
      failures.push(`${file}: denylist "${needle}"`);
    }
  }
}

if (failures.length > 0) {
  console.error('check:content failed:\n' + failures.map((line) => `  ${line}`).join('\n'));
  process.exit(1);
}

console.log(`check:content passed (${files.length} tracked files)`);
