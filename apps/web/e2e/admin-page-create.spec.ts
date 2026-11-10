import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import { expect, test, type Page } from '@playwright/test';

import { signIn } from './helpers/auth';

const folder = resolve(process.env.HOME ?? '', 'Desktop/lilp-admin-demo-20261102');
const manifest: Array<{
  route: string;
  locale: string;
  state: string;
  theme: string;
  width: number;
  file: string;
}> = [];

async function capture(
  page: Page,
  route: string,
  locale: string,
  state: string,
  theme: string,
  width: number,
) {
  await mkdir(folder, { recursive: true });
  const file = `${route}-${locale}-${state}-${theme}-${width}.png`;
  await page.screenshot({ path: join(folder, file), fullPage: true, animations: 'disabled' });
  manifest.push({ route, locale, state, theme, width, file });
}

test.setTimeout(600_000);
test.use({ actionTimeout: 15_000 });

test('real Pages creation validates, recovers from HTTP 409, and opens the editor', async ({
  page,
}) => {
  await signIn(page);
  const origin = new URL(page.url()).origin;

  for (const locale of ['en', 'vi'] as const) {
    await page
      .context()
      .addCookies([{ name: 'NEXT_LOCALE', value: locale, url: origin, sameSite: 'Lax' }]);
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 });
      for (const theme of ['light', 'dark']) {
        await page.goto('/admin/pages');
        await page.evaluate((value) => localStorage.setItem('theme', value), theme);
        await page.reload();
        await expect(page.locator('html')).toHaveAttribute('lang', locale);
        await expect(page.locator('html')).toHaveClass(new RegExp(`(?:^|\\s)${theme}(?:\\s|$)`));
        await expect(
          page.getByRole('heading', { name: locale === 'en' ? 'Pages' : 'Trang' }),
        ).toBeVisible();
        await capture(page, 'admin-pages', locale, 'index', theme, width);

        const create = page.getByRole('button', {
          name: locale === 'en' ? 'Add page' : 'Thêm trang',
        });
        await expect(create).toBeVisible();
        if (width === 390) {
          const box = await create.boundingBox();
          expect(box?.height).toBeGreaterThanOrEqual(44);
        }
        await create.click();
        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        const title = dialog.getByLabel(locale === 'en' ? 'Page title' : 'Tiêu đề trang');
        const slug = dialog.getByLabel(locale === 'en' ? 'Slug' : 'Đường dẫn');
        await expect(title).toBeFocused();
        if (locale === 'en' && width === 1440 && theme === 'light') {
          await page.keyboard.press('Escape');
          await expect(create).toBeFocused();
          await create.press('Enter');
          await expect(title).toBeFocused();
        }
        await title.blur();
        await expect(title).toHaveAttribute('aria-invalid', 'true');
        await expect(slug).not.toHaveAttribute('aria-invalid');
        await title.fill('Động lực mới');
        await expect(slug).toHaveValue('dong-luc-moi');
        await expect(title).not.toHaveAttribute('aria-invalid');
        await slug.fill('bad_slug');
        await expect(slug).toHaveAttribute('aria-invalid', 'true');
        await slug.fill(`r304-${locale}-${theme}-${width}`);
        await expect(slug).not.toHaveAttribute('aria-invalid');
        await dialog.getByLabel(locale === 'en' ? 'Language' : 'Ngôn ngữ').click();
        await page
          .getByRole('option', { name: locale === 'en' ? 'English' : 'Tiếng Việt' })
          .click();
        await dialog.getByLabel(locale === 'en' ? 'Start with' : 'Bắt đầu bằng').click();
        await page
          .getByRole('option', { name: locale === 'en' ? 'Empty blocks' : 'Trang trống' })
          .click();
        await capture(page, 'admin-pages', locale, 'dialog', theme, width);

        const key = `r304-${locale}-${theme}-${width}`;
        const raced = await page.request.post('/api/admin/pages', {
          headers: { Origin: origin },
          data: { title: 'Existing page', key, locale, template: 'empty' },
        });
        expect(raced.status()).toBe(201);
        await slug.press('Enter');
        await expect(slug).toHaveAttribute('aria-invalid', 'true');
        await expect(dialog).toBeVisible();
        await expect(page).toHaveURL(/\/admin\/pages$/);
        await capture(page, 'admin-pages', locale, 'error', theme, width);

        const recoveredKey = `${key}-new`;
        await slug.fill(recoveredKey);
        await expect(slug).not.toHaveAttribute('aria-invalid');
        await slug.press('Enter');
        await page.waitForURL(`/admin/pages/${recoveredKey}`, { timeout: 20_000 });
        const getEditor = await page.request.get(`/api/admin/pages/${recoveredKey}`);
        expect(getEditor.status()).toBe(200);
        const created = (await getEditor.json()) as {
          title: string;
          locale: string;
          blocks: unknown[];
        };
        expect(created.title).toBe('Động lực mới');
        expect(created.locale).toBe(locale);
        expect(created.blocks).toHaveLength(0);
        await expect(page.getByRole('heading', { name: /Động lực mới/ })).toBeVisible();
        await capture(page, 'admin-pages-key', locale, 'editor', theme, width);
      }
    }
  }

  await writeFile(
    join(folder, 'r3-04-page-create-manifest.json'),
    JSON.stringify(manifest, null, 2),
  );
});
