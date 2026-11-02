import { chromium } from '@playwright/test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const output = path.join(os.homedir(), 'Desktop/lilp-admin-demo-20261102');
const origin = 'http://localhost:3101';
const routes = [
  'shell-expanded',
  'shell-collapsed',
  'dashboard',
  'analytics',
  'stats',
  'projects',
  'projects-new',
  'projects-edit',
  'posts',
  'posts-new',
  'posts-edit',
  'pages',
  'pages-home',
  'pages-about',
  'pages-about-experience-new',
  'pages-about-experience-edit',
  'experience',
  'experience-new',
  'experience-edit',
  'education',
  'skills',
  'tags',
  'principles',
  'process',
  'profile',
  'site',
  'domains',
  'media',
  'users',
  'inbox',
  'inbox-detail',
  'audit',
  'not-found',
  'error',
  'login',
  'palette',
  'mobile-nav',
  'list-loading',
];
const loading = [
  'dashboard',
  'analytics',
  'stats',
  'projects',
  'projects-new',
  'projects-edit',
  'posts',
  'posts-new',
  'posts-edit',
  'pages',
  'pages-home',
  'pages-about',
  'pages-about-experience-new',
  'pages-about-experience-edit',
  'experience',
  'experience-new',
  'experience-edit',
  'education',
  'skills',
  'tags',
  'principles',
  'process',
  'profile',
  'site',
  'domains',
  'media',
  'users',
  'inbox',
  'inbox-detail',
  'audit',
];

fs.mkdirSync(output, { recursive: true });
for (const file of fs.readdirSync(output)) {
  if (file.endsWith('.png')) fs.unlinkSync(`${output}/${file}`);
}

const browser = await chromium.launch({ headless: true });
const failures = [];
let count = 0;
for (const width of [1440, 390]) {
  const page = await browser.newPage({
    viewport: { width, height: width === 390 ? 844 : 900 },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  });
  let errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  async function capture(name, url) {
    errors = [];
    const response = await page.goto(url, { waitUntil: 'load' });
    await page.locator('.demo-root').waitFor();
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(35);
    if (response?.status() !== 200 || errors.length) {
      failures.push({ name, status: response?.status(), errors });
    }
    await page.screenshot({ path: `${output}/${name}`, animations: 'disabled' });
    count++;
  }
  for (const locale of ['en', 'vi']) {
    for (const route of routes) {
      const name = `${route}${locale === 'vi' ? '-vi' : ''}-${width}.png`;
      await capture(name, `${origin}/design-demo-admin?screen=${route}&lang=${locale}`);
    }
  }
  for (const route of loading) {
    await capture(
      `${route}-loading-${width}.png`,
      `${origin}/design-demo-admin?screen=${route}&state=loading`,
    );
  }
  if (width === 390) {
    await page.goto(`${origin}/design-demo-admin?screen=login`, { waitUntil: 'load' });
    await page.getByRole('button', { name: /Sign in/ }).click();
    await page.screenshot({ path: `${output}/login-loading-390.png`, animations: 'disabled' });
    count++;
  }
  await page.close();
  console.log(`Captured ${width}px (${count} total)`);
}
await browser.close();
fs.writeFileSync(
  `${output}/capture-manifest.json`,
  JSON.stringify(
    {
      buildId: fs.readFileSync('.next/BUILD_ID', 'utf8').trim(),
      source: 'next build + next start, local mock route',
      routes,
      loading,
      widths: [1440, 390],
      pngCount: count,
      failures,
    },
    null,
    2,
  ),
);
console.log(`Complete: ${count} PNGs, ${failures.length} page failures`);
if (failures.length) process.exitCode = 1;
