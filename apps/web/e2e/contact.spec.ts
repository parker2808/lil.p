import { expect, test } from '@playwright/test';

import { E2E_VISITOR } from './helpers/credentials';

test.describe('contact', () => {
  test('submits a message from the public form', async ({ page }) => {
    await page.goto('/en/contact');
    await expect(page.getByRole('heading', { name: /talk about your product/i })).toBeVisible();
    await page.locator('#name').fill(E2E_VISITOR.name);
    await page.locator('#email').fill(E2E_VISITOR.email);
    await expect(page.locator('#topic')).toBeVisible();
    await page.locator('#topic').selectOption({ index: 1 });
    await page.locator('#message').fill('I would like to talk about a migration.');
    const send = page.locator('form').getByRole('button', { name: /send message/i });
    await expect(send).toBeEnabled();
    await send.evaluate((button) => {
      (button as HTMLButtonElement).click();
    });
    await expect(page.getByText('Message sent')).toBeVisible({ timeout: 20_000 });
  });
});
