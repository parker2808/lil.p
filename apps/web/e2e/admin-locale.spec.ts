import { expect, test } from '@playwright/test';

import { signIn } from './helpers/auth';

test('admin locale switch persists and localizes dashboard activity time', async ({ page }) => {
  await signIn(page);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');

  await page.getByRole('combobox', { name: 'Language' }).selectOption('vi');
  await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
  await expect
    .poll(
      async () =>
        (await page.context().cookies()).find((cookie) => cookie.name === 'NEXT_LOCALE')?.value,
    )
    .toBe('vi');
  await expect(page.locator('[data-slot="audit-row"] time').first()).toContainText(/bây giờ|trước/);

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
  await expect(page.locator('[data-slot="audit-row"] time').first()).toContainText(/bây giờ|trước/);
});
