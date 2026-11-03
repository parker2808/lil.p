import { chromium } from '@playwright/test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const origin = process.env.DEMO_ORIGIN ?? 'http://localhost:3102';
const output = path.join(os.homedir(), 'Desktop/lilp-admin-demo-20261102');
const routes = [
  ['login', '/admin/login'],
  ['dashboard', '/admin'],
  ['analytics', '/admin/analytics'],
  ['stats', '/admin/stats'],
  ['projects', '/admin/projects'],
  ['projects-new', '/admin/projects/new'],
  ['projects-detail', '/admin/projects/1'],
  ['posts', '/admin/posts'],
  ['posts-new', '/admin/posts/new'],
  ['posts-detail', '/admin/posts/1'],
  ['pages', '/admin/pages'],
  ['pages-home', '/admin/pages/home'],
  ['pages-about', '/admin/pages/about'],
  ['pages-craft', '/admin/pages/craft'],
  ['pages-experience-new', '/admin/pages/about/experience/new'],
  ['pages-experience-detail', '/admin/pages/about/experience/1'],
  ['experience', '/admin/experience'],
  ['experience-new', '/admin/experience/new'],
  ['experience-detail', '/admin/experience/1'],
  ['education', '/admin/education'],
  ['skills', '/admin/skills'],
  ['tags', '/admin/tags'],
  ['principles', '/admin/principles'],
  ['process', '/admin/process'],
  ['profile', '/admin/profile'],
  ['site', '/admin/site'],
  ['domains', '/admin/domains'],
  ['media', '/admin/media'],
  ['users', '/admin/users'],
  ['inbox', '/admin/inbox'],
  ['inbox-detail', '/admin/inbox/1'],
  ['audit', '/admin/audit'],
  ['not-found', '/admin/does-not-exist'],
];

