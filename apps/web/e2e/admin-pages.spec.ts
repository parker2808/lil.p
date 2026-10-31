import { expect, type Locator, type Page, test } from '@playwright/test';

import { signIn } from './helpers/auth';

function blockRow(page: Page, key: string): Locator {
  return page.locator('div.rounded-md').filter({
    has: page.locator('span.font-mono', { hasText: new RegExp(`^${key}$`) }),
  });
}

async function headingOrder(page: Page, earlier: string, later: string): Promise<void> {
  const first = page.getByRole('heading', { name: earlier });
  const second = page.getByRole('heading', { name: later });
  await expect(first).toBeVisible();
  await expect(second).toBeVisible();
  const firstBox = await first.boundingBox();
  const secondBox = await second.boundingBox();
  expect(firstBox?.y).toBeLessThan(secondBox?.y ?? Number.POSITIVE_INFINITY);
}

// `/en` is ISR and the API's revalidate webhook is fire-and-forget, so reload until it lands.
async function expectPublicHome(
  page: Page,
  earlier: string,
  later: string,
  stackHeadings: number,
): Promise<void> {
  await expect(async () => {
    await page.goto('/en');
    await headingOrder(page, earlier, later);
    await expect(page.getByRole('heading', { name: 'Stack' })).toHaveCount(stackHeadings, {
      timeout: 2_000,
    });
  }).toPass({ timeout: 30_000 });
}

async function moveWorkAboveFeatured(page: Page): Promise<void> {
  const origin = new URL(page.url()).origin;
  const response = await page.request.get('/api/admin/pages/home');
  expect(response.ok(), await response.text()).toBeTruthy();
  const home = (await response.json()) as {
    blocks: Array<{ id: number; key: string }>;
  };
  const ids = home.blocks.map((block) => block.id);
  const work = home.blocks.find((block) => block.key === 'work');
  const featured = home.blocks.find((block) => block.key === 'featured');
  expect(work).toBeTruthy();
  expect(featured).toBeTruthy();
  const next = ids.filter((id) => id !== work!.id);
  next.splice(
    next.findIndex((id) => id === featured!.id),
    0,
    work!.id,
  );
  const patched = await page.request.patch('/api/admin/pages/home/blocks/order', {
    headers: { Origin: origin },
    data: { ids: next },
  });
  expect(patched.ok(), await patched.text()).toBeTruthy();
}

test.describe('admin pages', () => {
  test('publish a new home order and restore the previous version', async ({ page }) => {
    test.setTimeout(90_000);
    await signIn(page);
    await page.goto('/admin/pages/home');
    await expect(blockRow(page, 'hero')).toBeVisible();

    await moveWorkAboveFeatured(page);
    await page.reload();
    await expect(blockRow(page, 'work')).toBeVisible();

    const marqueeVisible = blockRow(page, 'marquee').getByLabel('Visible');
    if (await marqueeVisible.isChecked()) {
      await marqueeVisible.click();
    }

    await page.getByRole('button', { name: 'Publish' }).click();
    await expect(page.getByText(/Published v/)).toBeVisible({ timeout: 20_000 });

    await expectPublicHome(page, 'Selected work', 'Featured case study', 0);

    await page.goto('/admin/pages/home');
    const origin = new URL(page.url()).origin;
    await page.getByRole('button', { name: 'History' }).click();
    await expect(page.getByRole('heading', { name: 'Version history' })).toBeVisible();
    await expect(page.getByRole('dialog').getByText('Version 1', { exact: true })).toBeAttached();
    await page.keyboard.press('Escape');
    const restored = await page.request.post('/api/admin/pages/home/versions/1/restore', {
      headers: { Origin: origin },
    });
    expect(restored.ok(), await restored.text()).toBeTruthy();
    const published = await page.request.post('/api/admin/pages/home/publish', {
      headers: { Origin: origin },
      data: {},
    });
    expect(published.ok(), await published.text()).toBeTruthy();

    await expectPublicHome(page, 'Featured case study', 'Selected work', 1);
  });
});
