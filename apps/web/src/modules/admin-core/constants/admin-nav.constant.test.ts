import { describe, expect, it } from 'vitest';

import { ADMIN_NAV, navVisibleTo } from './admin-nav.constant';

describe('admin navigation', () => {
  it('has at most five groups with the new page and settings destinations', () => {
    expect(ADMIN_NAV).toHaveLength(5);
    expect(ADMIN_NAV.map((group) => group.key)).toEqual([
      'overview',
      'content',
      'pages',
      'inbox',
      'settings',
    ]);
    expect(
      ADMIN_NAV.find((group) => group.key === 'pages')?.items.map((item) => item.href),
    ).toEqual(['/admin/pages/home', '/admin/pages/about', '/admin/pages/contact']);
    expect(
      navVisibleTo('user')
        .flatMap((group) => group.items)
        .map((item) => item.key),
    ).not.toContain('users');
  });
});
