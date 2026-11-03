import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

import { createReviewer, signIn } from './helpers/auth';
import { E2E_ADMIN, E2E_USER, e2eAdminPin, e2eUserPin } from './helpers/credentials';

const OUTPUT = join(process.env.HOME ?? '/tmp', 'Desktop/lilp-admin-demo-20261102');
const ROUTES = [
  ['dashboard', '/admin', { en: 'Dashboard', vi: 'Bảng điều khiển' }],
  ['analytics', '/admin/analytics', { en: 'Analytics', vi: 'Phân tích' }],
  ['stats', '/admin/stats', { en: 'Profile stats', vi: 'Chỉ số hồ sơ' }],
  ['audit', '/admin/audit', { en: 'Audit log', vi: 'Nhật ký hoạt động' }],
] as const;

type Locale = 'en' | 'vi';
type Capture = {
  route: string;
  locale: Locale;
  state: string;
  theme: string;
  width: number;
  file: string;
};

async function capture(
  page: Page,
  entries: Capture[],
  route: string,
  locale: Locale,
  state: string,
  expected: string,
) {
  await mkdir(OUTPUT, { recursive: true });
  for (const theme of ['light', 'dark'] as const) {
    await page.evaluate((next) => localStorage.setItem('theme', next), theme);
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page.locator('html')).toHaveClass(new RegExp(`\\b${theme}\\b`));
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 });
      if (state === 'normal') {
        await expect(page.getByRole('heading', { name: expected, exact: true })).toBeVisible();
      } else {
        await expect(page.getByText(expected, { exact: true }).first()).toBeVisible();
      }
      const file = `${route}-${locale}-${state}-${theme}-${width}.png`;
      await page.screenshot({ path: join(OUTPUT, file), animations: 'disabled' });
      entries.push({ route, locale, state, theme, width, file });
    }
  }
}

async function login(page: Page, locale: Locale, account = E2E_ADMIN, pin = e2eAdminPin()) {
  await page.goto('/admin/login');
  await page
    .context()
    .addCookies([{ name: 'NEXT_LOCALE', value: locale, domain: '127.0.0.1', path: '/' }]);
  await page.reload();
  await page.getByLabel(locale === 'vi' ? 'Email' : 'Email').fill(account.email);
  await page.getByRole('textbox', { name: locale === 'vi' ? 'Mật khẩu' : 'Password' }).fill(pin);
  await page.getByRole('button', { name: locale === 'vi' ? 'Đăng nhập' : 'Sign in' }).click();
  await page.waitForURL(/\/admin(?!\/login)/);
}

