import { expect, test } from '@playwright/test';

import { E2E_VISITOR } from './helpers/credentials';
import { selectChoice } from './helpers/select-choice';

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
    await selectChoice(page, page.locator('#topic'), 'A role');
    await page.locator('#message').fill('I would like to talk about a migration.');
    const send = page.locator('form').getByRole('button', { name: /send message/i });
    await expect(send).toBeEnabled();
    await expect(page.locator('#name')).toHaveValue(E2E_VISITOR.name);
    await send.click();
    await expect(page.getByText('Message sent')).toBeVisible({ timeout: 20_000 });
  });

  test('preserves typing before hydration and submits it', async ({ page }) => {
    test.setTimeout(60_000);
    let payload: Record<string, string> | undefined;
    const postRequests: string[] = [];
    page.on('request', (request) => {
      const pathname = new URL(request.url()).pathname;
      if (
        request.method() === 'POST' &&
        ['/api/public/contact', '/en/contact'].includes(pathname)
      ) {
        postRequests.push(pathname);
      }
    });
    await page.route('**/api/public/contact', async (route) => {
      payload = route.request().postDataJSON() as Record<string, string>;
      await route.fulfill({ status: 201, body: '{}' });
    });
    let releaseScripts: () => void = () => {};
    const scriptsBlocked = new Promise<void>((resolve) => {
      releaseScripts = resolve;
    });
    await page.route('**/_next/static/**/*.js', async (route) => {
      await scriptsBlocked;
      await route.continue();
    });
    try {
      await page.goto('/en/contact', { waitUntil: 'commit' });
      await expect(page.locator('form')).not.toHaveAttribute('data-interactive', 'true');
      await page.locator('#name').fill(E2E_VISITOR.name);
      await page.locator('#email').fill(E2E_VISITOR.email);
    } finally {
      releaseScripts();
    }
    await page.waitForLoadState('load');
    await expect(page.locator('#name')).toHaveValue(E2E_VISITOR.name);
    await expect(page.locator('#email')).toHaveValue(E2E_VISITOR.email);
    await page.locator('#message').fill('I would like to talk about a migration.');
    await expect(page.locator('form')).toHaveAttribute('data-interactive', 'true');
    await expect(page.locator('#name')).toHaveValue(E2E_VISITOR.name);
    await expect(page.locator('#email')).toHaveValue(E2E_VISITOR.email);
    await page
      .locator('form')
      .getByRole('button', { name: /send message/i })
      .click();
    await expect
      .poll(() => postRequests, { message: 'hydrated contact submits once through the client API' })
      .toEqual(['/api/public/contact']);
    await expect(page.getByText('Message sent')).toBeVisible();
    expect(payload).toMatchObject({
      name: E2E_VISITOR.name,
      email: E2E_VISITOR.email,
      topic: '',
      message: 'I would like to talk about a migration.',
    });
    expect(postRequests).toEqual(['/api/public/contact']);
  });

  test('clears a selected optional topic back to the empty payload', async ({ page }) => {
    let payload: Record<string, string> | undefined;
    await page.route('**/api/public/contact', async (route) => {
      payload = route.request().postDataJSON() as Record<string, string>;
      await route.fulfill({ status: 201, body: '{}' });
    });
    await page.goto('/en/contact');
    await page.locator('#name').fill(E2E_VISITOR.name);
    await page.locator('#email').fill(E2E_VISITOR.email);
    await selectChoice(page, page.locator('#topic'), 'A role');
    await expect(page.locator('input[name="topic"]')).not.toHaveValue('');
    await selectChoice(page, page.locator('#topic'), 'Choose a topic');
    await expect(page.locator('input[name="topic"]')).toHaveValue('');
    await page.locator('#message').fill('I would like to talk about a migration.');
    await page
      .locator('form')
      .getByRole('button', { name: /send message/i })
      .click();
    await expect(page.getByText('Message sent')).toBeVisible();
    expect(payload?.topic).toBe('');
  });
});
