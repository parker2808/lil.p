import { expect, type Page, test } from '@playwright/test';

import { signIn } from './helpers/auth';

const NAVIGATION_DELAY_MS = 2_000;

/** Prefetches are dropped so the click must fetch its route, and that fetch is held back. */
async function throttleRoutes(page: Page) {
  await page.route('**/*', async (route) => {
    const headers = route.request().headers();
    if (headers['rsc'] !== '1') {
      await route.fallback();
      return;
    }
    if (headers['next-router-prefetch']) {
      await route.abort();
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, NAVIGATION_DELAY_MS));
    await route.fallback().catch(() => undefined);
  });
}

type ProgressWindow = Window & { progressDelay?: Promise<number> };

/** Records the milliseconds from the click to the first frame that paints the bar with any opacity. */
async function measureProgressDelay(page: Page) {
  await page.evaluate(() => {
    (window as ProgressWindow).progressDelay = new Promise<number>((resolve) => {
      window.addEventListener(
        'click',
        () => {
          const clickedAt = performance.now();
          const check = () => {
            const bar = document.querySelector('.route-pending');
            if (bar && getComputedStyle(bar).opacity !== '0') {
              resolve(performance.now() - clickedAt);
            } else {
              requestAnimationFrame(check);
            }
          };
          requestAnimationFrame(check);
        },
        { capture: true, once: true },
      );
    });
  });
}

async function expectProgressOnClick(page: Page, href: string) {
  await measureProgressDelay(page);
  await page.locator(`a[href="${href}"]`).first().click();

  const bar = page.locator('.route-pending');
  await expect(bar).toBeVisible({ timeout: 100 });
  expect(await page.evaluate(() => (window as ProgressWindow).progressDelay)).toBeLessThan(100);
  await expect(bar).toHaveCSS('opacity', '1');
  await expect(bar).toHaveAttribute('role', 'status');

  await expect(page).toHaveURL(new RegExp(`${href}$`));
  await expect(bar).toHaveCount(0);
}

test('public link shows the progress bar within 100 ms on a throttled route', async ({ page }) => {
  await throttleRoutes(page);
  await page.goto('/en');
  await page.waitForLoadState('networkidle');

  await expectProgressOnClick(page, '/en/projects');
});

test('admin link shows the progress bar within 100 ms on a throttled route', async ({ page }) => {
  await signIn(page);
  await throttleRoutes(page);
  await page.goto('/admin');
  await page.waitForLoadState('networkidle');

  await expectProgressOnClick(page, '/admin/projects');
});