for (const locale of ['en', 'vi'] as const) {
  test(`production admin shell and insights work in ${locale}`, async ({ page }) => {
    test.setTimeout(300_000);
    const entries: Capture[] = [];
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(`${page.url()}: ${error.message}`));
    page.on('console', (message) => {
      if (message.type() === 'error' && /hydration|uncaught/i.test(message.text()))
        errors.push(`${page.url()}: ${message.text()}`);
    });

    await page.goto('/admin/login');
    await page
      .context()
      .addCookies([{ name: 'NEXT_LOCALE', value: locale, domain: '127.0.0.1', path: '/' }]);
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(
      page.getByRole('heading', { name: locale === 'vi' ? 'Đăng nhập' : 'Sign in' }),
    ).toBeVisible();
    const reveal = page.getByRole('button', {
      name: locale === 'vi' ? 'Hiện mật khẩu' : 'Show password',
    });
    await reveal.click();
    await expect(
      page.getByRole('button', { name: locale === 'vi' ? 'Ẩn mật khẩu' : 'Hide password' }),
    ).toBeVisible();
    await page
      .getByRole('button', { name: locale === 'vi' ? 'Ẩn mật khẩu' : 'Hide password' })
      .click();
    await capture(
      page,
      entries,
      'login',
      locale,
      'normal',
      locale === 'vi' ? 'Đăng nhập' : 'Sign in',
    );
    await login(page, locale);

    for (const [route, href, headings] of ROUTES) {
      await page.goto(href);
      await expect(
        page.getByRole('heading', { name: headings[locale], exact: true }),
      ).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('body')).not.toContainText('Internal Server Error');
      await capture(page, entries, route, locale, 'normal', headings[locale]);
    }

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/admin');
    await page.locator('[data-slot="dashboard-card"] a[href="/admin/analytics"]').first().click();
    await expect(page).toHaveURL(/\/admin\/analytics$/);
    await page.locator('aside a[href="/admin/stats"]').click();
    await expect(page.getByRole('heading', { name: ROUTES[2][2][locale] })).toBeVisible();
    await page.locator('aside a[href="/admin/audit"]').click();
    await expect(page).toHaveURL(/\/admin\/audit$/);

    await page.setViewportSize({ width: 390, height: 900 });
    const more = page.getByRole('button', { name: locale === 'vi' ? 'Thêm' : 'More' });
    await more.focus();
    await expect(more).toBeFocused();
    await more.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(more).toBeFocused();

    for (const theme of ['light', 'dark'] as const) {
      for (const width of [1440, 390]) {
        await page.evaluate((next) => localStorage.setItem('theme', next), theme);
        await page.setViewportSize({ width, height: 900 });
        await page.goto('/admin');
        await page.waitForLoadState('networkidle');
        await page.route('**/*', async (request) => {
          const headers = request.request().headers();
          if (headers.rsc !== '1') return request.fallback();
          if (headers['next-router-prefetch']) return request.abort();
          await new Promise((resolve) => setTimeout(resolve, 3_000));
          await request.fallback().catch(() => undefined);
        });
        await page
          .locator('a[href="/admin/analytics"]:visible')
          .first()
          .click({ noWaitAfter: true });
        await expect(page.locator('[data-slot="page-skeleton"]')).toBeVisible({ timeout: 1_500 });
        await expect(page.locator('html')).toHaveClass(new RegExp(`\\b${theme}\\b`));
        const file = `analytics-${locale}-loading-${theme}-${width}.png`;
        await page.screenshot({ path: join(OUTPUT, file), animations: 'disabled' });
        entries.push({ route: 'analytics', locale, state: 'loading', theme, width, file });
        await page.unroute('**/*');
      }
    }

    await page.goto('/admin/no-such-route');
    await expect(
      page.getByRole('heading', {
        name: locale === 'vi' ? 'Không tìm thấy trang quản trị' : 'Admin page not found',
      }),
    ).toBeVisible();
    await capture(
      page,
      entries,
      'not-found',
      locale,
      'normal',
      locale === 'vi' ? 'Không tìm thấy trang quản trị' : 'Admin page not found',
    );

    await page.route('**/api/admin/audit?**', (request) =>
      request.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [], nextCursor: null }),
      }),
    );
    await page.goto('/admin/audit');
    const empty = locale === 'vi' ? 'Chưa có hoạt động.' : 'No activity yet.';
    await expect(page.getByText(empty)).toBeVisible();
    await capture(page, entries, 'audit', locale, 'empty', empty);
    await page.unroute('**/api/admin/audit?**');
    await page.route('**/api/admin/audit?**', (request) =>
      request.fulfill({ status: 400, contentType: 'application/json', body: '{}' }),
    );
    await page.goto('/admin/audit');
    const retry = locale === 'vi' ? 'Thử lại' : 'Retry';
    await expect(page.getByRole('button', { name: retry })).toBeVisible();
    await capture(page, entries, 'audit', locale, 'error', retry);
    await page.unroute('**/api/admin/audit?**');

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/admin');
    const toggle = page.getByRole('button', {
      name: locale === 'vi' ? 'Đổi giao diện' : 'Toggle theme',
    });
    await toggle.focus();
    await expect(toggle).toBeFocused();
    await toggle.click();
    await expect(page.locator('html')).toHaveClass(/\blight\b/);
    const axe = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
      .analyze();
    expect(axe.violations).toEqual([]);
    expect(errors).toEqual([]);
    await writeFile(
      join(OUTPUT, `r3-08-manifest-${locale}.json`),
      JSON.stringify(entries, null, 2),
    );
  });
}

test('reviewer cannot open admin-only insights', async ({ page }) => {
  test.setTimeout(120_000);
  await signIn(page);
  await createReviewer(page);
  await page.getByRole('button', { name: /E2E Admin/ }).click();
  await page.getByRole('menuitem', { name: 'Log out' }).click();
  await page.waitForURL(/\/admin\/login/);
  await login(page, 'en', E2E_USER, e2eUserPin());
  await expect(page.getByRole('link', { name: 'Audit log' })).toHaveCount(0);
  await page.goto('/admin/audit');
  await expect(page.getByRole('heading', { name: 'Admin page not found' })).toBeVisible();
});
