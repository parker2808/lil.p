
import { chromium } from 'playwright-core';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const out = process.argv[2] || '/opt/cursor/artifacts';
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml' };

const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1');
  const file = join(root, url.pathname === '/' ? 'index.html' : url.pathname);
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': mime[extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404); res.end('not found');
  }
});

await new Promise((r) => server.listen(4177, '127.0.0.1', r));

const browser = await chromium.launch({
  executablePath: '/usr/local/bin/google-chrome',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const base = 'http://127.0.0.1:4177';

async function shot({ name, path, width = 1440, height = 900, dark = false, checkOverflow = false }) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 2 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(`${base}/${path}`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.evaluate(() => document.documentElement.classList.add('capture'));
  if (dark) await page.evaluate(() => document.documentElement.classList.add('dark'));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  if (checkOverflow) {
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    console.log('overflow', name, overflow);
  }
  await page.screenshot({ path: join(out, name), fullPage: true, type: 'png' });
  await page.close();
  console.log('wrote', name);
}

await shot({ name: '01-home-light.png', path: 'home.html' });
await shot({ name: '02-home-dark.png', path: 'home.html?dark=1', dark: true });
await shot({ name: '03-case-study-light.png', path: 'case-study.html' });
await shot({ name: '03b-case-study-dark.png', path: 'case-study.html?dark=1', dark: true });
await shot({ name: '04-blog-post-light.png', path: 'post.html' });
await shot({ name: '04b-blog-list-light.png', path: 'notes.html' });
await shot({ name: '05-home-mobile-light.png', path: 'home.html', width: 390, height: 844, checkOverflow: true });
await shot({ name: '06-admin-dashboard.png', path: 'admin-dashboard.html' });
await shot({ name: '07-admin-projects-table.png', path: 'admin-table.html' });
await shot({ name: '08-admin-project-editor.png', path: 'admin-editor.html' });
await shot({ name: '09-home-skeletons.png', path: 'home-skeleton.html' });
await shot({ name: '10-about-light.png', path: 'about.html' });
await shot({ name: '11-projects-light.png', path: 'projects.html' });
await shot({ name: '12-contact-light.png', path: 'contact.html' });

await browser.close();
server.close();


