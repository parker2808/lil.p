import { mkdir, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';

import { expect, test } from '@playwright/test';

const captureDir = join(homedir(), 'Desktop/lilp-design-demo-20261102');
const captures: {
  route: string;
  locale: string;
  state: string;
  theme: string;
  width: number;
  file: string;
}[] = [];

test('real contact email action succeeds and fails accessibly in EN/VI', async ({ page }) => {
  test.setTimeout(240_000);
  for (const locale of ['en', 'vi'] as const) {
    await page.goto(`/${locale}/contact`);
    const copyName = locale === 'en' ? 'Copy email' : 'Sao chép email';
    const linkName = locale === 'en' ? 'Email' : 'Email';
    const success = locale === 'en' ? 'Copied' : 'Đã sao chép';
    const failure =
      locale === 'en'
        ? "Couldn't copy email. Use the email link instead."
        : 'Không thể sao chép email. Hãy dùng liên kết email.';
    const button = page.getByRole('button', { name: copyName }).first();
    const link = page.getByRole('link', { name: linkName, exact: true }).first();
    await expect(button).toBeVisible();
    await expect(link).toHaveAttribute('href', /^mailto:(?!undefined$).+$/);
    await button.focus();
    await expect(button).toBeFocused();

    for (const state of ['success', 'failure'] as const) {
      for (const theme of ['light', 'dark'] as const) {
        for (const width of [1440, 390] as const) {
          await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
          await page.evaluate((value) => {
            localStorage.setItem('theme', value);
          }, theme);
          await page.reload();
          await expect(page.locator('html')).toHaveClass(theme === 'dark' ? /dark/ : /light/);
          await page.evaluate((copyFails) => {
            Object.defineProperty(navigator, 'clipboard', {
              configurable: true,
              value: {
                writeText: copyFails
                  ? () => Promise.reject(new Error('blocked'))
                  : () => Promise.resolve(),
              },
            });
            Object.defineProperty(document, 'execCommand', {
              configurable: true,
              value: () => false,
            });
          }, state === 'failure');
          await button.focus();
          await page.keyboard.press('Enter');
          await expect(button).toBeFocused();
          await expect(
            page.getByText(state === 'success' ? success : failure).last(),
          ).toBeVisible();
          await expect(link).toHaveAttribute('href', /^mailto:(?!undefined$).+$/);
          if (width === 390) {
            for (const control of [button, link]) {
              const box = await control.boundingBox();
              expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
              expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
            }
          }
          const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth - innerWidth,
          );
          expect(overflow).toBeLessThanOrEqual(1);
          await mkdir(captureDir, { recursive: true });
          const file = `contact-email-${locale}-${state}-${theme}-${width}.png`;
          await page.screenshot({
            path: join(captureDir, file),
            fullPage: true,
            animations: 'disabled',
          });
          captures.push({ route: 'contact-email', locale, state, theme, width, file });
        }
      }
    }

    await page.setViewportSize({ width: 1440, height: 900 });
    const trigger = page
      .getByRole('banner')
      .getByRole('button', { name: /Search and jump|Tìm và nhảy/ });
    await trigger.focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('button', { name: copyName })).toBeVisible();
    await expect(
      dialog.getByRole('link', { name: locale === 'en' ? 'Email me' : 'Gửi email' }),
    ).toHaveAttribute('href', /^mailto:(?!undefined$).+$/);
    await dialog.getByRole('button', { name: copyName }).click();
    await expect(page.getByText(failure).last()).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
  }
  await writeFile(join(captureDir, 'r3-06-manifest.json'), JSON.stringify(captures, null, 2));
});
