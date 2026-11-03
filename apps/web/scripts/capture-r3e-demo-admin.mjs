import { chromium } from '@playwright/test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const origin = process.env.DEMO_ORIGIN ?? 'http://localhost:3101';
const output = path.join(os.homedir(), 'Desktop/lilp-admin-demo-20261102');
const routes = [
  'analytics',
  'stats',
  'pages',
  'projects-new',
  'projects-edit',
  'posts-new',
  'posts-edit',
  'experience-new',
  'experience-edit',
  'pages-about-experience-new',
  'pages-about-experience-edit',
  'education',
  'skills',
  'tags',
  'principles',
  'process',
  'profile',
  'site',
  'media',
];

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
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      for (const route of routes) {
        const response = await page.goto(
          `${origin}/design-demo-admin?screen=${route}&lang=${locale}`,
          { waitUntil: 'load' },
        );
        await page.locator('.demo-root').waitFor();
        await page.evaluate(() => document.fonts.ready);
        if (theme === 'dark') {
          await page.evaluate(() => document.documentElement.classList.add('dark'));
        }
        const state = await page.evaluate((screen) => {
          const cardGeometry =
            screen === 'media'
              ? [...document.querySelectorAll('.media-card')].map((card) => {
                  const image = card.querySelector('.media-art')?.getBoundingClientRect();
                  const badge = card.querySelector('.media-card-glyph')?.getBoundingClientRect();
                  return Boolean(
                    image && badge && (badge.top >= image.bottom || badge.left >= image.right),
                  );
                })
              : [];
          return {
            lang: document.documentElement.lang,
            overflow: document.documentElement.scrollWidth > innerWidth + 1,
            staticActions: document.querySelectorAll('.demo-static-action').length,
            focusableStaticActions: document.querySelectorAll(
              'button.demo-static-action, a.demo-static-action, .demo-static-action[tabindex]',
            ).length,
            mediaCards: cardGeometry.length,
            mediaBadgesClear: cardGeometry.every(Boolean),
            dark: document.documentElement.classList.contains('dark'),
          };
        }, route);
        const file = `${route}${locale === 'vi' ? '-vi' : ''}${theme === 'dark' ? '-dark' : ''}-${width}.png`;
        await page.screenshot({
          path: path.join(output, file),
          animations: 'disabled',
        });
        results.push({ file, status: response?.status(), errors: [...errors], ...state });
        if (route === 'media' && width === 390) {
          await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
          const bottomFile = file.replace(/^media/, 'media-bottom');
          await page.screenshot({ path: path.join(output, bottomFile), animations: 'disabled' });
          results.push({
            file: bottomFile,
            status: response?.status(),
            errors: [...errors],
            ...state,
          });
        }
        errors.length = 0;
      }
      await context.close();
    }
  }
}
await browser.close();

const failures = results.filter(
  (item) =>
    item.status !== 200 ||
    item.errors.length ||
    item.overflow ||
    item.staticActions === 0 ||
    item.focusableStaticActions > 0 ||
    item.dark !== item.file.includes('-dark-') ||
    item.lang !== (item.file.includes('-vi') ? 'vi' : 'en') ||
    (item.file.startsWith('media') && (item.mediaCards !== 8 || !item.mediaBadgesClear)),
);
fs.writeFileSync(
  path.join(output, 'r3e-demo-review.json'),
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
console.log(`Captured ${results.length} affected PNGs; ${failures.length} findings`);
for (const failure of failures) console.log(JSON.stringify(failure));
if (failures.length) process.exitCode = 1;
