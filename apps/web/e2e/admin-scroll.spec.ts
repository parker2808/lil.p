import { expect, test, type Locator, type Page } from '@playwright/test';

import { signIn } from './helpers/auth';

const editors = [
  { path: '/admin/projects/new', lastField: '[contenteditable="true"]' },
  { path: '/admin/posts/new', lastField: '#takeawaysEn' },
  { path: '/admin/experience/new', lastField: '#visible' },
] as const;

function editorColumn(page: Page): Locator {
  return page.locator('[data-slot="editor-shell"] > div:last-child > div:first-child');
}

for (const viewport of [
  { width: 375, height: 667 },
  { width: 768, height: 1024 },
]) {
  test(`main is the only editor scroller at ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    test.setTimeout(180_000);
    await page.setViewportSize(viewport);
    await signIn(page);

    for (const { path, lastField } of editors) {
      await page.goto(path);
      const column = editorColumn(page);
      const field = column.locator(lastField).last();
      await expect(field).toBeVisible();

      const overflowingAncestors = await field.evaluate((node) => {
        const result: string[] = [];
        for (let element = node.parentElement; element; element = element.parentElement) {
          if (element.scrollHeight > element.clientHeight + 1) {
            result.push(element.tagName === 'MAIN' ? 'main' : element.tagName.toLowerCase());
          }
        }
        return result;
      });
      expect(overflowingAncestors, path).toEqual(['main']);

      await page.locator('main').evaluate((main) => main.scrollTo(0, main.scrollHeight));
      expect(await page.locator('main').evaluate((main) => main.scrollTop)).toBeGreaterThan(0);
      await field.scrollIntoViewIfNeeded();
      await field.click();
    }
  });
}

test('editor columns scroll independently at 1280px', async ({ page }) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1280, height: 667 });
  await signIn(page);

  for (const { path } of editors) {
    await page.goto(path);
    const main = page.locator('main');
    const column = editorColumn(page);
    const aside = page.locator('[data-slot="editor-shell"] > div:last-child > aside').first();
    await expect(column).toBeVisible();
    await expect(aside).toBeVisible();
    expect(await column.evaluate((element) => getComputedStyle(element).overflowY)).toBe('auto');
    expect(await aside.evaluate((element) => getComputedStyle(element).overflowY)).toBe('auto');
    expect(await column.evaluate((element) => element.scrollHeight)).toBeGreaterThan(
      await column.evaluate((element) => element.clientHeight),
    );

    await column.evaluate((element) => element.scrollTo(0, element.scrollHeight));
    expect(await column.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
    expect(await main.evaluate((element) => element.scrollTop)).toBe(0);
    expect(await aside.evaluate((element) => element.scrollTop)).toBe(0);

    if (path === '/admin/projects/new') {
      expect(await aside.evaluate((element) => element.scrollHeight)).toBeGreaterThan(
        await aside.evaluate((element) => element.clientHeight),
      );
      const columnTop = await column.evaluate((element) => element.scrollTop);
      await aside.evaluate((element) => element.scrollTo(0, element.scrollHeight));
      expect(await aside.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
      expect(await column.evaluate((element) => element.scrollTop)).toBe(columnTop);
      expect(await main.evaluate((element) => element.scrollTop)).toBe(0);
    }
  }
});
