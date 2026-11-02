import { chromium } from '@playwright/test';
import { mkdir, readdir, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';

const root =
  process.env.DEMO_SCREENSHOT_DIR ?? join(homedir(), 'Desktop', 'lilp-design-demo-20261102');
await mkdir(root, { recursive: true });
for (const name of await readdir(root)) if (name.endsWith('.png')) await unlink(join(root, name));
const baseUrl = process.env.DEMO_BASE_URL ?? 'http://localhost:4177';
const routes = [
  ['home', ''],
  ['projects', 'projects'],
  ['case-study', 'projects/particula'],
  ['notes', 'notes'],
  ['note-detail', 'notes/interfaces-as-conversations'],
  ['about', 'about'],
  ['contact', 'contact'],
  ['craft', 'craft'],
  ['not-found', 'a-page-that-does-not-exist'],
  ['error', 'demo-state/error'],
  ...['home', 'projects', 'detail', 'craft', 'notes', 'note', 'about', 'contact'].map((v) => [
    `loading-${v}`,
    `demo-state/${v}`,
  ]),
];
const browser = await chromium.launch({ headless: true });
const problems = [];
for (const locale of ['en', 'vi'])
  for (const width of [1440, 390]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      reducedMotion: 'reduce',
      colorScheme: 'light',
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    page.on('pageerror', (error) => problems.push(`${locale}-${width}: ${error.message}`));
    for (const [name, path] of routes) {
      const response = await page.goto(`${baseUrl}/${locale}${path ? `/${path}` : ''}`, {
        waitUntil: 'domcontentloaded',
      });
      await page.evaluate(() => document.fonts.ready);
      const result = await page.evaluate(() => ({
        title: document.title,
        h1: document.querySelector('h1')?.textContent,
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        portal: !!document.querySelector('nextjs-portal'),
      }));
      const file = `${locale}-${name}-${width}.png`;
      await page.screenshot({ path: join(root, file), fullPage: true, animations: 'disabled' });
      if (
        !response ||
        (response.status() !== 200 && !(name === 'not-found' && response.status() === 404)) ||
        result.overflow ||
        result.portal ||
        (!result.h1 && !name.startsWith('loading-'))
      )
        problems.push(`${file}: status=${response?.status()} ${JSON.stringify(result)}`);
      process.stdout.write(`${file} ${response?.status()} ${result.h1 ?? 'skeleton'}\n`);
    }
    await context.close();
  }
await browser.close();
if (problems.length) {
  process.stderr.write(problems.join('\n') + '\n');
  process.exitCode = 1;
}
