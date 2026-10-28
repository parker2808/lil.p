import { expect, test } from '@playwright/test';

import { signIn } from './helpers/auth';

const routes = [
  '/en',
  '/en/about',
  '/en/projects',
  '/en/notes',
  '/en/contact',
  '/en/projects/particula',
  '/en/notes/vue-to-react',
];

for (const width of [390, 1440]) {
  for (const theme of ['light', 'dark']) {
    test(`redesign ${width}px ${theme}: readable, bounded and reduced motion`, async ({ page }) => {
      test.setTimeout(120_000);
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.addInitScript((value) => localStorage.setItem('theme', value), theme);
      for (const route of routes) {
        await page.goto(route);
        await expect(page.locator('main#content')).toBeVisible();
        await expect(page.locator('h1').first()).toBeVisible();
        const state = await page.evaluate(() => ({
          overflow: document.documentElement.scrollWidth > innerWidth,
          font: getComputedStyle(document.body).fontFamily,
          running: document.getAnimations().filter((animation) => animation.playState === 'running')
            .length,
        }));
        expect(state.overflow, route).toBe(false);
        expect(state.font, route).toMatch(/IBM Plex Sans|IBM_Plex_Sans/);
        expect(state.running, route).toBe(0);
        await expect(page.locator('main')).not.toContainText(/\bTODO\b|\bTBD\b/);
      }
      await page.goto('/vi');
      await expect(page.locator('h1')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(
        false,
      );
    });
  }
}

test('public content remains visible without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/en');
  await expect(page.locator('h1')).toBeVisible();
  const stat = page.locator('[data-slot="stat-item"]').first();
  await expect(stat).toBeVisible();
  await context.close();
});

test('projects can switch between grid and index', async ({ page }) => {
  await page.goto('/en/projects');
  await page.getByRole('button', { name: 'Index', exact: true }).click();
  await expect(page.locator('.projects-view')).toHaveAttribute('data-view', 'index');
  await expect(page.locator('[data-slot="case-card"]').first()).toBeVisible();
  await page.getByRole('button', { name: 'Grid', exact: true }).click();
  await expect(page.locator('.projects-view')).toHaveAttribute('data-view', 'grid');
});

test('CMS panes contain scrolling on desktop and mobile', async ({ page }) => {
  test.setTimeout(120_000);
  await signIn(page);
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      '/admin',
      '/admin/projects',
      '/admin/posts',
      '/admin/pages/home',
      '/admin/media',
      '/admin/inbox',
      '/admin/profile',
    ]) {
      await page.goto(route);
      await expect(page.locator('main#content')).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        route,
      ).toBe(false);
      expect(
        await page.evaluate(() => document.documentElement.scrollHeight > innerHeight),
        route,
      ).toBe(false);
    }
  }
});
