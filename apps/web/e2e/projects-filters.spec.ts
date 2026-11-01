import { expect, test } from '@playwright/test';

test('projects filters follow the URL across navigation and reload', async ({ page }) => {
  await page.goto('/vi/projects');
  const filters = page.locator('.projects-filters');
  const domain = filters.locator('a[href*="domain="]').first();
  const domainHref = await domain.getAttribute('href');
  expect(domainHref).toContain('domain=');

  await domain.click();
  await expect(page).toHaveURL(/\/vi\/projects\?domain=/);
  const filteredCards = page.locator('.projects-results .redesign-case-card');
  await expect(filteredCards.first()).toBeVisible();
  const titles = await filteredCards.locator('h2, h3').allTextContents();

  await page.reload();
  await expect(page).toHaveURL(/\/vi\/projects\?domain=/);
  await expect(filteredCards.locator('h2, h3')).toHaveText(titles);

  await page.goto('/vi/projects');
  await filters.locator('button').click();
  await page.getByRole('option').nth(1).click();
  await expect(page).toHaveURL(/\/vi\/projects\?skill=/);
  await expect(filteredCards.first()).toBeVisible();
  const skillTitles = await filteredCards.locator('h2, h3').allTextContents();
  await page.reload();
  await expect(filteredCards.locator('h2, h3')).toHaveText(skillTitles);

  await page.goto('/vi/projects?domain=no-such-domain');
  const clear = page.locator('.projects-results a').first();
  await expect(clear).toBeVisible();
  await clear.click();
  await expect(page).toHaveURL(/\/vi\/projects$/);
  await expect(filteredCards.first()).toBeVisible();
});
