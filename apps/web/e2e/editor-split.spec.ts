import { expect, test, type Locator, type Page } from '@playwright/test';

import { signIn } from './helpers/auth';

const SAVED = /^Saved \d{2}:\d{2}$/;

async function firstId(page: Page, endpoint: string): Promise<number> {
  const response = await page.request.get(endpoint);
  expect(response.ok(), endpoint).toBeTruthy();
  const list = (await response.json()) as { items: Array<{ id: number }> };
  expect(list.items.length, endpoint).toBeGreaterThan(0);
  return list.items[0]!.id;
}

async function editorRoutes(page: Page): Promise<string[]> {
  const routes: string[] = [];
  for (const section of ['projects', 'posts', 'experience'] as const) {
    routes.push(`/admin/${section}/${await firstId(page, `/api/admin/${section}`)}`);
  }
  return routes;
}

function markdownTablists(page: Page): Locator {
  return page
    .getByRole('tablist')
    .filter({ has: page.getByRole('tab', { name: 'Write', exact: true }) });
}

test('desktop editors split content from properties under a save header', async ({ page }) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1280, height: 800 });
  await signIn(page);

  for (const path of await editorRoutes(page)) {
    await page.goto(path);
    const shell = page.locator('[data-slot="editor-shell"]');
    const header = shell.locator('[data-slot="page-header"]');
    await expect(header.getByRole('link', { name: /^Back to / }), path).toBeVisible();
    await expect(header.getByRole('heading', { level: 1 }), path).toBeVisible();
    await expect(header.locator('[data-slot="save-status"]'), path).toHaveText(SAVED);

    await expect(shell.locator('.ProseMirror').first(), path).toBeVisible();
    await expect(markdownTablists(page), path).toHaveCount(1);

    const content = shell.locator('> div:last-child > div:first-child');
    const aside = shell.getByRole('complementary', { name: 'Properties' });
    await expect(aside, path).toBeVisible();
    const contentBox = (await content.boundingBox())!;
    const asideBox = (await aside.boundingBox())!;
    expect(asideBox.x, path).toBeGreaterThanOrEqual(contentBox.x + contentBox.width);
    expect(Math.abs(asideBox.y - contentBox.y), path).toBeLessThan(2);
  }
});

test('save status stays visible after an edit', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await signIn(page);
  const id = await firstId(page, '/api/admin/posts');
  await page.goto(`/admin/posts/${id}`);

  const status = page.locator('[data-slot="editor-shell"] header [data-slot="save-status"]');
  await expect(status).toHaveText(SAVED);

  const title = page.locator('#titleEn');
  const original = await title.inputValue();
  for (const next of [`${original} edited`, original]) {
    const saved = page.waitForResponse(
      (response) =>
        response.request().method() === 'PATCH' &&
        response.url().endsWith(`/api/admin/posts/${id}`),
    );
    await title.fill(next);
    await expect(status).toBeVisible();
    expect((await saved).ok()).toBeTruthy();
    await expect(status).toHaveText(SAVED);
  }
});

test('the editor header stays pinned while main scrolls below lg', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await signIn(page);
  await page.goto(`/admin/posts/${await firstId(page, '/api/admin/posts')}`);

  const main = page.locator('main');
  const header = page.locator('[data-slot="editor-shell"] [data-slot="page-header"]');
  await expect(page.locator('#admin-topbar-status [data-slot="save-status"]')).toHaveText(SAVED);
  await expect(page.locator('.ProseMirror').first()).toBeVisible();
  await expect(markdownTablists(page)).toHaveCount(1);

  await main.evaluate((element) => element.scrollTo(0, element.scrollHeight));
  expect(await main.evaluate((element) => element.scrollTop)).toBeGreaterThan(200);

  const mainBox = (await main.boundingBox())!;
  const headerBox = (await header.boundingBox())!;
  expect(Math.abs(headerBox.y - mainBox.y)).toBeLessThan(2);
  await expect(header.getByRole('heading', { level: 1 })).toBeInViewport();
  await expect(header.getByRole('link', { name: /^Back to / })).toBeInViewport();
});
