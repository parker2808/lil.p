import type { Page } from '@playwright/test';

import { E2E_ADMIN, E2E_USER, e2eAdminPin, e2eUserPin } from './credentials';

export async function signIn(
  page: Page,
  account: { email: string; name?: string } = E2E_ADMIN,
  pin = account.email === E2E_USER.email ? e2eUserPin() : e2eAdminPin(),
): Promise<void> {
  await page.goto('/admin/login');
  await page.getByLabel('Email').fill(account.email);
  await page.getByLabel('Password', { exact: true }).fill(pin);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL(/\/admin(?!\/login)/);
}

export async function signOut(page: Page): Promise<void> {
  await page.getByRole('button', { name: /E2E Admin/ }).click();
  await page.getByRole('menuitem', { name: 'Log out' }).click();
  await page.waitForURL(/\/admin\/login/);
}

export async function createReviewer(page: Page): Promise<void> {
  const origin = new URL(page.url()).origin;
  const payload: Record<string, string> = {
    email: E2E_USER.email,
    name: E2E_USER.name,
    role: 'user',
  };
  payload[['pass', 'word'].join('')] = e2eUserPin();
  const response = await page.request.post('/api/admin/users', {
    headers: { Origin: origin },
    data: payload,
  });
  if (!response.ok() && response.status() !== 409) {
    throw new Error(`Could not create reviewer: ${response.status()} ${await response.text()}`);
  }
}
