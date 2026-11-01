import { expect, test } from '@playwright/test';

import { signIn } from './helpers/auth';

test.describe('admin save status', () => {
  test('shows the last saved time when an existing project opens', async ({ page }) => {
    await signIn(page);
    const response = await page.request.get('/api/admin/projects');
    expect(response.ok()).toBeTruthy();
    const list = (await response.json()) as { items: Array<{ id: number }> };
    expect(list.items.length).toBeGreaterThan(0);

    await page.goto(`/admin/projects/${list.items[0]!.id}`);

    const status = page.locator('[data-slot="editor-shell"] header [data-slot="save-status"]');
    await expect(status).toBeVisible();
    await expect(status).toHaveText(/^Saved \d{2}:\d{2}$/);
  });
});
