import { expect, test } from '@playwright/test';

test('project cards show role and year with clean optional results and 16:10 covers', async ({
  page,
}) => {
  await page.goto('/vi/projects');
  const cards = page.locator('.projects-results .redesign-case-card');
  await expect(cards.first()).toBeVisible();
  await expect(cards.first()).toHaveAttribute('data-variant', 'featured');

  for (const card of await cards.all()) {
    await expect(card.locator('.project-card-meta')).toContainText(/.+·\s*\d{4}/);
    const result = card.locator('.project-card-result');
    if (await result.count()) {
      await expect(result).not.toBeEmpty();
      await expect(result).not.toContainText(/TODO|TBD/i);
    }
    expect(await card.locator('li').count()).toBeLessThanOrEqual(3);
    const cover = card.locator('img, [data-slot="cover-placeholder"]').first();
    const ratio = await cover.evaluate((element) => {
      const { width, height } = element.getBoundingClientRect();
      return width / height;
    });
    expect(ratio).toBeCloseTo(1.6, 1);
  }
});
