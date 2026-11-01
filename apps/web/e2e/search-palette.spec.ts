import { expect, test } from '@playwright/test';

test.describe('search entry points and palette actions', () => {
  test('tapping the search icon at 375px opens the grouped palette', async ({ browser }) => {
    const page = await browser.newPage({
      viewport: { width: 375, height: 667 },
      hasTouch: true,
      isMobile: true,
    });
    try {
      await page.goto('/en');
      const search = page.locator('header.site-header').getByRole('button', {
        name: 'Search',
        exact: true,
      });
      await expect(search).toBeVisible();
      await search.tap();

      const dialog = page.getByRole('dialog', { name: 'Search and jump' });
      await expect(dialog).toBeVisible();
      await expect(dialog.getByRole('group', { name: 'Go to' }).getByRole('link')).not.toHaveCount(
        0,
      );
      await expect(
        dialog.getByRole('group', { name: 'Case studies' }).getByRole('link').first(),
      ).toHaveAttribute('href', /^\/en\/projects\/[\w-]+$/);
      const actions = dialog.getByRole('group', { name: 'Actions' });
      await expect(actions.getByRole('button', { name: 'Toggle theme' })).toBeVisible();
      await expect(actions.getByRole('link', { name: /Switch language/ })).toBeVisible();
    } finally {
      await page.close();
    }
  });

  test('the 404 page has a search field that opens the palette and 3+ links', async ({ page }) => {
    const response = await page.goto('/en/zzz');
    expect(response?.status()).toBe(404);

    const links = page.getByRole('navigation', { name: 'Explore the site' }).getByRole('link');
    expect(await links.count()).toBeGreaterThanOrEqual(3);

    const field = page.getByRole('main').getByRole('button', {
      name: 'Search projects, notes and pages',
    });
    await field.click();
    const dialog = page.getByRole('dialog', { name: 'Search and jump' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('searchbox', { name: 'Search notes' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(field).toBeFocused();
  });

  test('palette actions toggle the theme and switch the language', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/en/projects');
    const html = page.locator('html');
    const dialog = page.getByRole('dialog', { name: 'Search and jump' });
    const actions = dialog.getByRole('group', { name: 'Actions' });

    await expect(page.getByRole('button', { name: /Search and jump/ })).toBeVisible();
    await page.keyboard.press('ControlOrMeta+k');
    await actions.getByRole('button', { name: 'Toggle theme' }).click();
    await expect(html).toHaveClass(/\bdark\b/);
    await expect(dialog).toBeHidden();

    await page.keyboard.press('ControlOrMeta+k');
    await actions.getByRole('button', { name: 'Toggle theme' }).click();
    await expect(html).not.toHaveClass(/\bdark\b/);

    await page.keyboard.press('ControlOrMeta+k');
    await actions.getByRole('link', { name: /Switch language/ }).click();
    await expect(page).toHaveURL(/\/vi\/projects\/?$/);
    await expect(html).toHaveAttribute('lang', 'vi');
  });

  test('dismissing the language toast persists across reload', async ({ browser }) => {
    const context = await browser.newContext({ locale: 'en-US' });
    const page = await context.newPage();
    try {
      await page.goto('/vi');
      const toast = page.getByRole('complementary', { name: 'Ngôn ngữ' });
      await expect(toast.getByRole('link', { name: 'Xem bằng tiếng Anh' })).toHaveAttribute(
        'href',
        '/en',
      );
      await toast.getByRole('button', { name: 'Đóng' }).click();
      await expect(toast).toHaveCount(0);

      await page.reload();
      // Both the toast and the desktop ⌘K button appear only after hydration.
      await expect(page.getByRole('button', { name: /Tìm và nhảy/ })).toBeVisible();
      await expect(toast).toHaveCount(0);
    } finally {
      await context.close();
    }
  });
});
