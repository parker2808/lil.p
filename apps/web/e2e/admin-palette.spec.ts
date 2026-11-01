import { expect, type Page, test } from '@playwright/test';

import { signIn } from './helpers/auth';

const palette = (page: Page) => page.getByRole('dialog', { name: 'Jump to' });

async function openPalette(page: Page): Promise<void> {
  await expect(async () => {
    await page.keyboard.press('ControlOrMeta+k');
    await expect(palette(page)).toBeVisible({ timeout: 1000 });
  }).toPass();
}

test.describe('admin command palette actions', () => {
  test('creates a project from ⌘K and lands on the new-project editor', async ({ page }) => {
    await signIn(page);
    await page.goto('/admin');
    await openPalette(page);

    const actions = palette(page).getByRole('region', { name: 'Actions' });
    await expect(actions.getByRole('button', { name: 'Publish current page' })).toHaveCount(0);
    await expect(actions.getByRole('button', { name: 'Open public site' })).toBeVisible();
    await expect(actions.getByRole('button', { name: /^Switch language/ })).toBeVisible();
    await expect(actions.getByRole('button', { name: /^Write post/ })).toContainText('WP');
    const create = actions.getByRole('button', { name: /^Create project/ });
    await expect(create.locator('kbd')).toHaveText(['C', 'P']);

    await create.click();
    await expect(page).toHaveURL(/\/admin\/projects\/new$/);
    await expect(palette(page)).toBeHidden();
    await expect(page.getByRole('heading', { level: 1, name: 'Untitled project' })).toBeVisible();
  });

  test('G I goes to the inbox and the hint is shown in the palette', async ({ page }) => {
    await signIn(page);
    await page.goto('/admin');
    await openPalette(page);
    const inbox = palette(page)
      .getByRole('region', { name: 'Go to' })
      .getByRole('button', { name: /^Inbox/ });
    await expect(inbox.locator('kbd')).toHaveText(['G', 'I']);
    await page.keyboard.press('Escape');
    await expect(palette(page)).toBeHidden();

    await page.keyboard.press('g');
    await page.keyboard.press('i');
    await expect(page).toHaveURL(/\/admin\/inbox$/);
  });

  test('offers Publish current page inside an editor', async ({ page }) => {
    await signIn(page);
    await page.goto('/admin/pages/home');
    await expect(page.getByRole('button', { name: 'Publish', exact: true })).toBeVisible();
    await openPalette(page);
    await expect(palette(page).getByRole('button', { name: 'Publish current page' })).toBeVisible();
  });
});
