import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const modules = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const ownTable = /<table\b|@portfolio\/ui\/components\/ui\/table['"]/;

function adminFiles() {
  return readdirSync(modules, { recursive: true, encoding: 'utf8' })
    .filter((path) => path.startsWith('admin-') && path.endsWith('.tsx'))
    .filter((path) => !path.endsWith('.test.tsx'));
}

describe('admin tables', () => {
  it('renders every admin table through the shared table components', () => {
    const files = adminFiles();
    const offenders = files.filter((path) =>
      ownTable.test(readFileSync(join(modules, path), 'utf8')),
    );

    expect(files.length).toBeGreaterThan(0);
    expect(offenders).toEqual([]);
  });

  it('renders the pages, audit and analytics lists with AdminTable', () => {
    for (const path of [
      'admin-pages/views/AdminPagesIndex.tsx',
      'admin-insights/views/AdminInsightsAudit.tsx',
      'admin-insights/views/AdminInsightsAnalytics.tsx',
    ]) {
      expect(readFileSync(join(modules, path), 'utf8'), path).toContain('<AdminTable');
    }
  });
});
