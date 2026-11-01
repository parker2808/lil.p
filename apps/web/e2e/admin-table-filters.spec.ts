import { expect, type Page, test } from '@playwright/test';

import { signIn } from './helpers/auth';

const projectsTable = (page: Page) => page.locator('[data-slot="admin-table"]');
const primaryLink = (page: Page, index: number) =>
  projectsTable(page)
    .locator('tbody tr[data-row]')
    .nth(index)
    .locator('a.admin-table-link:not([tabindex="-1"])');

test.describe('admin table filters, row keys and density', () => {
  test('reload keeps the status chip and search from the URL', async ({ page }) => {
    await signIn(page);
    await page.goto('/admin/projects');

    await page.getByRole('button', { name: '+ Filter' }).click();
    await page.getByRole('menuitem', { name: 'Draft' }).click();
    await expect(page).toHaveURL(/[?&]status=DRAFT(&|$)/);

    const search = page.getByRole('textbox', { name: 'Filter projects' });
    await search.fill('case');
    await search.press('Enter');
    await expect(page).toHaveURL(/[?&]q=case(&|$)/);

    await page.reload();
    await expect(page).toHaveURL(/[?&]status=DRAFT(&|$)/);
    await expect(page).toHaveURL(/[?&]q=case(&|$)/);
    await expect(page.getByText('Status is Draft')).toBeVisible();
    await expect(search).toHaveValue('case');

    await page.getByRole('button', { name: '×' }).click();
    await expect(page).not.toHaveURL(/status=/);
    await page.reload();
    await expect(page.getByText('Status is Draft')).toHaveCount(0);
    await expect(search).toHaveValue('case');
  });

  test('J and K move focus between rows', async ({ page }) => {
    await signIn(page);
    await page.goto('/admin/projects');
    await expect(primaryLink(page, 1)).toBeVisible();

    await expect(async () => {
      await page.keyboard.press('j');
      await expect(primaryLink(page, 0)).toBeFocused({ timeout: 1000 });
    }).toPass();
    await page.keyboard.press('j');
    await expect(primaryLink(page, 1)).toBeFocused();
    await page.keyboard.press('k');
    await expect(primaryLink(page, 0)).toBeFocused();
  });

  test('compact density applies the row tokens and survives a reload', async ({ page }) => {
    await signIn(page);
    await page.goto('/admin/projects');
    await expect(primaryLink(page, 0)).toBeVisible();

    const table = projectsTable(page);
    const rowHeight = () =>
      table.evaluate((element) => getComputedStyle(element).getPropertyValue('--row-h').trim());
    await expect(table).toHaveAttribute('data-density', 'comfortable');
    expect(await rowHeight()).toBe('44px');

    await page.getByRole('radio', { name: 'Compact' }).click();
    await expect(table).toHaveAttribute('data-density', 'compact');
    expect(await rowHeight()).toBe('36px');
    await expect(primaryLink(page, 0)).toHaveCSS('padding-left', '8px');

    await page.reload();
    await expect(table).toHaveAttribute('data-density', 'compact');
    await expect(page.getByRole('radio', { name: 'Compact' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });
});
