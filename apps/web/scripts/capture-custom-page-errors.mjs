import { chromium } from '@playwright/test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const origin = process.env.DEMO_ORIGIN ?? 'http://localhost:3101';
const output = path.join(os.homedir(), 'Desktop/lilp-admin-demo-20261102');
const browser = await chromium.launch({ headless: true });
const results = [];
fs.mkdirSync(output, { recursive: true });

for (const width of [1440, 390]) {
  for (const locale of ['en', 'vi']) {
    for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({
        viewport: { width, height: width === 390 ? 844 : 900 },
        colorScheme: theme,
        reducedMotion: 'reduce',
      });
      await context.addInitScript((value) => localStorage.setItem('theme', value), theme);
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      for (const [state, slug] of [
        ['error', 'demo-error'],
        ['not-found', 'demo-missing'],
      ]) {
        const response = await page.goto(`${origin}/${locale}/${slug}`, { waitUntil: 'load' });
        const heading =
          state === 'error'
            ? locale === 'vi'
              ? 'Đã xảy ra lỗi'
              : 'Something went wrong'
            : locale === 'vi'
              ? 'Không tìm thấy trang này'
              : 'This page is missing';
        await page.getByRole('heading', { name: heading }).waitFor();
        await page.evaluate(() => document.fonts.ready);
        const stateResult = await page.evaluate(() => ({
          lang: document.documentElement.lang,
          dark: document.documentElement.classList.contains('dark'),
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
        }));
        const retry = await page
          .getByRole('button', { name: locale === 'vi' ? 'Thử lại' : 'Retry' })
          .count();
        const file = `custom-page-${state}${locale === 'vi' ? '-vi' : ''}${theme === 'dark' ? '-dark' : ''}-${width}.png`;
        await page.screenshot({ path: path.join(output, file), animations: 'disabled' });
        results.push({
          file,
          state,
          status: response?.status(),
          retry,
          errors: [...errors],
          ...stateResult,
        });
        errors.length = 0;
      }
      await context.close();
    }
  }
}
await browser.close();

const failures = results.filter(
  (item) =>
    item.errors.length ||
    item.overflow ||
    item.lang !== (item.file.includes('-vi') ? 'vi' : 'en') ||
    item.dark !== item.file.includes('-dark-') ||
    item.retry !== (item.state === 'error' ? 1 : 0),
);
fs.writeFileSync(
  path.join(output, 'custom-page-error-review.json'),
  JSON.stringify(
    {
      buildId: fs.readFileSync(new URL('../.next/BUILD_ID', import.meta.url), 'utf8').trim(),
      results,
      failures,
    },
    null,
    2,
  ),
);
console.log(`Captured ${results.length} custom-page error PNGs; ${failures.length} findings`);
for (const failure of failures) console.log(JSON.stringify(failure));
if (failures.length) process.exitCode = 1;
