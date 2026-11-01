import { expect, test } from '@playwright/test';

test('projects header spacing and featured card fill the desktop grid', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/en/projects');

  const intro = page.locator('[data-block-type="page-header"] header .text-prose');
  const filters = page.locator('.projects-filters');
  const featured = page.locator('.projects-results [data-variant="featured"]');
  await expect(intro).toBeVisible();
  await expect(filters).toBeVisible();
  await expect(featured).toBeVisible();

  const introBox = (await intro.boundingBox())!;
  const filtersBox = (await filters.boundingBox())!;
  const gap = filtersBox.y - (introBox.y + introBox.height);
  expect(gap).toBeGreaterThanOrEqual(0);
  expect(gap).toBeLessThanOrEqual(48);

  const layout = await featured.evaluate((card) => {
    const results = card.closest('.projects-results')!;
    const grid = card.querySelector(':scope > div')!;
    const cover = grid.firstElementChild!;
    const details = grid.lastElementChild!;
    const bounds = (element: Element) => element.getBoundingClientRect();
    return {
      resultsWidth: bounds(results).width,
      cardWidth: bounds(card).width,
      coverWidth: bounds(cover).width,
      detailsWidth: bounds(details).width,
      coverRight: bounds(cover).right,
      detailsLeft: bounds(details).left,
      detailsRight: bounds(details).right,
      gridRight: bounds(grid).right,
    };
  });
  expect(layout.cardWidth / layout.resultsWidth).toBeGreaterThan(0.95);
  expect(layout.coverWidth / (layout.coverWidth + layout.detailsWidth)).toBeCloseTo(7 / 12, 1);
  expect(layout.detailsWidth / (layout.coverWidth + layout.detailsWidth)).toBeCloseTo(5 / 12, 1);
  expect(layout.detailsLeft).toBeGreaterThan(layout.coverRight);
  expect(layout.gridRight - layout.detailsRight).toBeLessThanOrEqual(1);
});

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
