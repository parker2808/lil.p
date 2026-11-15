import { expect, test, type Locator, type Page, type TestInfo } from '@playwright/test';

import { signIn } from './helpers/auth';
import { switchBuilderLocale } from './helpers/builder-locale';

const firstHeading = 'Original UI version heading';
const firstVietnameseHeading = 'Tiêu đề phiên bản gốc';
const secondHeading = 'Edited UI version heading';
const secondVietnameseHeading = 'Tiêu đề phiên bản đã sửa';

async function savedHeading(
  page: Page,
  key: string,
  english: string,
  vietnamese: string,
  status = 'Draft saved',
) {
  await expect
    .poll(async () => {
      const response = await page.request.get(`/api/admin/pages/${key}/builder/draft`);
      if (response.status() !== 200) return null;
      const draft = await response.json();
      const heading = draft.tree?.root.sections[0]?.content[0]?.responsive.base;
      return heading?.title?.en === english && heading?.title?.vi === vietnamese ? draft : null;
    })
    .not.toBeNull();
  await expect(page.getByText(status, { exact: true })).toBeVisible();
  const response = await page.request.get(`/api/admin/pages/${key}/builder/draft`);
  expect(response.status()).toBe(200);
  return response.json();
}

async function publishFromUi(page: Page, key: string) {
  const publish = page.getByRole('button', { name: 'Publish', exact: true });
  await expect(publish).toBeEnabled();
  const response = page.waitForResponse(
    (item) =>
      item.request().method() === 'POST' &&
      item.url().endsWith(`/admin/pages/${key}/builder/publish`),
  );
  await publish.click();
  const result = await response;
  expect(result.status(), await result.text()).toBe(200);
  return result.json();
}

async function attachPaintedPage(
  page: Page,
  heading: Locator,
  testInfo: TestInfo,
  name: string,
  theme: 'light' | 'dark',
) {
  let screenshot: Buffer<ArrayBufferLike> = Buffer.alloc(0);
  await expect(async () => {
    await heading.evaluate((element) => element.scrollIntoView({ block: 'center' }));
    const box = await heading.boundingBox();
    if (!box) throw new Error('Restored heading has no painted box');
    expect(box.y).toBeGreaterThan(64);
    expect(box.y + box.height).toBeLessThan(900);
    screenshot = await page.screenshot({ animations: 'disabled' });
    const foregroundPixels = await page.evaluate(
      async ({ png, rect, theme }) => {
        const bytes = Uint8Array.from(atob(png), (char) => char.charCodeAt(0));
        const image = await createImageBitmap(
          new Blob([bytes.buffer as ArrayBuffer], { type: 'image/png' }),
        );
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Cannot inspect the rendered screenshot');
        context.drawImage(image, 0, 0);
        const scaleX = image.width / window.innerWidth;
        const scaleY = image.height / window.innerHeight;
        const left = Math.max(0, Math.floor(rect.x * scaleX));
        const top = Math.max(0, Math.floor(rect.y * scaleY));
        const width = Math.min(image.width - left, Math.ceil(rect.width * scaleX));
        const height = Math.min(image.height - top, Math.ceil(rect.height * scaleY));
        if (width <= 0 || height <= 0) return 0;
        const pixels = context.getImageData(left, top, width, height).data;
        let count = 0;
        for (let offset = 0; offset < pixels.length; offset += 4) {
          if (
            pixels[offset + 3]! > 200 &&
            (theme === 'dark'
              ? pixels[offset]! > 180 && pixels[offset + 1]! > 180 && pixels[offset + 2]! > 180
              : pixels[offset]! < 140 && pixels[offset + 1]! < 140 && pixels[offset + 2]! < 140)
          ) {
            count++;
          }
        }
        return count;
      },
      { png: screenshot.toString('base64'), rect: box, theme },
    );
    expect(foregroundPixels).toBeGreaterThan(30);
  }).toPass({ timeout: 15_000 });
  await testInfo.attach(name, { body: screenshot, contentType: 'image/png' });
}

