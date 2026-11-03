import { chromium } from '@playwright/test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const origin = process.env.DEMO_ORIGIN ?? 'http://localhost:3101';
const output = path.join(os.homedir(), 'Desktop/lilp-admin-demo-20261102');
fs.mkdirSync(output, { recursive: true });

const browser = await chromium.launch({ headless: true });
const results = [];
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
      const suffix = `${locale === 'vi' ? '-vi' : ''}${theme === 'dark' ? '-dark' : ''}-${width}.png`;

      async function capture(name, url, rowLabels = false) {
        const response = await page.goto(url, { waitUntil: 'load' });
        await page.locator('h1').first().waitFor();
        await page.evaluate(() => document.fonts.ready);
        if (theme === 'dark' && url.includes('/design-demo-admin')) {
          await page.evaluate(() => document.documentElement.classList.add('dark'));
        }
        if (rowLabels) {
          const rows = page.locator('[data-slot="block-row"]');
          await rows.first().waitFor();
          for (const [key, expected] of [
            ['page-header', locale === 'vi' ? 'Tiêu đề trang' : 'Page header'],
            ['prose', locale === 'vi' ? 'Văn bản' : 'Prose'],
          ]) {
            const row = rows.filter({ has: page.locator(`span.font-mono:text-is("${key}")`) });
            await row.getByText(expected, { exact: true }).waitFor();
          }
        }
        const state = await page.evaluate(() => ({
          lang: document.documentElement.lang,
          dark: document.documentElement.classList.contains('dark'),
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
        }));
        const file = `${name}${suffix}`;
        await page.screenshot({ path: path.join(output, file), animations: 'disabled' });
        results.push({ file, status: response?.status(), errors: [...errors], ...state });
        errors.length = 0;
      }

      for (const key of ['home', 'about', 'craft']) {
        await capture(`real-pages-${key}`, `${origin}/admin/pages/${key}`);
      }

      await page.goto(`${origin}/admin/pages`, { waitUntil: 'load' });
      await page
        .getByRole('button', { name: /Add page|Thêm trang/ })
        .first()
        .click();
      const slug = `r3g-${locale}-${theme}-${width}`;
      await page.locator('#create-page-title').fill(locale === 'vi' ? 'Trang mới' : 'New page');
      await page.locator('#create-page-key').fill(slug);
      await page.locator('form button[type="submit"]').click();
      await page.waitForURL(`**/admin/pages/${slug}`);
      await capture('real-pages-created-editor', `${origin}/admin/pages/${slug}`, true);

      for (const key of ['home', 'about', 'created']) {
        await capture(
          `pages-${key}`,
          `${origin}/design-demo-admin?screen=pages-${key}&lang=${locale}`,
        );
      }
      await context.close();
    }
  }
}
await browser.close();

const failures = results.filter(
  (result) =>
    result.status !== 200 ||
    result.errors.length ||
    result.overflow ||
    result.lang !== (result.file.includes('-vi') ? 'vi' : 'en') ||
    result.dark !== result.file.includes('-dark-'),
);
console.log(`Captured ${results.length} page-editor PNGs; ${failures.length} failures`);
for (const failure of failures) console.log(JSON.stringify(failure));
if (failures.length) process.exitCode = 1;
