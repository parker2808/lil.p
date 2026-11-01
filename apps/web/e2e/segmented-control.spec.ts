import { expect, test, type Locator } from '@playwright/test';

import { signIn } from './helpers/auth';

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

async function expectNoTrailingGap(control: Locator, options: Locator): Promise<void> {
  const controlBox = await control.boundingBox();
  const optionBoxes = await options.evaluateAll((elements) =>
    elements.map((element) => element.getBoundingClientRect().width),
  );
  expect(controlBox).not.toBeNull();
  expect(optionBoxes.length).toBeGreaterThan(1);
  expect(
    Math.abs(controlBox!.width - optionBoxes.reduce((sum, width) => sum + width, 0)),
  ).toBeLessThanOrEqual(2);
}

test('admin range control fits its buttons at 390px', async ({ page }) => {
  await signIn(page);
  await page.goto('/admin');
  const control = page.getByRole('radiogroup', { name: 'Period' });
  await expect(control).toBeVisible();
  await expectNoTrailingGap(control, control.getByRole('radio'));
});

test('menu locale control fits VI and EN at 390px', async ({ page }) => {
  await page.goto('/en');
  await page.locator('[data-slot="sheet-trigger"]').first().click();
  const control = page
    .locator('[data-slot="sheet-content"] nav[aria-label]')
    .filter({ has: page.getByRole('link', { name: 'VI', exact: true }) });
  await expect(control).toBeVisible();
  await expectNoTrailingGap(control, control.locator('a'));
});
