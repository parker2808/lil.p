import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const site = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../app/[locale]/(site)');

describe('public loading boundaries', () => {
  it('retains the home skeleton without hiding custom pages behind a shared fallback', () => {
    expect(existsSync(join(site, 'loading.tsx'))).toBe(false);
    expect(existsSync(join(site, '(home)', 'page.tsx'))).toBe(true);
    expect(readFileSync(join(site, '(home)', 'loading.tsx'), 'utf8')).toContain(
      '<PublicRouteSkeleton variant="home" />',
    );
  });
});
