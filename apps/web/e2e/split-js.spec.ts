import { expect, type Page, test } from '@playwright/test';

/** Returns the chunk URLs requested so far, collecting new ones as they arrive. */
async function trackChunks(page: Page) {
  const chunks = new Set<string>();
  page.on('request', (request) => {
    if (request.url().includes('/_next/static/chunks/')) {
      chunks.add(request.url());
    }
  });
  await page.goto('/vi');
  await page.waitForLoadState('networkidle');
  return chunks;
}

test.describe('split JS: command palette and theme menu', () => {
  test('⌘K loads the command palette on demand and still opens it', async ({ page }) => {
    const chunks = await trackChunks(page);
    const loaded = new Set(chunks);
    const trigger = page.getByRole('button', { name: /Tìm và nhảy/ });
    await expect(trigger).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);

    await page.keyboard.press('ControlOrMeta+k');
    const dialog = page.getByRole('dialog', { name: 'Tìm và nhảy' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('searchbox', { name: 'Tìm ghi chú' })).toBeVisible();
    expect([...chunks].filter((url) => !loaded.has(url)).length).toBeGreaterThan(0);

    await page.keyboard.press('ControlOrMeta+k');
    await expect(dialog).toBeHidden();

    await trigger.click();
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('the theme menu loads on first click and switches the theme', async ({ page }) => {
    const chunks = await trackChunks(page);
    await expect(page.getByRole('menu')).toHaveCount(0);
    const loaded = new Set(chunks);

    const trigger = page.getByRole('button', { name: 'Giao diện' }).first();
    await trigger.click();
    await page.getByRole('menuitemradio', { name: 'Tối' }).click();
    await expect(page.locator('html')).toHaveClass(/\bdark\b/);
    expect([...chunks].filter((url) => !loaded.has(url)).length).toBeGreaterThan(0);

    await trigger.click();
    await page.getByRole('menuitemradio', { name: 'Sáng' }).click();
    await expect(page.locator('html')).not.toHaveClass(/\bdark\b/);
  });
});