fs.mkdirSync(output, { recursive: true });
if (process.env.DEMO_PAGES_R3C === '1') {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  for (const width of [1440, 390]) {
    for (const locale of ['en', 'vi']) {
      const context = await browser.newContext({
        viewport: { width, height: width === 390 ? 844 : 900 },
        reducedMotion: 'reduce',
      });
      await context.addCookies([
        { name: 'NEXT_LOCALE', value: locale, url: origin },
        { name: 'access_token', value: 'local-demo', url: origin },
      ]);
      const page = await context.newPage();
      const exceptions = [];
      page.on('pageerror', (error) => exceptions.push(error.message));
      await page.goto(`${origin}/admin/pages`, { waitUntil: 'load' });
      await page
        .getByRole('button', { name: /Add page|Thêm trang/ })
        .first()
        .click();
      const title = page.locator('#create-page-title');
      const slug = page.locator('#create-page-key');
      const submit = page.locator('form button[type="submit"]');
      async function capture(name) {
        await page.evaluate(() => document.fonts.ready);
        const file = `real-pages-${name}${locale === 'vi' ? '-vi' : ''}-${width}.png`;
        const state = await page.evaluate(() => ({
          lang: document.documentElement.lang,
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
          url: location.pathname,
        }));
        await page.screenshot({ path: path.join(output, file), animations: 'disabled' });
        results.push({ file, ...state, exceptions: [...exceptions] });
      }
      await capture('create');
      await submit.click();
      await title.getAttribute('aria-invalid').then((value) => {
        if (value !== 'true') throw new Error('Title validation did not appear');
      });
      await capture('create-validation');
      const malformed = await fetch('http://127.0.0.1:4000/api/admin/pages', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ title: '', key: 'Bad Slug', locale, template: 'starter' }),
      });
      const validation = await malformed.json();
      if (
        malformed.status !== 400 ||
        validation.code !== 'VALIDATION_FAILED' ||
        !validation.fieldErrors?.key
      ) {
        throw new Error('Mock API did not return the documented 400 validation shape');
      }
      const collision = `collision-${locale}-${width}`;
      await title.fill(locale === 'vi' ? 'Trang trùng' : 'Collision page');
      await slug.fill(collision);
      const duplicateSeed = await fetch('http://127.0.0.1:4000/api/admin/pages', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          title: 'Existing mock page',
          key: collision,
          locale,
          template: 'empty',
        }),
      });
      if (duplicateSeed.status !== 201)
        throw new Error(`Mock seed failed: ${duplicateSeed.status}`);
      await submit.click();
      await page.locator('#create-page-key-error').waitFor();
      if ((await slug.getAttribute('aria-invalid')) !== 'true')
        throw new Error('409 slug error missing');
      await capture('create-conflict');
      const unique = `new-page-${locale}-${width}`;
      await title.fill(locale === 'vi' ? 'Trang mới' : 'New page');
      await slug.fill(unique);
      await submit.click();
      await page.waitForURL(`**/admin/pages/${unique}`);
      await page.locator('h1').first().waitFor();
      await capture('created-editor');
      await context.close();
    }
  }
  await browser.close();
  const failures = results.filter(
    (item) =>
      item.exceptions.length ||
      item.overflow ||
      item.lang !== (item.file.includes('-vi-') ? 'vi' : 'en'),
  );
  fs.writeFileSync(
    path.join(output, 'real-pages-r3c-review.json'),
    JSON.stringify({ results, failures }, null, 2),
  );
  fs.writeFileSync(
    path.join(output, 'png-list.txt'),
    `${fs
      .readdirSync(output)
      .filter((file) => file.endsWith('.png'))
      .sort()
      .join('\n')}\n`,
  );
  console.log(`Captured ${results.length} focused Pages PNGs; ${failures.length} findings`);
  for (const failure of failures) console.log(JSON.stringify(failure));
  process.exit(failures.length ? 1 : 0);
}
const browser = await chromium.launch({ headless: true });
const results = [];
for (const width of [1440, 390]) {
  for (const locale of ['en', 'vi']) {
    const context = await browser.newContext({
      viewport: { width, height: width === 390 ? 844 : 900 },
      reducedMotion: 'reduce',
    });
    await context.addCookies([{ name: 'NEXT_LOCALE', value: locale, url: origin }]);
    const page = await context.newPage();
    async function captureState(name, route) {
      const file = `real-${name}${locale === 'vi' ? '-vi' : ''}-${width}.png`;
      const state = await page.evaluate(() => ({
        lang: document.documentElement.lang,
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        heading: document.querySelector('h1')?.textContent?.trim() ?? '',
        url: location.pathname,
      }));
      await page.screenshot({ path: path.join(output, file), animations: 'disabled' });
      results.push({ file, route, status: 200, ...state, exceptions: [] });
    }
    for (const [name, route] of routes) {
      if (name === 'dashboard') {
        await context.addCookies([{ name: 'access_token', value: 'local-demo', url: origin }]);
      }
      const exceptions = [];
      const onError = (error) => exceptions.push(error.message);
      page.on('pageerror', onError);
      const response = await page.goto(`${origin}${route}`, { waitUntil: 'load' });
      if (name === 'login') {
        await page
          .getByRole('button', { name: locale === 'vi' ? /Đăng nhập/ : /Sign in/ })
          .waitFor();
      }
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(400);
      const state = await page.evaluate(() => ({
        lang: document.documentElement.lang,
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        heading: document.querySelector('h1')?.textContent?.trim() ?? '',
        url: location.pathname,
      }));
      const file = `real-${name}${locale === 'vi' ? '-vi' : ''}-${width}.png`;
      await page.screenshot({ path: path.join(output, file), animations: 'disabled' });
      results.push({ file, route, status: response?.status(), ...state, exceptions });
      if (name === 'login') {
        await page.locator('[data-slot="password-input-toggle"]').click();
        await captureState('login-show-password', route);
      }
      page.off('pageerror', onError);
    }
    await page.goto(`${origin}/admin/pages`, { waitUntil: 'load' });
    await page
      .getByRole('button', { name: /Add page|Thêm trang/ })
      .first()
      .click();
    await captureState('pages-create', '/admin/pages');
    await page.goto(`${origin}/admin/education`, { waitUntil: 'load' });
    await page.getByRole('textbox').first().fill('Institute');
    await captureState('education-filter', '/admin/education');
    await page.goto(`${origin}/admin/media`, { waitUntil: 'load' });
    await page.locator('[data-slot="media-library"] button').first().click();
    await captureState('media-inspector', '/admin/media');
    await page.goto(`${origin}/admin/projects/999`, { waitUntil: 'load' });
    await page.waitForTimeout(400);
    await captureState('project-error', '/admin/projects/999');
    await page.goto(`${origin}/admin`, { waitUntil: 'load' });
    await page.keyboard.press('Meta+k');
    await page.getByRole('dialog').waitFor();
    await captureState('palette-open', '/admin');
    await page.keyboard.press('Escape');
    await page.route('**/api/admin/education', async (requestRoute) => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await requestRoute.continue();
    });
    await page.goto(`${origin}/admin/education`, { waitUntil: 'load' });
    await page.locator('[aria-busy="true"]').first().waitFor();
    await captureState('education-loading', '/admin/education');
    await page.unroute('**/api/admin/education');
    await context.close();
  }
}
await browser.close();
const failures = results.filter(
  (row) =>
    row.exceptions.length ||
    row.overflow ||
    row.lang !== (row.file.includes('-vi-') ? 'vi' : 'en') ||
    (row.status !== 200 && !row.file.includes('not-found')),
);
fs.writeFileSync(
  path.join(output, 'real-route-review.json'),
  JSON.stringify(
    { source: 'production Next build with process-local fictional API', results, failures },
    null,
    2,
  ),
);
fs.writeFileSync(
  path.join(output, 'png-list.txt'),
  `${fs
    .readdirSync(output)
    .filter((file) => file.endsWith('.png'))
    .sort()
    .join('\n')}\n`,
);
console.log(
  `Captured ${results.length} real admin route PNGs; ${failures.length} capture findings`,
);
for (const failure of failures) console.log(JSON.stringify(failure));
if (failures.length) process.exitCode = 1;
