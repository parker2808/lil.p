import { expect, test } from '@playwright/test';

import { signIn } from './helpers/auth';

test('project editor tab survives reload and Back restores the previous tab', async ({ page }) => {
  await signIn(page);
  const response = await page.request.get('/api/admin/projects');
  expect(response.ok()).toBeTruthy();
  const list = (await response.json()) as { items: Array<{ id: number }> };
  const path = `/admin/projects/${list.items[0]!.id}`;

  await page.goto(path);
  const tab = (name: string) => page.getByRole('tab', { name, exact: true });
  await expect(tab('Content')).toHaveAttribute('aria-selected', 'true');

  await tab('Metrics').click();
  await expect(page).toHaveURL(/\?tab=metrics$/);
  await expect(tab('Metrics')).toHaveAttribute('aria-selected', 'true');

  await tab('SEO').click();
  await expect(page).toHaveURL(/\?tab=seo$/);

  await page.goBack();
  await expect(page).toHaveURL(/\?tab=metrics$/);
  await expect(tab('Metrics')).toHaveAttribute('aria-selected', 'true');

  await page.goBack();
  await expect(page).toHaveURL(new RegExp(`${path}$`));
  await expect(tab('Content')).toHaveAttribute('aria-selected', 'true');

  await tab('SEO').click();
  await expect(page).toHaveURL(/\?tab=seo$/);
  await page.reload();
  await expect(tab('SEO')).toHaveAttribute('aria-selected', 'true');

  await page.goBack();
  await expect(page).toHaveURL(new RegExp(`${path}$`));
  await expect(tab('Content')).toHaveAttribute('aria-selected', 'true');
});

test('projects view survives reload and Back restores the previous view', async ({ page }) => {
  await page.goto('/en/projects');
  const view = page.locator('.projects-view');
  await expect(view).toHaveAttribute('data-view', 'grid');

  await page.getByRole('button', { name: 'Index', exact: true }).click();
  await expect(page).toHaveURL(/\/en\/projects\?view=index$/);
  await expect(view).toHaveAttribute('data-view', 'index');

  await page.reload();
  await expect(view).toHaveAttribute('data-view', 'index');
  await expect(page.getByRole('button', { name: 'Index', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );

  await page.goBack();
  await expect(page).toHaveURL(/\/en\/projects$/);
  await expect(view).toHaveAttribute('data-view', 'grid');
});
