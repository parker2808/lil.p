import { expect, test, type Locator, type Page } from '@playwright/test';

const widths = [768, 1024, 1280] as const;

async function expectInViewport(page: Page, controls: Locator) {
  expect(await controls.count()).toBeGreaterThan(0);
  for (const control of await controls.all()) {
    const box = await control.boundingBox();
    if (!box) throw new Error('Header control has no bounding box');
    expect(box.x).toBeGreaterThanOrEqual(-1);
    expect(box.x + box.width).toBeLessThanOrEqual((page.viewportSize()?.width ?? 0) + 1);
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
}

for (const locale of ['en', 'vi'] as const) {
  for (const theme of ['light', 'dark'] as const) {
    test(`public header fits ${locale}/${theme} tablet and desktop`, async ({ page }, testInfo) => {
      await page.addInitScript((value) => localStorage.setItem('theme', value), theme);
      await page.goto(`/${locale}`);
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await expect(page.locator('html')).toHaveClass(new RegExp(`(?:^|\\s)${theme}(?:\\s|$)`));

      for (const width of widths) {
        await page.setViewportSize({ width, height: 900 });
        const header = page.locator('header.site-header');
        const brand = header.locator('a:has(.brand-mark)');
        const search = header.getByRole('button', {
          name: locale === 'vi' ? 'Tìm kiếm' : 'Search',
        });
        const controls = header.locator('a:visible, button:visible');

        await expectInViewport(page, controls);
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
        ).toBeLessThanOrEqual(1);
        await brand.focus();

        if (width < 1280) {
          const menu = header.getByRole('button', { name: 'Menu' });
          await expect(menu).toBeVisible();
          await expect(header.locator('nav > a[data-slot="nav-link"]:visible')).toHaveCount(0);
          await page.keyboard.press('Tab');
          await expect(search).toBeFocused();
          await page.keyboard.press('Tab');
          await expect(menu).toBeFocused();
          await testInfo.attach(`${locale}-${theme}-${width}-header`, {
            body: await header.screenshot({ animations: 'disabled' }),
            contentType: 'image/png',
          });
          await menu.click();
          const sheet = page.locator('.mobile-menu-sheet');
          await expect(sheet).toBeVisible();
          await expectInViewport(page, sheet.locator('a:visible, button:visible'));
          await page.keyboard.press('Escape');
          await expect(sheet).not.toBeVisible();
        } else {
          await expect(
            header.locator('nav > a[data-slot="nav-link"]:visible').first(),
          ).toBeVisible();
          await expect(
            header.getByRole('button', { name: locale === 'vi' ? 'Giao diện' : 'Theme' }),
          ).toBeVisible();
          await testInfo.attach(`${locale}-${theme}-${width}-header`, {
            body: await header.screenshot({ animations: 'disabled' }),
            contentType: 'image/png',
          });
        }
      }
    });
  }
}
