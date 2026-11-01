import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');

function componentSources(directory: string): string {
  return readdirSync(directory, { withFileTypes: true })
    .map((entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return componentSources(path);
      return entry.name.endsWith('.tsx') && !entry.name.endsWith('.test.tsx')
        ? readFileSync(path, 'utf8')
        : '';
    })
    .join('\n');
}

describe('redesign component styles', () => {
  it('uses explicit classes for every former slot selector', () => {
    const css = readFileSync(join(root, 'packages/ui/src/styles/redesign.css'), 'utf8');
    const components =
      componentSources(join(root, 'packages/ui/src/components')) +
      componentSources(join(root, 'apps/web/src/modules/admin-pages/components'));

    expect(css).not.toMatch(/\[data-slot\s*=/);
    for (const className of new Set(css.match(/redesign-[a-z-]+/g) ?? [])) {
      expect(components, `${className} has no component class`).toContain(className);
    }
  });
});
