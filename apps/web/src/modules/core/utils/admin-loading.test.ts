import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const cms = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../app/admin/(cms)');

function groups() {
  return readdirSync(cms, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('['))
    .map((entry) => entry.name);
}

function nestedRoutes(group: string) {
  return readdirSync(join(cms, group), { recursive: true, encoding: 'utf8' })
    .filter((path) => path.endsWith('page.tsx') && path !== 'page.tsx')
    .map((path) => join(group, dirname(path)));
}

describe('admin loading states', () => {
  it('gives every admin group a loading skeleton', () => {
    const all = groups();

    expect(all.length).toBeGreaterThan(0);
    expect(all.filter((group) => !existsSync(join(cms, group, 'loading.tsx')))).toEqual([]);
  });

  it('gives nested editor routes their own skeleton instead of the group list skeleton', () => {
    const nested = groups().flatMap(nestedRoutes);

    expect(nested.length).toBeGreaterThan(0);
    expect(nested.filter((route) => !existsSync(join(cms, route, 'loading.tsx')))).toEqual([]);
  });

  it('renders the shared PageSkeleton in every admin loading file', () => {
    for (const group of groups()) {
      const source = readFileSync(join(cms, group, 'loading.tsx'), 'utf8');
      expect(source, group).toMatch(/<PageSkeleton variant="(table|editor|admin)" \/>/);
    }
  });
});
