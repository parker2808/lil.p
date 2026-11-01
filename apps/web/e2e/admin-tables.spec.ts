import { expect, test } from '@playwright/test';

import { signIn } from './helpers/auth';

const LISTS = [
  { path: '/admin/projects', table: 'Projects' },
  { path: '/admin/posts', table: 'Posts' },
] as const;

test.describe('admin list tables', () => {
  for (const { path, table } of LISTS) {
    test(`${path} rows are links that open in a new tab on middle-click`, async ({ page }) => {
      await signIn(page);
      await page.goto(path);

      const link = page.getByRole('table', { name: table }).getByRole('link').first();
      await expect(link).toBeVisible();
      const href = await link.getAttribute('href');
      expect(href).toMatch(new RegExp(`^${path}/\\d+$`));

      const [popup] = await Promise.all([
        page.context().waitForEvent('page'),
        link.click({ button: 'middle' }),
      ]);
      await expect(popup).toHaveURL(new RegExp(`${href}$`));
      expect(new URL(page.url()).pathname).toBe(path);
      await popup.close();
    });
  }

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
});
