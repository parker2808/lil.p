// Renders every redesign mockup to JPEG (desktop light/dark + mobile).
// Usage: node screenshot.mjs [outDir] [only-page-name ...]
// Needs playwright-core and a Chrome binary (CHROME_PATH, default /usr/local/bin/google-chrome).
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright-core';

const root = fileURLToPath(new URL('.', import.meta.url));
const out = process.argv[2] || join(root, 'screenshots');
const only = process.argv.slice(3);
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml' };

const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1');
  const file = join(root, url.pathname === '/' ? 'index.html' : url.pathname);
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': mime[extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end('not found');
  }
});
await new Promise((r) => server.listen(4178, '127.0.0.1', r));

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || '/usr/local/bin/google-chrome',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

const pages = [
  'home', 'projects', 'case-study', 'about', 'contact', 'notes', 'post',
  'admin-login', 'admin-dashboard', 'admin-projects', 'admin-editor', 'admin-pages', 'admin-media', 'admin-inbox', 'foundations',
];
const variants = [
  { tag: 'desktop', width: 1440, height: 900, dark: false },
  { tag: 'desktop-dark', width: 1440, height: 900, dark: true },
  { tag: 'mobile', width: 390, height: 844, dark: false },
];

for (const name of pages.filter((p) => !only.length || only.includes(p))) {
  for (const v of variants) {
    if (name.startsWith('admin-') && v.tag === 'mobile' && name !== 'admin-dashboard' && name !== 'admin-login') continue;
    const page = await browser.newPage({ viewport: { width: v.width, height: v.height }, deviceScaleFactor: 1 });
    const qs = `?capture=1${v.dark ? '&dark=1' : ''}`;
    await page.goto(`http://127.0.0.1:4178/${name}.html${qs}`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(250);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 0) console.warn(`! ${name} ${v.tag}: horizontal overflow ${overflow}px`);
    await page.screenshot({ path: join(out, `${name}-${v.tag}.jpg`), fullPage: true, type: 'jpeg', quality: 78 });
    await page.close();
    console.log(`${name}-${v.tag}.jpg`);
  }
}

await browser.close();
server.close();
