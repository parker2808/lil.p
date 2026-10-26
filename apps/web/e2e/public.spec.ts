import { expect, test } from '@playwright/test';

test.describe('public smoke', () => {
  test('renders home in both locales', async ({ page }) => {
    await page.goto('/en');
    await expect(page.getByRole('heading', { name: /without breaking them/i })).toBeVisible();
    const site = await page.request.get('/api/public/site?locale=en');
    expect(site.ok(), await site.text()).toBeTruthy();
    const body = (await site.json()) as { nav: { header: Array<{ label: string }> } };
    expect(body.nav.header.map((item) => item.label)).toContain('Work');
    await expect(page.getByRole('link', { name: 'Work' }).first()).toBeVisible();

    await page.getByRole('link', { name: 'VI', exact: true }).click();
    await expect(page).toHaveURL(/\/vi\/?$/);
    await expect(page.getByRole('heading', { name: /không làm chúng gãy/i })).toBeVisible();
  });

  test('moves through the header with the keyboard', async ({ page }) => {
    await page.goto('/en');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Parker Vu' })).toBeFocused();
    await page.keyboard.press('Tab');
    const work = page.getByRole('link', { name: 'Work' }).first();
    await expect(work).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/en\/projects\/?$/);
  });

  test('opens a published project and a published note', async ({ page }) => {
    await page.goto('/en/projects/particula');
    await expect(page.getByRole('heading', { name: 'Particula v2' })).toBeVisible();

    await page.goto('/en/notes/vue-to-react');
    await expect(page.getByRole('heading', { name: 'Vue to React: what transfers' })).toBeVisible();
  });

  test('shows the not-found state for a missing case study', async ({ page }) => {
    await page.goto('/en/projects/missing-e2e-slug');
    await expect(page.getByRole('heading', { name: 'This page is missing' })).toBeVisible();
  });
});
