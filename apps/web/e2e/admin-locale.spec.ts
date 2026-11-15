import { expect, test } from '@playwright/test';

import { signIn } from './helpers/auth';

test('admin locale switch persists and localizes dashboard activity time', async ({ page }) => {
  await signIn(page);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');

  await page.getByRole('combobox', { name: 'Language' }).click();
  await page.getByRole('option', { name: 'VI' }).click();
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

test('admin page metadata follows EN/VI cookie on SSR', async ({ page, context }) => {
  await signIn(page);
  const origin = new URL(page.url()).origin;
  for (const [locale, pages, home] of [
    ['en', 'Pages · Admin', 'Edit Home page · Admin'],
    ['vi', 'Trang · Quản trị', 'Chỉnh sửa trang Trang chủ · Quản trị'],
  ] as const) {
    await context.addCookies([{ name: 'NEXT_LOCALE', value: locale, url: origin }]);
    await page.goto('/admin/pages');
    await expect(page).toHaveTitle(pages);
    await page.goto('/admin/pages/home');
    await expect(page).toHaveTitle(home);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
  }
});