async function pairedPublishedCapture(
  page: Page,
  testInfo: TestInfo,
  key: string,
  version: number,
  expectedHeadings: { en: string; vi: string },
) {
  for (const locale of ['en', 'vi'] as const) {
    const preview = await page.request.get(
      `/api/admin/preview/pages/${key}?locale=${locale}&version=${version}`,
    );
    const publicPage = await page.request.get(`/api/public/pages/${key}?locale=${locale}`);
    expect(preview.status()).toBe(200);
    expect(publicPage.status()).toBe(200);
    expect(await preview.json()).toEqual({ ...(await publicPage.json()), invalidBlocks: [] });
    for (const theme of (locale === 'vi' ? ['light', 'dark'] : ['light']) as Array<
      'light' | 'dark'
    >) {
      for (const width of [390, 768, 1440] as const) {
        await page.setViewportSize({ width, height: 900 });
        const path = `/${locale}/${key}`;
        await page.goto(path);
        await page.evaluate((value) => localStorage.setItem('theme', value), theme);
        const heading = page.locator('main.cms-core').getByRole('heading', {
          name: expectedHeadings[locale],
          level: 1,
        });
        await expect(async () => {
          await page.goto(path);
          await expect(page.locator('html')).toHaveAttribute('lang', locale);
          await expect(page.locator('html')).toHaveClass(new RegExp(`\\b${theme}\\b`));
          await expect(heading).toBeVisible();
        }).toPass({ timeout: 30_000 });
        const publicMarkup = await page.locator('main.cms-core').innerHTML();
        const name = `${locale}-${theme === 'dark' ? 'dark-' : ''}${width}-restored`;
        await attachPaintedPage(page, heading, testInfo, `${name}-public`, theme);
        await page.goto(`/api/draft?path=${encodeURIComponent(path)}`);
        await page.goto(`${path}?v=${version}`);
        await expect(page.locator('html')).toHaveClass(new RegExp(`\\b${theme}\\b`));
        await expect(heading).toBeVisible();
        expect(await page.locator('main.cms-core').innerHTML()).toBe(publicMarkup);
        await attachPaintedPage(page, heading, testInfo, `${name}-preview`, theme);
        await page.goto(`/api/draft?exit=1&path=${encodeURIComponent(path)}`);
      }
    }
  }
}

