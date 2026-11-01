import { expect, test, type Page } from '@playwright/test';

import { E2E_USER } from './helpers/credentials';
import { signIn } from './helpers/auth';

test.use({ viewport: { width: 375, height: 667 }, hasTouch: true, isMobile: true });

async function firstId(page: Page, endpoint: string): Promise<number> {
  const response = await page.request.get(endpoint);
  expect(response.ok(), endpoint).toBeTruthy();
  const list = (await response.json()) as { items: Array<{ id: number }> };
  expect(list.items.length, endpoint).toBeGreaterThan(0);
  return list.items[0]!.id;
}

test('every admin detail and new route shows a back link to its parent at 375px', async ({
  page,
}) => {
  test.setTimeout(180_000);
  await signIn(page);

  const contact = await page.request.post('/api/public/contact', {
    headers: { Origin: new URL(page.url()).origin },
    data: {
      name: 'Back Link Visitor',
      email: E2E_USER.email,
      message: 'Back link test message',
      locale: 'en',
    },
  });
  expect(contact.ok()).toBeTruthy();

  const routes: Array<{ path: string; parent: string; section: string }> = [];
  for (const [section, parent] of [
    ['projects', '/admin/projects'],
    ['posts', '/admin/posts'],
    ['experience', '/admin/pages/about?tab=experience'],
  ] as const) {
    const base = `/admin/${section}`;
    routes.push({ path: `${base}/new`, parent, section });
    routes.push({ path: `${base}/${await firstId(page, `/api${base}`)}`, parent, section });
  }
  routes.push({
    path: `/admin/inbox/${await firstId(page, '/api/admin/messages')}`,
    parent: '/admin/inbox',
    section: 'inbox',
  });
  routes.push({ path: '/admin/pages/home', parent: '/admin/pages/home', section: 'pages' });

  for (const { path, parent, section } of routes) {
    await page.goto(path);
    const back = page.locator('main [data-slot="page-header"]').getByRole('link', {
      name: new RegExp(`^Back to ${section}$`, 'i'),
    });
    await expect(back, path).toBeVisible();
    await expect(back, path).toHaveAttribute('href', parent);
    await expect(back.locator('[data-slot="page-header-back-icon"]'), path).toBeVisible();
  }

  await page.getByRole('link', { name: 'Back to Pages' }).click();
  await expect(page).toHaveURL(/\/admin\/pages\/home$/);
});
