import { expect, test } from '@playwright/test';

import { signIn } from './helpers/auth';

async function checkMetadata(
  page: import('@playwright/test').Page,
  route: string,
  publicPage: boolean,
) {
  await page.goto(route);
  const title = await page.title();
  expect(title, route).toBeTruthy();

  const icon = page.locator('link[rel="icon"]');
  await expect(icon).toHaveAttribute('href', /icon\.svg/);
  const iconUrl = await icon.getAttribute('href');
  expect((await page.request.get(iconUrl!)).ok(), route).toBeTruthy();
  const appleIcon = page.locator('link[rel="apple-touch-icon"]');
  await expect(appleIcon).toHaveAttribute('href', /apple-icon\.png/);
  expect(
    (await page.request.get((await appleIcon.getAttribute('href'))!)).ok(),
    route,
  ).toBeTruthy();

  if (publicPage) {
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      /\/opengraph-image/,
    );
  }
  return title;
}

test('public routes have distinct titles, an icon, and an OG image', async ({ page }) => {
  const titles = new Set<string>();
  for (const route of ['/en', '/en/about', '/en/contact', '/en/notes', '/en/projects']) {
    const title = await checkMetadata(page, route, true);
    expect(titles.has(title), route).toBe(false);
    titles.add(title);
  }
});

test('admin routes have distinct titles and an icon', async ({ page }) => {
  const titles = new Set<string>();
  titles.add(await checkMetadata(page, '/admin/login', false));
  await signIn(page);
  for (const route of [
    '/admin',
    '/admin/projects',
    '/admin/posts',
    '/admin/experience',
    '/admin/education',
    '/admin/principles',
    '/admin/tags',
    '/admin/domains',
    '/admin/process',
    '/admin/stats',
    '/admin/skills',
    '/admin/pages',
    '/admin/media',
    '/admin/inbox',
    '/admin/users',
    '/admin/site',
    '/admin/profile',
    '/admin/analytics',
    '/admin/audit',
  ]) {
    const title = await checkMetadata(page, route, false);
    expect(titles.has(title), route).toBe(false);
    titles.add(title);
  }
});
