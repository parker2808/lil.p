import { chromium } from '@playwright/test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Run against a production web build and the process-local mock admin API only.
const origin = process.env.DEMO_ORIGIN ?? 'http://localhost:3101';
const output = path.join(os.homedir(), 'Desktop/lilp-admin-demo-20261102');
fs.mkdirSync(output, { recursive: true });

const browser = await chromium.launch({ headless: true });
const captures = [];

for (const width of [1440, 390]) {
  for (const locale of ['en', 'vi']) {
    for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({
        viewport: { width, height: width === 390 ? 844 : 900 },
        colorScheme: theme,
        reducedMotion: 'reduce',
      });
      await context.addInitScript((value) => localStorage.setItem('theme', value), theme);
      await context.addCookies([
        { name: 'NEXT_LOCALE', value: locale, url: origin },
        { name: 'access_token', value: 'local-demo', url: origin },
      ]);
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));

      await page.goto(`${origin}/admin/pages`, { waitUntil: 'load' });
      await page
        .getByRole('button', { name: /Add page|Thêm trang/ })
        .first()
        .click();
      const slug = `r3h-${locale}-${theme}-${width}`;
      await page.locator('#create-page-title').fill(locale === 'vi' ? 'Trang mới' : 'New page');
      await page.locator('#create-page-key').fill(slug);
      await page.locator('form button[type="submit"]').click();
      await page.waitForURL(`**/admin/pages/${slug}`);

      const expectedLabels = {
        'page-header': locale === 'vi' ? 'Tiêu đề trang' : 'Page header',
        prose: locale === 'vi' ? 'Văn bản' : 'Prose',
      };
      async function verifyRows() {
        for (const [key, label] of Object.entries(expectedLabels)) {
          const row = page
            .locator('[data-slot="block-row"]')
            .filter({ has: page.locator(`span.font-mono:text-is("${key}")`) });
          await row.waitFor();
          const actual = await row.locator('button span.text-ui.font-medium').textContent();
          if (actual !== label) throw new Error(`${locale} ${key}: primary label was ${actual}`);
          const secondary = await row.locator('button span.text-ui-meta.font-mono').textContent();
          if (secondary !== key)
            throw new Error(`${locale} ${key}: secondary key was ${secondary}`);
        }
      }
      async function capture(state) {
        await verifyRows();
        await page.evaluate(() => document.fonts.ready);
        const browserState = await page.evaluate(() => ({
          lang: document.documentElement.lang,
          dark: document.documentElement.classList.contains('dark'),
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
        }));
        if (
          browserState.lang !== locale ||
          browserState.dark !== (theme === 'dark') ||
          browserState.overflow ||
          errors.length
        ) {
          throw new Error(
            `${state} ${locale} ${theme} ${width}: ${JSON.stringify(browserState)} ${errors}`,
          );
        }
        const file = `real-pages-${state}${locale === 'vi' ? '-vi' : ''}${theme === 'dark' ? '-dark' : ''}-${width}.png`;
        await page.screenshot({ path: path.join(output, file), animations: 'disabled' });
        captures.push(file);
      }

      const publish = page.getByRole('button', {
        name: locale === 'vi' ? 'Xuất bản' : 'Publish',
        exact: true,
      });
      await publish.click();
      await page
        .getByText(
          locale === 'vi'
            ? 'Thêm nội dung hiển thị trước khi xuất bản.'
            : 'Add visible body copy before publishing.',
        )
        .first()
        .waitFor();
      await capture('publish-blocked');

      await page
        .locator('[data-slot="block-row"]')
        .getByText(expectedLabels.prose, { exact: true })
        .click();
      if (width === 390) {
        await page
          .getByRole('button', { name: locale === 'vi' ? 'Bảng chỉnh sửa' : 'Inspector' })
          .click();
      }
      const copy =
        locale === 'vi'
          ? 'Nội dung tiếng Việt đầy đủ cho trang mới.'
          : 'Substantive English copy for the new page.';
      const editor = page
        .locator(
          `[contenteditable="true"][aria-label*="${locale === 'vi' ? 'Vietnamese' : 'English'}"]:visible`,
        )
        .first();
      await editor.waitFor();
      // Wait for the inspector's initial debounced form sync before replacing the draft.
      await page.waitForTimeout(2500);
      const saved = page.waitForResponse(
        (response) =>
          response.request().method() === 'PATCH' &&
          /\/api\/admin\/pages\/[^/]+\/blocks\/\d+$/.test(response.url()) &&
          response.request().postData()?.includes(copy) &&
          response.status() === 200,
      );
      await editor.fill(copy);
      await saved;
      if (width === 390) await page.keyboard.press('Escape');
      await publish.click();
      await page.getByText(locale === 'vi' ? 'Đã xuất bản bản 1' : 'Published v1').waitFor();
      await capture('published');
      await context.close();
    }
  }
}

await browser.close();
console.log(`Captured ${captures.length} verified publish-flow PNGs:`);
for (const file of captures) console.log(file);
