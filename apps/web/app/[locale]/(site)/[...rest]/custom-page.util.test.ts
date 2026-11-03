import { describe, expect, it } from 'vitest';

import { customPageKey } from './custom-page.util';

describe('customPageKey', () => {
  it('accepts one valid custom slug', () => {
    expect(customPageKey(['studio-notes'])).toBe('studio-notes');
  });

  it.each([
    { rest: ['craft'] },
    { rest: ['home'] },
    { rest: ['sitemap'] },
    { rest: ['projects'] },
    { rest: ['Bad'] },
    { rest: ['one', 'two'] },
    { rest: [] },
  ])('rejects reserved, invalid, or nested paths: %j', ({ rest }) => {
    expect(customPageKey(rest)).toBeNull();
  });
});
