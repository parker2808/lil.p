import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import { expect, test } from '@playwright/test';

import { signIn } from './helpers/auth';

const source = resolve(
  import.meta.dirname,
  '../../../packages/ui/src/components/BrandMark/brand-icon.svg',
);
const publicDir = resolve(process.env.HOME ?? '', 'Desktop/lilp-design-demo-20261102');
const adminDir = resolve(process.env.HOME ?? '', 'Desktop/lilp-admin-demo-20261102');
const captures: {
  route: string;
  locale: string;
  state: string;
  theme: string;
  width: number;
  file: string;
}[] = [];

async function capture(
  page: import('@playwright/test').Page,
  folder: string,
  route: string,
  locale: string,
  theme: string,
  width: number,
) {
  await mkdir(folder, { recursive: true });
  const file = `${route}-${locale}-normal-${theme}-${width}.png`;
  await page.screenshot({ path: join(folder, file), fullPage: true, animations: 'disabled' });
  captures.push({ route, locale, state: 'normal', theme, width, file });
}

async function iconsAndTheme(page: import('@playwright/test').Page, theme: string) {
  await expect(page.locator('html')).toHaveClass(new RegExp(`(?:^|\\s)${theme}(?:\\s|$)`));
  const icon = page.locator('link[rel="icon"]');
  await expect(icon).toHaveAttribute('href', /icon\.svg/);
  const body = await (await page.request.get((await icon.getAttribute('href'))!)).text();
  expect(body.trim()).toBe((await readFile(source, 'utf8')).trim());
  const apple = page.locator('link[rel="apple-touch-icon"]');
  await expect(apple).toHaveAttribute('href', /apple-icon\.png/);
  const appleResponse = await page.request.get((await apple.getAttribute('href'))!);
  expect(appleResponse.ok()).toBeTruthy();
  expect((await appleResponse.body()).subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
}

async function brandContrast(page: import('@playwright/test').Page, surface: string) {
  const ratios = await page.locator(surface).evaluate((node) => {
    const css = getComputedStyle(node);
    const luminance = (hex: string) => {
      const channels = hex
        .trim()
        .replace('#', '')
        .match(/.{2}/g)!
        .map((part) => {
          const value = parseInt(part, 16) / 255;
          return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
        });
      return channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722;
    };
    const background = luminance(css.getPropertyValue('--background'));
    return ['--foreground', '--brand-orange', '--brand-green'].map((token) => {
      const value = luminance(css.getPropertyValue(token));
      return (Math.max(value, background) + 0.05) / (Math.min(value, background) + 0.05);
    });
  });
  for (const ratio of ratios) expect(ratio).toBeGreaterThanOrEqual(4.5);
}

test.setTimeout(240_000);

test('real public header and footer share the brand in both locales and themes', async ({
  page,
}) => {
  for (const locale of ['en', 'vi'])
    for (const width of [1440, 390])
      for (const theme of ['light', 'dark']) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`/${locale}`);
        await page.evaluate((value) => localStorage.setItem('theme', value), theme);
        await page.reload();
        await iconsAndTheme(page, theme);
        await brandContrast(page, '.public-site');
        for (const region of ['.site-header', '.site-footer']) {
          const mark = page.locator(`${region} .brand-mark`);
          await expect(mark).toHaveAttribute('aria-label', 'lil.parker');
          await expect(mark.locator('img')).toHaveAttribute('src', '/icon.svg');
          await expect(mark.locator('.brand-mark-word')).toHaveText('lil.parker');
        }
        const link = page.locator('.site-header a:has(.brand-mark)');
        await link.focus();
        await expect(link).toBeFocused();
        expect(await link.evaluate((node) => getComputedStyle(node).outlineStyle)).not.toBe('none');
        await capture(page, publicDir, 'home', locale, theme, width);
      }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(
    await page
      .locator('html')
      .evaluate((node) => getComputedStyle(node).getPropertyValue('--dur-base').trim()),
  ).toMatch(/^0(?:ms|s)$/);
  await writeFile(
    join(publicDir, 'r3-01-brand-manifest.json'),
    JSON.stringify(
      captures.filter((c) => c.route === 'home'),
      null,
      2,
    ),
  );
});

test('real admin login and shell share the brand in both locales and themes', async ({ page }) => {
  for (const locale of ['en', 'vi'])
    for (const width of [1440, 390])
      for (const theme of ['light', 'dark']) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto('/admin/login');
        await page.context().addCookies([{ name: 'NEXT_LOCALE', value: locale, url: page.url() }]);
        await page.evaluate((value) => localStorage.setItem('theme', value), theme);
        await page.reload();
        await expect(page.locator('html')).toHaveAttribute('lang', locale);
        await iconsAndTheme(page, theme);
        await brandContrast(page, '.admin');
        const mark = page.locator('.login-art .brand-mark');
        await expect(mark).toHaveAttribute('aria-label', 'lil.parker');
        await expect(mark.locator('img')).toHaveAttribute('src', '/icon.svg');
        await capture(page, adminDir, 'login', locale, theme, width);
      }
  await page.context().addCookies([{ name: 'NEXT_LOCALE', value: 'en', url: page.url() }]);
  await signIn(page);
  for (const locale of ['en', 'vi'])
    for (const width of [1440, 390])
      for (const theme of ['light', 'dark']) {
        await page.setViewportSize({ width, height: 900 });
        await page.context().addCookies([{ name: 'NEXT_LOCALE', value: locale, url: page.url() }]);
        await page.evaluate((value) => localStorage.setItem('theme', value), theme);
        await page.goto('/admin');
        await expect(page.locator('html')).toHaveAttribute('lang', locale);
        await iconsAndTheme(page, theme);
        await brandContrast(page, '.admin');
        const link = page.locator(
          width === 1440
            ? '.redesign-sidebar .admin-brand-link'
            : '.admin-topbar .admin-brand-link',
        );
        await expect(link.locator('.brand-mark')).toHaveAttribute('aria-label', 'lil.parker');
        await expect(link.locator('img')).toHaveAttribute('src', '/icon.svg');
        await link.focus();
        await expect(link).toBeFocused();
        expect(await link.evaluate((node) => getComputedStyle(node).outlineStyle)).not.toBe('none');
        await capture(page, adminDir, 'dashboard', locale, theme, width);
      }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(
    await page
      .locator('html')
      .evaluate((node) => getComputedStyle(node).getPropertyValue('--dur-base').trim()),
  ).toMatch(/^0(?:ms|s)$/);
  await writeFile(
    join(adminDir, 'r3-01-brand-manifest.json'),
    JSON.stringify(
      captures.filter((c) => c.route !== 'home'),
      null,
      2,
    ),
  );
});
