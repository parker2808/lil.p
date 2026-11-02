import { describe, expect, it } from 'vitest';

import {
  isReservedPublicPageSlug,
  PUBLIC_ROUTES,
  RESERVED_PUBLIC_PAGE_SLUGS,
} from '../constants/routes.constant';
import { createPageSchema } from './pages.schema';

describe('createPageSchema', () => {
  it('reserves every one-segment public route, including craft', () => {
    const routeSlugs = PUBLIC_ROUTES.filter((route) => route !== '/').map((route) =>
      route.slice(1),
    );
    expect(RESERVED_PUBLIC_PAGE_SLUGS).toEqual([...routeSlugs, 'craft']);
    for (const slug of RESERVED_PUBLIC_PAGE_SLUGS) {
      expect(isReservedPublicPageSlug(slug)).toBe(true);
      // A route collision is a 409 from the API, not a malformed-payload 400.
      expect(
        createPageSchema.safeParse({ title: 'Page', key: slug, locale: 'en', template: 'empty' })
          .success,
      ).toBe(true);
    }
    expect(isReservedPublicPageSlug('new-ideas')).toBe(false);
  });
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
