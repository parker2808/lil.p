import { describe, expect, it } from 'vitest';

import { createPageSchema } from './pages.schema';

describe('createPageSchema', () => {
  it('accepts a bounded lowercase slug and both locales/templates', () => {
    expect(
      createPageSchema.parse({
        title: ' Ideas ',
        key: 'new-ideas',
        locale: 'vi',
        template: 'empty',
      }).title,
    ).toBe('Ideas');
    expect(
      createPageSchema.safeParse({
        title: 'Ideas',
        key: 'ideas',
        locale: 'en',
        template: 'starter',
      }).success,
    ).toBe(true);
  });

  it.each(['', 'UPPER', 'bad_slug', '-bad', 'bad-', 'a'.repeat(65)])(
    'rejects invalid slug %s',
    (key) => {
      expect(
        createPageSchema.safeParse({ title: 'Ideas', key, locale: 'en', template: 'empty' })
          .success,
      ).toBe(false);
    },
  );

  it('rejects a blank title and unsupported locale/template', () => {
    expect(
      createPageSchema.safeParse({ title: '  ', key: 'ideas', locale: 'en', template: 'empty' })
        .success,
    ).toBe(false);
    expect(
      createPageSchema.safeParse({ title: 'Ideas', key: 'ideas', locale: 'fr', template: 'empty' })
        .success,
    ).toBe(false);
    expect(
      createPageSchema.safeParse({ title: 'Ideas', key: 'ideas', locale: 'en', template: 'copy' })
        .success,
    ).toBe(false);
  });
});
