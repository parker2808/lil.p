import { expect, test } from '@playwright/test';

import { signIn } from './helpers/auth';

const legacy = [
  ['/admin/pages', '/admin/pages/home', null],
  ['/admin/experience', '/admin/pages/about', 'experience'],
  ['/admin/education', '/admin/pages/about', 'education'],
  ['/admin/skills', '/admin/pages/about', 'skills'],
  ['/admin/principles', '/admin/pages/about', 'principles'],
  ['/admin/process', '/admin/pages/about', 'process'],
  ['/admin/stats', '/admin/pages/about', 'stats'],
  ['/admin/domains', '/admin/pages/about', 'domains'],
  ['/admin/tags', '/admin/posts', 'tags'],
  ...[
    '/admin',
    '/admin/projects',
    '/admin/posts',
    '/admin/media',
    '/admin/pages/home',
    '/admin/pages/about',
    '/admin/pages/contact',
    '/admin/inbox',
    '/admin/site',
    '/admin/profile',
    '/admin/users',
    '/admin/audit',
    '/admin/analytics',
  ].map((path) => [path, path, null] as const),
] as const;

test('legacy admin routes land on the corresponding page and tab', async ({ page }) => {
  await signIn(page);
  for (const [oldPath, destination, tab] of legacy) {
    await page.goto(oldPath);
    await expect(page).toHaveURL(
      (url) => url.pathname === destination && url.searchParams.get('tab') === tab,
    );
    if (tab)
      await expect(page.getByRole('tab', { name: new RegExp(`^${tab}$`, 'i') })).toHaveAttribute(
        'data-state',
        'active',
      );
  }
  await page.goto('/admin/experience/999999');
  await expect(page).toHaveURL(/\/admin\/pages\/about\/experience\/999999$/);
  await page.goto('/admin/experience/new');
  await expect(page).toHaveURL(/\/admin\/pages\/about\/experience\/new$/);
  await page.goto('/admin/pages/about?tab=skills');
  await page.getByRole('tab', { name: 'Education' }).click();
  await expect(page).toHaveURL(/tab=education/);
  await page.goBack();
  await expect(page).toHaveURL(/tab=skills/);
});
