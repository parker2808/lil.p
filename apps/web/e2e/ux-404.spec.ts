import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

import { signIn } from './helpers/auth';

async function expectNoAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
}

for (const { locale, title, links } of [
  { locale: 'vi', title: 'Không tìm thấy trang này', links: ['Trang chủ', 'Dự án', 'Liên hệ'] },
  { locale: 'en', title: 'This page is missing', links: ['Home', 'Projects', 'Contact'] },
]) {
  test(`${locale} unknown page renders a translated 404 inside the site shell`, async ({
    page,
  }) => {
    const response = await page.goto(`/${locale}/zzz`);
    expect(response?.status()).toBe(404);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page).toHaveTitle(title);
    await expect(page.locator('.public-site header')).toBeVisible();
    await expect(page.locator('.public-site footer')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();

    const nav = page.getByRole('navigation', {
      name: locale === 'vi' ? 'Khám phá trang web' : 'Explore the site',
    });
    for (const [index, path] of ['', '/projects', '/contact'].entries()) {
      await expect(nav.getByRole('link', { name: links[index] })).toHaveAttribute(
        'href',
        `/${locale}${path}`,
      );
      await expect(nav.getByRole('link', { name: links[index] })).toBeVisible();
    }
    await expectNoAxeViolations(page);
  });
}

test('unknown admin page renders a 404 inside AdminShell', async ({ page }) => {
  await signIn(page);
  const response = await page.goto('/admin/zzz');
  expect(response?.status()).toBe(404);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('.admin-shell')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1, name: 'Admin page not found' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Back to dashboard' })).toHaveAttribute(
    'href',
    '/admin',
  );
  expect(await page.locator('a:visible').count()).toBeGreaterThanOrEqual(3);
  await expectNoAxeViolations(page);
});
