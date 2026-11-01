import { expect, test } from '@playwright/test';

for (const locale of ['vi', 'en']) {
  test(`/${locale}/about: clean copy, 75ch lines, timeline, skill groups and mock avatar`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`/${locale}/about`);
    await page.evaluate(() => document.fonts.ready);
    const main = page.locator('main#content');
    await expect(main.locator('h1')).toBeVisible();
    await expect(main).not.toContainText(/\bTODO\b|\bTBD\b/);

    const widestLineInCh = await main.locator('p').evaluateAll((elements) => {
      let widest = 0;
      const context = document.createElement('canvas').getContext('2d')!;
      for (const element of elements) {
        if (!element.getClientRects().length || !element.textContent?.trim()) continue;
        const style = getComputedStyle(element);
        context.font = `${style.fontSize} ${style.fontFamily}`;
        widest = Math.max(
          widest,
          element.getBoundingClientRect().width / context.measureText('0').width,
        );
      }
      return widest;
    });
    expect(widestLineInCh).toBeGreaterThan(0);
    expect(widestLineInCh).toBeLessThanOrEqual(75);

    const entries = main.locator('[data-slot="timeline"] [data-slot="timeline-entry"]');
    await expect(entries.first()).toBeVisible();
    const yearFont = await entries
      .first()
      .locator('[data-slot="timeline-years"]')
      .evaluate((element) => getComputedStyle(element).fontFamily);
    expect(yearFont).toMatch(/IBM Plex Mono|IBM_Plex_Mono/);
    const companyFont = await entries
      .first()
      .locator('h3')
      .evaluate((element) => getComputedStyle(element).fontFamily);
    expect(companyFont).toMatch(/IBM Plex Sans|IBM_Plex_Sans/);

    const categories = main.locator('[data-slot="skill-group"] [data-slot="skill-category"]');
    await expect(categories.first()).toBeVisible();
    for (const category of await categories.all()) {
      await expect(category.locator('h3')).not.toBeEmpty();
      expect(await category.locator('li').count()).toBeGreaterThan(0);
    }
    await expect(main.locator('[data-slot="skill-group"] [data-slot="badge"]')).toHaveCount(0);

    // The e2e demo seed profile has no avatar photo.
    const avatar = main.locator('img[data-slot="about-avatar"]');
    await expect(avatar).toBeVisible();
    await expect(avatar).toHaveAttribute('src', '/mock/avatar.svg');
    await expect(avatar).toHaveAttribute('alt', (await main.locator('h1').textContent())!.trim());
    expect(await avatar.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(
      0,
    );
  });
}
