import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { expect, test, type Locator } from '@playwright/test';

import { signIn } from './helpers/auth';

async function expectTargetSize(target: Locator) {
  await expect(target).toBeVisible();
  const bounds = await target.boundingBox();
  expect(bounds?.width, 'target width').toBeGreaterThanOrEqual(44);
  expect(bounds?.height, 'target height').toBeGreaterThanOrEqual(44);
}

test('shared public fields, actions and navigation keep 44px targets', async ({ page }) => {
  for (const locale of ['en', 'vi'] as const) {
    for (const theme of ['light', 'dark'] as const) {
      for (const width of [1440, 390] as const) {
        await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
        await page.goto(`/${locale}/contact`);
        await page.evaluate((nextTheme) => localStorage.setItem('theme', nextTheme), theme);
        await page.reload();
        await expect(page.locator('html')).toHaveClass(new RegExp(`(?:^|\\s)${theme}(?:\\s|$)`));
        await expectTargetSize(page.locator('#name'));
        await expectTargetSize(page.locator('footer nav a').first());
        await expectTargetSize(page.locator('form button[type="submit"]'));
      }
    }
  }
});

test('shared admin tabs, fields and navigation keep 44px targets', async ({ page }) => {
  await signIn(page);
  const origin = new URL(page.url()).origin;
  for (const locale of ['en', 'vi'] as const) {
    await page.context().addCookies([{ name: 'NEXT_LOCALE', value: locale, url: origin }]);
    for (const theme of ['light', 'dark'] as const) {
      for (const width of [1440, 390] as const) {
        await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
        await page.goto('/admin/site');
        await page.evaluate((nextTheme) => localStorage.setItem('theme', nextTheme), theme);
        await page.reload();
        await expect(page.locator('html')).toHaveClass(new RegExp(`(?:^|\\s)${theme}(?:\\s|$)`));
        await expectTargetSize(page.locator('[data-slot="tabs-trigger"]').first());
        await expectTargetSize(page.locator('#siteName'));
        if (width === 1440)
          await expectTargetSize(page.locator('[data-slot="sidebar-menu-button"]').first());
      }
    }
  }
});

test('reviewable interactive component samples', async ({ browser, page }) => {
  const directory = process.env.U2_COMPONENT_CAPTURE_DIR;
  test.skip(!directory, 'Opt-in design samples outside the repository');
  test.setTimeout(240_000);
  await mkdir(directory!, { recursive: true });
  await signIn(page);
  const origin = new URL(page.url()).origin;
  const publicContext = await browser.newContext();
  const publicPage = await publicContext.newPage();
  const samples: Array<{
    locale: string;
    theme: string;
    width: number;
    state: string;
    file: string;
  }> = [];

  try {
    for (const locale of ['en', 'vi'] as const) {
      await page.context().addCookies([{ name: 'NEXT_LOCALE', value: locale, url: origin }]);
      await publicContext.addCookies([{ name: 'NEXT_LOCALE', value: locale, url: origin }]);
      for (const theme of ['light', 'dark'] as const) {
        for (const width of [1440, 390] as const) {
          await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
          await publicPage.setViewportSize({ width, height: width === 390 ? 844 : 900 });
          for (const [state, route] of [
            ['fields-select', `/${locale}/contact`],
            ['table', '/admin/projects'],
            ['editor-radio', '/admin/pages/home'],
          ] as const) {
            const target = state === 'fields-select' ? publicPage : page;
            await target.goto(route);
            await target.evaluate((nextTheme) => localStorage.setItem('theme', nextTheme), theme);
            await target.reload();
            await expect(target.locator('html')).toHaveClass(
              new RegExp(`(?:^|\\s)${theme}(?:\\s|$)`),
            );
            if (state === 'fields-select') {
              await target.locator('#topic').scrollIntoViewIfNeeded();
              await target.locator('#topic').click();
              await expect(target.getByRole('option').first()).toBeVisible();
            }
            if (state === 'table') {
              await expect(
                target.locator('[data-slot="table-body"] [data-slot="table-row"]').first(),
              ).toBeVisible();
            }
            if (state === 'editor-radio') {
              await page.locator('[data-slot="block-row"] > button').first().click();
              if (width === 390) {
                await page
                  .getByRole('button', { name: locale === 'en' ? 'Inspector' : 'Bảng chỉnh sửa' })
                  .click();
              }
              await page
                .getByRole('tab', { name: locale === 'en' ? 'Appearance' : 'Giao diện' })
                .click();
              await expect(page.getByRole('radiogroup')).toBeVisible();
            }
            const file = `${state}-${locale}-${theme}-${width}.png`;
            await target.screenshot({
              path: join(directory!, file),
              fullPage: state !== 'fields-select',
              animations: 'disabled',
              style: 'input[type=email],a[href^="mailto:"]{visibility:hidden!important}',
            });
            samples.push({ locale, theme, width, state, file });
          }
        }
      }
    }
    await writeFile(join(directory!, 'manifest.json'), JSON.stringify(samples, null, 2));
  } finally {
    await publicContext.close();
  }
});
