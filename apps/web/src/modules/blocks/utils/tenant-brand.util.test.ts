import { expect, it } from 'vitest';

import { tenantBrand } from './tenant-brand.util';

it('selects the configured host only and never falls back to branded on an unknown host', () => {
  expect(tenantBrand('localhost:3000', 'http://localhost:3000')).toBe('lilp');
  expect(tenantBrand('neutral.localhost:3000', 'http://localhost:3000')).toBe('neutral');
  expect(tenantBrand('lil-p.vercel.app', 'https://lil-p.vercel.app')).toBe('lilp');
  expect(tenantBrand(null, 'https://lil-p.vercel.app')).toBe('neutral');
});
