import { expect, test } from '@playwright/test';

import { E2E_VISITOR } from './helpers/credentials';

test.describe('contact', () => {
  test('shows errors under required fields and focuses the first on empty submit', async ({
    page,
  }) => {
    await page.goto('/en/contact');
    await page.getByRole('button', { name: /send message/i }).click();

    for (const name of ['name', 'email', 'message']) {
      const control = page.locator(`#${name}`);
      const error = page.locator(`#${name}-error`);
      await expect(control).toHaveAttribute('aria-invalid', 'true');
      await expect(control).toHaveAttribute('aria-describedby', `${name}-error`);
      await expect(error).toBeVisible();
      await expect(error).not.toBeEmpty();
    }
    await expect(page.locator('#name')).toBeFocused();
  });

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
