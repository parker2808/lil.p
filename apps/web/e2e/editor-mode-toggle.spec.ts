import { expect, test } from '@playwright/test';

import { signIn } from './helpers/auth';

test('project editor has one Write/Preview toggle for all markdown fields', async ({ page }) => {
  await signIn(page);
  const response = await page.request.get('/api/admin/projects');
  expect(response.ok()).toBeTruthy();
  const list = (await response.json()) as { items: Array<{ id: number }> };
  const id = list.items.find((item) => item.id === 4)?.id ?? list.items[0]!.id;

  await page.goto(`/admin/projects/${id}`);
  const content = page.getByRole('tabpanel', { name: 'Content' });
  const editors = content.locator('.ProseMirror');
  await expect(editors).toHaveCount(6);

  await expect(page.getByRole('tablist')).toHaveCount(2);
  const toggle = page.getByRole('tablist').nth(1);
  await expect(toggle.getByRole('tab')).toHaveText(['Write', 'Preview']);

  await toggle.getByRole('tab', { name: 'Preview' }).click();
  await expect(toggle.getByRole('tab', { name: 'Preview' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(editors).toHaveCount(0);
  await expect(page.getByRole('tablist')).toHaveCount(2);

  await toggle.getByRole('tab', { name: 'Write' }).click();
  await expect(editors).toHaveCount(6);
});
