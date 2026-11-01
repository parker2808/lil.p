import { expect, test, type Page } from '@playwright/test';

import { signIn } from './helpers/auth';

// iPhone SE-like mobile viewport: 375x667 with touch input, on the pinned Chromium project.
test.use({
  viewport: { width: 375, height: 667 },
  hasTouch: true,
  isMobile: true,
});

const dialog = (page: Page) => page.locator('[role="dialog"]');

async function openMenu(page: Page): Promise<void> {
  await page.locator('[data-slot="sheet-trigger"]').first().click();
  await expect(dialog(page)).toBeVisible();
}

async function expectBodyUnlocked(page: Page): Promise<void> {
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const inline = document.body.style;
          const computed = getComputedStyle(document.body);
          return {
            pointerEvents: inline.pointerEvents || computed.pointerEvents,
            overflow: inline.overflow || computed.overflowY,
          };
        }),
      { timeout: 10_000 },
    )
    .toEqual({ pointerEvents: 'auto', overflow: 'visible' });
}

async function expectWindowScrolls(page: Page): Promise<void> {
  await expect
    .poll(() =>
      page.evaluate(() => {
        const el = document.scrollingElement;
        return el ? el.scrollHeight - el.clientHeight : 0;
      }),
    )
    .toBeGreaterThan(0);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.mouse.wheel(0, 600);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  await page.evaluate(() => window.scrollTo(0, 0));
}

async function expectAdminPaneScrolls(page: Page): Promise<void> {
  const pane = page.locator('.admin-main');
  await pane.evaluate((el) => el.scrollTo(0, 0));
  await page.mouse.move(200, 400);
  await page.mouse.wheel(0, 800);
  await expect.poll(() => pane.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
  await pane.evaluate((el) => el.scrollTo(0, 0));
}

test.describe('public header menu', () => {
  test('tapping each nav link closes the menu and unlocks the body', async ({ page }) => {
    test.setTimeout(240_000);
    await page.goto('/en');
    await openMenu(page);
    const hrefs = await page
      .locator('[data-slot="sheet-content"] a[data-slot="nav-link"]')
      .evaluateAll((links) =>
        links.map((link) => (link as HTMLAnchorElement).getAttribute('href')),
      );
    expect(hrefs.length).toBeGreaterThan(0);

    await page.keyboard.press('Escape');
    await expect(dialog(page)).toHaveCount(0);

    for (const href of hrefs) {
      await openMenu(page);
      await page
        .locator(`[data-slot="sheet-content"] a[data-slot="nav-link"][href="${href}"]`)
        .tap();

      await expect(dialog(page)).toHaveCount(0);
      await expect(page).toHaveURL(new RegExp(`${href}/?(?:$|\\?)`));
      await expectBodyUnlocked(page);
      await expectWindowScrolls(page);
    }
  });

  test('Escape closes the menu', async ({ page }) => {
    await page.goto('/en');
    await openMenu(page);
    await page.keyboard.press('Escape');
    await expect(dialog(page)).toHaveCount(0);
    await expectBodyUnlocked(page);
    await expectWindowScrolls(page);
  });
});

test.describe('admin topbar menu', () => {
  test('tapping each nav link closes the menu and unlocks the body', async ({ page }) => {
    test.setTimeout(300_000);
    await signIn(page);
    await openMenu(page);
    const hrefs = await page
      .locator('[data-slot="sheet-content"] a[href^="/admin"]')
      .evaluateAll((links) =>
        links.map((link) => (link as HTMLAnchorElement).getAttribute('href')),
      );
    expect(hrefs.length).toBeGreaterThan(0);

    await page.keyboard.press('Escape');
    await expect(dialog(page)).toHaveCount(0);

    for (const href of hrefs) {
      await openMenu(page);
      await page.locator(`[data-slot="sheet-content"] a[href="${href}"]`).tap();

      await expect(dialog(page)).toHaveCount(0);
      await expect(page).toHaveURL(new RegExp(`${href}/?(?:$|\\?)`));
      await expectBodyUnlocked(page);
    }
    await expectAdminPaneScrolls(page);
  });

  test('Escape closes the menu', async ({ page }) => {
    await signIn(page);
    await openMenu(page);
    await page.keyboard.press('Escape');
    await expect(dialog(page)).toHaveCount(0);
    await expectBodyUnlocked(page);
    await expectAdminPaneScrolls(page);
  });
});
