import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const modules = resolve(here, '../..');
const redesignCss = resolve(here, '../../../../../../packages/ui/src/styles/redesign.css');
const buttonHeightOverride = /<(?:Button|IconButton)\b[^<]*?\bclassName="[^"]*(?<=["\s:])h-\d/;
const selectClassName = /<select\b[\s\S]*?\bclassName=([^\n]+)/g;
const adminButtonRule = /\.admin\b[^{]*(?:button|sidebar-menu)[^{]*\{/;

function adminFiles() {
  return readdirSync(modules, { recursive: true, encoding: 'utf8' })
    .filter((path) => path.startsWith('admin-') && path.endsWith('.tsx'))
    .filter((path) => !path.endsWith('.test.tsx'));
}

describe('admin components', () => {
  it('keeps admin buttons on the shared Button sizes', () => {
    const offenders = adminFiles().filter((path) =>
      buttonHeightOverride.test(readFileSync(join(modules, path), 'utf8')),
    );

    expect(offenders).toEqual([]);
  });

  it('styles native admin selects with the shared input chrome', () => {
    const selects = adminFiles().flatMap((path) =>
      [...readFileSync(join(modules, path), 'utf8').matchAll(selectClassName)].map(
        ([, className = '']) => ({ path, className }),
      ),
    );

    expect(selects.length).toBeGreaterThan(0);
    expect(selects.filter(({ className }) => !className.includes('inputClassName'))).toEqual([]);
  });

  it('has no admin-only button rules in the redesign stylesheet', () => {
    expect(readFileSync(redesignCss, 'utf8')).not.toMatch(adminButtonRule);
  });
});
