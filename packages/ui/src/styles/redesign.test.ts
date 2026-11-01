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
  it('defines radius, spacing, and motion scales with reduced-motion overrides', () => {
    const css = readFileSync(join(root, 'packages/ui/src/styles/redesign.css'), 'utf8');
    const rootTokens = css.match(/html:root \{([\s\S]*?)\}/)?.[1] ?? '';
    const tokens = Object.fromEntries(
      Array.from(rootTokens.matchAll(/^\s{2}(--[\w-]+): ([^;]+);$/gm), ([, name, value]) => [
        name,
        value,
      ]),
    );

    expect(css).toContain('html:root {');
    expect(tokens).toMatchObject({
      '--radius-xs': '4px',
      '--radius-sm': '8px',
      '--radius-md': '12px',
      '--radius-lg': '16px',
      '--radius-xl': '24px',
      '--radius-full': '9999px',
      '--space-1': '4px',
      '--space-2': '8px',
      '--space-3': '12px',
      '--space-4': '16px',
      '--space-6': '24px',
      '--space-8': '32px',
      '--space-12': '48px',
      '--space-16': '64px',
      '--dur-fast': '120ms',
      '--dur-base': '200ms',
      '--dur-slow': '320ms',
      '--ease-in': 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      '--ease-out': 'cubic-bezier(0.4, 0, 1, 1)',
    });
    expect(css).toMatch(
      /@media \(prefers-reduced-motion: reduce\) \{\s+html:root \{[\s\S]*?--dur-fast: 0ms;[\s\S]*?--dur-base: 0ms;[\s\S]*?--dur-slow: 0ms;/,
    );
    expect(Number.parseInt(tokens['--radius-xl']) - 16).toBe(
      Number.parseInt(tokens['--radius-sm']),
    );
    expect(css).toMatch(
      /\.projects-view\[data-view='index'\] \.redesign-case-card \{\s+padding: 16px;/,
    );
    expect(css).toMatch(
      /\.projects-view\[data-view='index'\] \.redesign-case-card \.redesign-cover-placeholder,[\s\S]*?border-radius: var\(--radius-sm\);/,
    );
  });

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
