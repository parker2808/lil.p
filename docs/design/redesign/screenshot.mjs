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

// [output name, file, extra query, variants]
const ALL = ['desktop', 'desktop-dark', 'mobile'];
const DESK = ['desktop', 'desktop-dark'];
const pages = [
  ['home', 'home', '', ALL], ['projects', 'projects', '', ALL], ['case-study', 'case-study', '', ALL],
  ['about', 'about', '', ALL], ['contact', 'contact', '', ALL], ['notes', 'notes', '', ALL], ['post', 'post', '', ALL],
  ['foundations', 'foundations', '', ALL], ['loading', 'loading', '', ALL],
  ['admin-login', 'admin-login', '', ALL], ['admin-dashboard', 'admin-dashboard', '', ALL],
  ['admin-palette', 'admin-dashboard', '&palette=1', DESK], ['admin-drawer', 'admin-dashboard', '&drawer=1', ['mobile']],
  ['admin-projects', 'admin-projects', '', ALL], ['admin-editor', 'admin-editor', '', DESK],
  ['admin-pages', 'admin-pages', '', DESK], ['admin-media', 'admin-media', '', DESK], ['admin-inbox', 'admin-inbox', '', DESK],
  ['admin-loading', 'admin-loading', '&state=dashboard', ALL], ['admin-loading-table', 'admin-loading', '&state=table', ALL],
  ['admin-loading-editor', 'admin-loading', '&state=editor', DESK], ['admin-loading-states', 'admin-loading', '&state=states', ALL],
];
const variants = {
  desktop: { width: 1440, height: 900, dark: false },
  'desktop-dark': { width: 1440, height: 900, dark: true },
  mobile: { width: 390, height: 844, dark: false },
};

for (const [name, file, extra, tags] of pages.filter((p) => !only.length || only.includes(p[0]))) {
  for (const tag of tags) {
    const v = variants[tag];
    const page = await browser.newPage({ viewport: { width: v.width, height: v.height }, deviceScaleFactor: 1 });
    const qs = `?capture=1${v.dark ? '&dark=1' : ''}${extra}`;
    await page.goto(`http://127.0.0.1:4178/${file}.html${qs}`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(250);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 0) console.warn(`! ${name} ${tag}: horizontal overflow ${overflow}px`);
    await page.screenshot({ path: join(out, `${name}-${tag}.jpg`), fullPage: true, type: 'jpeg', quality: 78 });
    await page.close();
    console.log(`${name}-${tag}.jpg`);
  }
}

await browser.close();
server.close();
