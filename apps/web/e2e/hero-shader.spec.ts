import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

test('390px touch screen renders the static hero without a WebGL canvas', async ({ page }) => {
  await page.goto('/vi');
  await expect(page.locator('.hero-stage')).toBeVisible();
  await expect(page.locator('.hero-stage canvas')).toHaveCount(0);
});
