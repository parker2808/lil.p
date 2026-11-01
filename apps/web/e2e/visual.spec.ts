import { resolve } from 'node:path';

import { expect, type Page, test } from '@playwright/test';

import { signIn } from './helpers/auth';

const PUBLIC_ROUTES = [
  ['home', '/en'],
  ['projects', '/en/projects'],
  ['case-study', '/en/projects/particula'],
  ['notes', '/en/notes'],
  ['about', '/en/about'],
  ['contact', '/en/contact'],
] as const;

const ADMIN_ROUTES = [
  ['profile', '/admin/profile'],
  ['site', '/admin/site'],
  ['post-new', '/admin/posts/new'],
] as const;

const VIEWPORTS = [
  { width: 375, height: 667 },
  { width: 1280, height: 720 },
] as const;

// Baselines are Linux Chromium pixels; `pnpm --filter @portfolio/web test:visual:update` renders them elsewhere.
test.skip(
  process.platform !== 'linux' && !process.env.PW_TEST_CONNECT_WS_ENDPOINT,
  'Visual baselines are rendered by Linux Chromium',
);

async function settle(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += window.innerHeight) {
      window.scrollTo(0, y);
      await new Promise(requestAnimationFrame);
    }
    window.scrollTo(0, 0);
    await Promise.all(
      Array.from(document.images, (image) => image.decode().catch(() => undefined)),
    );
    await document.fonts.ready;
  });
  await page.mouse.move(0, 0);
}

function dynamicParts(page: Page) {
  return [
    page.locator('[data-slot="tech-marquee"]'),
    page.locator('time'),
    page.getByText(/^Saved \d{2}:\d{2}$/),
  ];
}

async function expectScreen(page: Page, name: string): Promise<void> {
  await settle(page);
  await expect(page).toHaveScreenshot(`${name}.png`, {
    fullPage: true,
    mask: dynamicParts(page),
    stylePath: resolve(import.meta.dirname, 'visual.css'),
  });
}

for (const viewport of VIEWPORTS) {
  test.describe(`${viewport.width}px`, () => {
    test.use({ viewport });

    for (const [name, route] of PUBLIC_ROUTES) {
      test(`public ${name}`, async ({ page }) => {
        await page.goto(route);
        await expectScreen(page, `public-${name}-${viewport.width}`);
      });
    }

    test('admin routes', async ({ page }) => {
      await page.goto('/admin/login');
      await expectScreen(page, `admin-login-${viewport.width}`);

      await signIn(page);
      for (const [name, route] of ADMIN_ROUTES) {
        await page.goto(route);
        await expect(page.locator('main h1').first()).toBeVisible();
        await expectScreen(page, `admin-${name}-${viewport.width}`);
      }
    });
  });
}
