import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const shots = join(import.meta.dirname, '__screenshots__');
const routes = ['home', 'components', 'editor', 'unknown'] as const;

for (const locale of ['en', 'vi'] as const) {
  test(`${locale} navigation, editing and unknown protection`, async ({ page }) => {
    await page.goto(`/${locale}/`);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page.locator('main h1')).toHaveCount(1);
    await page.getByRole('link', { name: locale === 'en' ? 'Editor' : 'Trình biên tập' }).click();
    const paragraph = page.getByRole('button', { name: /2\. (Paragraph|Đoạn văn)/ });
    await paragraph.click();
    await paragraph.focus();
    await page.keyboard.press('Alt+ArrowDown');
    await expect(page.getByRole('button', { name: /3\. (Paragraph|Đoạn văn)/ })).toHaveAttribute(
      'aria-current',
      'true',
    );
    await expect(page.locator('.fixture-properties textarea[lang="vi"]')).toBeVisible();
    await page.goto(`/${locale}/unknown`);
    await expect(page.locator('[data-unknown="not-installed"]')).toBeVisible();
    await expect(page.getByTestId('source-snapshot')).toContainText('future');
    await page.goto(`/${locale}/not-a-route`);
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  });
}

test('neutral and token override keep WCAG AA in both modes and widths', async ({ page }) => {
  for (const locale of ['en', 'vi'])
    for (const brand of ['neutral', 'lilp'])
      for (const mode of ['light', 'dark'])
        for (const width of [1440, 390]) {
          await page.setViewportSize({ width, height: 900 });
          await page.goto(`/${locale}/editor?mode=${mode}&brand=${brand}`);
          await expect(page.locator('.fixture-properties')).toBeVisible();
          const report = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
            .analyze();
          expect(report.violations, `${locale}/${brand}/${mode}/${width}`).toEqual([]);
          expect(
            await page.evaluate(() => document.documentElement.scrollWidth),
          ).toBeLessThanOrEqual(width);
        }
});

test('captures the complete route, locale, theme, brand and viewport matrix', async ({ page }) => {
  test.skip(process.env.FIXTURE_CAPTURE !== '1', 'Opt-in visual capture under the shared E2E lock');
  mkdirSync(shots, { recursive: true });
  const head = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  const manifest: Array<{
    file: string;
    locale: string;
    theme: string;
    brand: string;
    width: number;
    route: string;
    head: string;
  }> = [];
  for (const locale of ['en', 'vi'])
    for (const brand of ['neutral', 'lilp'])
      for (const theme of ['light', 'dark'])
        for (const width of [1440, 390])
          for (const route of routes) {
            await page.setViewportSize({ width, height: 900 });
            await page.goto(
              `/${locale}/${route === 'home' ? '' : route}?mode=${theme}&brand=${brand}`,
            );
            await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
            await expect(page.locator('.cms-core')).toHaveAttribute('data-brand', brand);
            if (route === 'editor')
              await expect(page.locator('.fixture-outline-item').first()).toBeVisible();
            if (route === 'components')
              await expect(page.locator('.fixture-gallery-card').first()).toBeVisible();
            if (route === 'unknown')
              await expect(page.getByTestId('source-snapshot')).toBeVisible();
            if (route === 'home') await expect(page.locator('.fixture-page-content')).toBeVisible();
            expect(
              await page.evaluate(() => document.documentElement.scrollWidth),
            ).toBeLessThanOrEqual(width);
            const file = `${locale}-${brand}-${theme}-${width}-${route}.png`;
            await page.screenshot({
              path: join(shots, file),
              fullPage: true,
              animations: 'disabled',
            });
            manifest.push({ file, locale, theme, brand, width, route, head });
            if (route === 'components') {
              await page
                .getByRole('button', { name: locale === 'en' ? 'Retry' : 'Thử lại' })
                .focus();
              const focusFile = `${locale}-${brand}-${theme}-${width}-components-focus.png`;
              await page.screenshot({
                path: join(shots, focusFile),
                fullPage: true,
                animations: 'disabled',
              });
              manifest.push({
                file: focusFile,
                locale,
                theme,
                brand,
                width,
                route: 'components-focus',
                head,
              });
            }
          }
  writeFileSync(join(shots, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  expect(manifest).toHaveLength(80);
});
