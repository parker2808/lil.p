import { expect, test } from '@playwright/test';

import { E2E_ADMIN, e2eAdminPin } from './helpers/credentials';
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

  test('double-click Sign in sends exactly one login request', async ({ page }) => {
    const loginHits: string[] = [];
    page.on('request', (request) => {
      if (request.method() === 'POST' && request.url().includes('/api/auth/login')) {
        loginHits.push(request.url());
      }
    });

    await page.goto('/admin/login');
    await page.getByLabel('Email').fill(E2E_ADMIN.email);
    await page.getByRole('textbox', { name: 'Password' }).fill(e2eAdminPin());

    const submit = page.locator('button[type="submit"]');
    await submit.click();
    await expect(submit).toBeDisabled();
    await expect(submit).toHaveAttribute('aria-busy', 'true');
    // The second click lands while the button is disabled, so no extra request fires.
    await submit.click({ force: true });

    await page.waitForURL(/\/admin(?!\/login)/);
    expect(loginHits).toHaveLength(1);
  });
});
