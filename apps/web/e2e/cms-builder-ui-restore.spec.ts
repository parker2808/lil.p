import { expect, test, type Page, type TestInfo } from '@playwright/test';

import { signIn } from './helpers/auth';
import { switchBuilderLocale } from './helpers/builder-locale';

const firstHeading = 'Original UI version heading';
const secondHeading = 'Edited UI version heading';

async function savedHeading(page: Page, key: string, text: string) {
  await expect
    .poll(async () => {
      const response = await page.request.get(`/api/admin/pages/${key}/builder/draft`);
      if (response.status() !== 200) return null;
      const draft = await response.json();
      const heading = draft.tree?.root.sections[0]?.content[0]?.responsive.base;
      return heading?.text === text && heading?.level === 1 ? draft : null;
    })
    .not.toBeNull();
  await expect(page.getByText('Draft saved', { exact: true })).toBeVisible();
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

async function pairedPublishedCapture(
  page: Page,
  testInfo: TestInfo,
  key: string,
  version: number,
  expectedHeading: string,
) {
  for (const locale of ['en', 'vi'] as const) {
    const preview = await page.request.get(
      `/api/admin/preview/pages/${key}?locale=${locale}&version=${version}`,
    );
    const publicPage = await page.request.get(`/api/public/pages/${key}?locale=${locale}`);
    expect(preview.status()).toBe(200);
    expect(publicPage.status()).toBe(200);
    expect(await preview.json()).toEqual({ ...(await publicPage.json()), invalidBlocks: [] });
    for (const width of [390, 768, 1440] as const) {
      await page.setViewportSize({ width, height: 900 });
      const path = `/${locale}/${key}`;
      await expect(async () => {
        await page.goto(path);
        await expect(page.getByRole('heading', { name: expectedHeading, level: 1 })).toBeVisible();
      }).toPass({ timeout: 30_000 });
      const publicMarkup = await page.locator('main.cms-core').innerHTML();
      await testInfo.attach(`${locale}-${width}-restored-public`, {
        body: await page.locator('main.cms-core').screenshot({ animations: 'disabled' }),
        contentType: 'image/png',
      });
      await page.goto(`/api/draft?path=${encodeURIComponent(path)}`);
      await page.goto(`${path}?v=${version}`);
      await expect(page.getByRole('heading', { name: expectedHeading, level: 1 })).toBeVisible();
      expect(await page.locator('main.cms-core').innerHTML()).toBe(publicMarkup);
      await testInfo.attach(`${locale}-${width}-restored-preview`, {
        body: await page.locator('main.cms-core').screenshot({ animations: 'disabled' }),
        contentType: 'image/png',
      });
      await page.goto(`/api/draft?exit=1&path=${encodeURIComponent(path)}`);
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
  await palette.getByRole('button', { name: 'Heading', exact: true }).click();
  const inspector = page.getByRole('complementary', { name: 'Properties' });
  await inspector.getByRole('textbox', { name: 'Text' }).fill(firstHeading);
  await inspector.getByRole('spinbutton', { name: 'Heading level' }).fill('1');
  const original = await savedHeading(page, key, firstHeading);
  const firstPublished = await publishFromUi(page, key);
  expect(firstPublished.publishedVersion).toBe(1);
  const firstVersion = await page.request.get(`/api/admin/pages/${key}/versions/1`);
  expect(firstVersion.status(), await firstVersion.text()).toBe(200);
  expect((await firstVersion.json()).snapshot.tree).toEqual(original.tree);

  await inspector.getByRole('textbox', { name: 'Text' }).fill(secondHeading);
  const edited = await savedHeading(page, key, secondHeading);
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
  expect(await rejectedDialog.evaluate((dialog) => dialog.contains(document.activeElement))).toBe(
    true,
  );
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
  expect((await savedHeading(page, key, firstHeading)).tree).toEqual(original.tree);
  await expect(page.getByRole('button', { name: 'Undo', exact: true })).toBeDisabled();
  const stillPublished = await page.request.get(`/api/public/pages/${key}?locale=en`);
  expect(stillPublished.status()).toBe(200);
  expect((await stillPublished.json()).tree).toEqual(edited.tree);

  const thirdPublished = await publishFromUi(page, key);
  expect(thirdPublished.publishedVersion).toBe(3);
  const version = await page.request.get(`/api/admin/pages/${key}/versions/3`);
  expect(version.status(), await version.text()).toBe(200);
  expect((await version.json()).snapshot.tree).toEqual(original.tree);
  await pairedPublishedCapture(page, testInfo, key, 3, firstHeading);
});
