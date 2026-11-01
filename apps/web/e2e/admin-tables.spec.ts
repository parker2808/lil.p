import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

import { signIn } from './helpers/auth';
import { E2E_USER } from './helpers/credentials';

async function createMessage(page: Page) {
  const response = await page.request.post('/api/public/contact', {
    headers: { Origin: new URL(page.url()).origin },
    data: {
      name: 'Table Visitor',
      email: E2E_USER.email,
      message: 'Admin table test message',
      locale: 'en',
    },
  });
  expect(response.ok()).toBeTruthy();
}

const LISTS: {
  path: string;
  table: string;
  id?: string;
  /** Final list URL path after legacy redirects (defaults to path). */
  listPath?: string;
  /** Prefix of row detail links (defaults to path). */
  rowBase?: string;
  setup?: (page: Page) => Promise<void>;
}[] = [
  { path: '/admin/projects', table: 'Projects' },
  { path: '/admin/posts', table: 'Posts' },
  {
    path: '/admin/experience',
    table: 'Experience',
    listPath: '/admin/pages/about',
    rowBase: '/admin/pages/about/experience',
  },
  { path: '/admin/inbox', table: 'Inbox', setup: createMessage },
];

test.describe('admin list tables', () => {
  for (const { path, table, id = '\\d+', setup, listPath = path, rowBase = path } of LISTS) {
    test(`${path} rows are links that open in a new tab on middle-click`, async ({ page }) => {
      await signIn(page);
      await setup?.(page);
      await page.goto(path);

      const link = page.getByRole('table', { name: table }).getByRole('link').first();
      await expect(link).toBeVisible();
      const href = await link.getAttribute('href');
      expect(href).toMatch(new RegExp(`^${rowBase}/${id}$`));

      const [popup] = await Promise.all([
        page.context().waitForEvent('page'),
        link.click({ button: 'middle' }),
      ]);
      await expect(popup).toHaveURL(new RegExp(`${href}$`));
      expect(new URL(page.url()).pathname).toBe(listPath);
      await popup.close();
    });
  }

  test('/admin/users edits a user in a dialog from the table', async ({ page }) => {
    await signIn(page);
    await page.goto('/admin/users');

    const usersTable = page.getByRole('table', { name: 'Users' });
    await expect(page.locator('[data-slot="admin-table"]')).toBeVisible();
    await expect(usersTable.getByRole('link')).toHaveCount(0);
    await usersTable.getByRole('button', { name: 'Edit', exact: true }).first().click();
    await expect(page.getByRole('dialog', { name: 'Edit user' })).toBeVisible();
    expect(new URL(page.url()).pathname).toBe('/admin/users');
  });

  test('projects header stays pinned while the table scrolls', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 320 });
    await signIn(page);
    await page.goto('/admin/projects');

    const viewport = page.locator('[data-slot="admin-table"] .admin-table-viewport');
    const header = viewport.locator('thead');
    const firstRow = viewport.locator('tbody tr').first();
    await expect(firstRow.getByRole('link')).toBeVisible();

    const overflow = await viewport.evaluate(
      (element) => element.scrollHeight - element.clientHeight,
    );
    expect(overflow).toBeGreaterThan(0);
    await viewport.scrollIntoViewIfNeeded();

    const viewportTop = (await viewport.boundingBox())!.y;
    const rowTop = (await firstRow.boundingBox())!.y;
    await viewport.evaluate((element) => element.scrollTo(0, element.scrollHeight));
    await expect.poll(() => viewport.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);

    expect((await firstRow.boundingBox())!.y).toBeLessThan(rowTop);
    const headerTop = (await header.boundingBox())!.y;
    expect(Math.abs(headerTop - viewportTop)).toBeLessThanOrEqual(2);
    await expect(header).toBeInViewport();
  });

  test('audit table scroll region is keyboard focusable', async ({ page }) => {
    await signIn(page);
    await page.setViewportSize({ width: 1280, height: 100 });
    await page.goto('/admin/audit');

    const region = page.getByRole('region', { name: 'Audit log' });
    await expect(region.getByRole('table', { name: 'Audit log' })).toBeVisible();
    await expect(region.locator('tbody tr:not([data-state])').first()).toBeAttached();
    const overflow = await region.evaluate(
      (element) => element.scrollHeight - element.clientHeight,
    );
    expect(overflow).toBeGreaterThan(0);

    const results = await new AxeBuilder({ page })
      .withRules(['scrollable-region-focusable'])
      .analyze();
    expect(results.violations).toEqual([]);

    await region.focus();
    await expect(region).toBeFocused();
    await page.keyboard.press('End');
    await expect.poll(() => region.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  });
});
