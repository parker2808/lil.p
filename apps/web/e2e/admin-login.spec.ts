import { expect, test } from '@playwright/test';

import { signIn } from './helpers/auth';

test.describe('admin login', () => {
  test('stays on the form when there is no session', async ({ page }) => {
    const refreshHits: string[] = [];
    page.on('request', (request) => {
      if (request.method() === 'POST' && request.url().includes('/api/auth/refresh')) {
        refreshHits.push(request.url());
      }
    });

    await page.goto('/admin/login');
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/login/);
    await page.waitForTimeout(500);
    expect(refreshHits.length).toBeLessThan(3);
  });

  test('signed-in visit to login redirects once to admin', async ({ page }) => {
    await signIn(page);
    await page.goto('/admin/login');
    await page.waitForURL(/\/admin(?!\/login)/);
    await expect(page).not.toHaveURL(/\/admin\/login/);
  });
});