test('UI publish, edit, restore and republish preserves EN/VI preview/public parity', async ({
  page,
}, testInfo) => {
  test.setTimeout(240_000);
  await signIn(page);
  const key = `builder-ui-restore-${Date.now()}-${testInfo.retry}`;
  const created = await page.request.post('/api/admin/pages', {
    headers: { Origin: new URL(page.url()).origin },
    data: { key, title: 'UI restore journey', locale: 'en', template: 'starter' },
  });
  expect(created.status(), await created.text()).toBe(201);
  await page.goto(`/admin/builder/${key}`);
  await page.getByRole('button', { name: 'Activate tree draft' }).click();
  await expect(page.getByText('Draft saved', { exact: true })).toBeVisible();

  const palette = page.getByRole('complementary', { name: 'Components' });
  await palette.getByRole('button', { name: 'Section', exact: true }).click();
  await palette.getByRole('button', { name: 'Page header', exact: true }).click();
  const inspector = page.getByRole('complementary', { name: 'Properties' });
  const englishTitle = inspector.getByRole('textbox', { name: 'title (EN)' });
  const vietnameseTitle = inspector.getByRole('textbox', { name: 'title (VI)' });
  await englishTitle.fill(firstHeading);
  await savedHeading(page, key, firstHeading, '');
  await vietnameseTitle.fill(firstVietnameseHeading);
  const original = await savedHeading(page, key, firstHeading, firstVietnameseHeading);
  const firstPublished = await publishFromUi(page, key);
  expect(firstPublished.publishedVersion).toBe(1);
  const firstVersion = await page.request.get(`/api/admin/pages/${key}/versions/1`);
  expect(firstVersion.status(), await firstVersion.text()).toBe(200);
  expect((await firstVersion.json()).snapshot.tree).toEqual(original.tree);

  await englishTitle.fill(secondHeading);
  await savedHeading(page, key, secondHeading, firstVietnameseHeading);
  await vietnameseTitle.fill(secondVietnameseHeading);
  const edited = await savedHeading(page, key, secondHeading, secondVietnameseHeading);
  const secondPublished = await publishFromUi(page, key);
  expect(secondPublished.publishedVersion).toBe(2);
  const secondVersion = await page.request.get(`/api/admin/pages/${key}/versions/2`);
  expect(secondVersion.status(), await secondVersion.text()).toBe(200);
  expect((await secondVersion.json()).snapshot.tree).toEqual(edited.tree);
  expect(edited.tree).not.toEqual(original.tree);

  await switchBuilderLocale(page, 'vi');
  await page.setViewportSize({ width: 390, height: 900 });
  await page.getByRole('button', { name: 'Lịch sử phiên bản' }).click();
  await expect(page.getByText('Phiên bản 1', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Khôi phục bản nháp 1' }).click();
  const rejectedDialog = page.getByRole('alertdialog', {
    name: 'Khôi phục phiên bản này vào bản nháp?',
  });
  await expect(rejectedDialog).toBeVisible();
  await expect(rejectedDialog).toContainText('không xuất bản hoặc xóa phiên bản');
  const conflictingRestore = page.waitForResponse(
    (item) =>
      item.request().method() === 'POST' &&
      item.url().endsWith(`/admin/pages/${key}/versions/1/builder/restore`),
  );
  let concurrentWriteStatus: number | undefined;
  await page.route(`**/admin/pages/${key}/versions/1/builder/restore`, async (route) => {
    const current = await page.request.get(`/api/admin/pages/${key}/builder/draft`);
    expect(current.status()).toBe(200);
    const draft = await current.json();
    const changed = await page.request.put(`/api/admin/pages/${key}/builder/draft`, {
      headers: { Origin: new URL(page.url()).origin },
      data: { expectedRevision: draft.revision, tree: draft.tree },
    });
    concurrentWriteStatus = changed.status();
    await route.continue();
  });
  await rejectedDialog.getByRole('button', { name: 'Khôi phục bản nháp', exact: true }).click();
  const rejected = await conflictingRestore;
  expect(concurrentWriteStatus).toBe(200);
  expect(rejected.status(), await rejected.text()).toBe(409);
  await expect(rejectedDialog).toBeVisible();
  await expect(rejectedDialog.getByRole('alert')).toHaveText(
    'Bản nháp máy chủ đã thay đổi · tải lại trước khi thử lại',
  );
  await expect(rejectedDialog.getByRole('button', { name: 'Hủy' })).toBeFocused();
  await expect(
    rejectedDialog.getByRole('button', { name: 'Khôi phục bản nháp', exact: true }),
  ).toBeDisabled();
  const afterConflict = await page.request.get(`/api/admin/pages/${key}/builder/draft`);
  expect(afterConflict.status()).toBe(200);
  expect((await afterConflict.json()).tree).toEqual(edited.tree);
  const publicAfterConflict = await page.request.get(`/api/public/pages/${key}?locale=vi`);
  expect(publicAfterConflict.status()).toBe(200);
  expect((await publicAfterConflict.json()).tree).toEqual(edited.tree);
  const versionsAfterConflict = await page.request.get(`/api/admin/pages/${key}/versions`);
  expect(versionsAfterConflict.status()).toBe(200);
  expect(
    (await versionsAfterConflict.json()).map((row: { version: number }) => row.version),
  ).toEqual([2, 1]);
  await page.unroute(`**/admin/pages/${key}/versions/1/builder/restore`);
  await rejectedDialog.getByRole('button', { name: 'Hủy' }).click();
  await page.reload();
  await page.setViewportSize({ width: 1440, height: 900 });
  await switchBuilderLocale(page, 'en');
  await expect(page.getByText('Draft saved', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Version history' }).click();
  await expect(page.getByText('Version 1', { exact: true })).toBeVisible();
  const restoredResponse = page.waitForResponse(
    (item) =>
      item.request().method() === 'POST' &&
      item.url().endsWith(`/admin/pages/${key}/versions/1/builder/restore`),
  );
  await page.getByRole('button', { name: 'Restore draft 1' }).click();
  const confirm = page.getByRole('alertdialog', { name: 'Restore this version to the draft?' });
  await expect(confirm).toBeVisible();
  await confirm.getByRole('button', { name: 'Restore draft', exact: true }).click();
  const restored = await restoredResponse;
  expect(restored.status(), await restored.text()).toBe(200);
  expect((await restored.json()).tree).toEqual(original.tree);
  const restoredDraft = await savedHeading(
    page,
    key,
    firstHeading,
    firstVietnameseHeading,
    'Version restored to draft · publish separately to make it public',
  );
  expect(restoredDraft.tree).toEqual(original.tree);
  await expect(page.getByRole('button', { name: 'Undo', exact: true })).toBeDisabled();
  const stillPublished = await page.request.get(`/api/public/pages/${key}?locale=en`);
  expect(stillPublished.status()).toBe(200);
  expect((await stillPublished.json()).tree).toEqual(edited.tree);

  const thirdPublished = await publishFromUi(page, key);
  expect(thirdPublished.publishedVersion).toBe(3);
  const version = await page.request.get(`/api/admin/pages/${key}/versions/3`);
  expect(version.status(), await version.text()).toBe(200);
  expect((await version.json()).snapshot.tree).toEqual(original.tree);
  await pairedPublishedCapture(page, testInfo, key, 3, {
    en: firstHeading,
    vi: firstVietnameseHeading,
  });
});
