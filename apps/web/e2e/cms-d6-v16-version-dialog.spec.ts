import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';

import { signIn } from './helpers/auth';

async function tabTo(page: Page, target: Locator) {
  await expect(target).toBeVisible();
  for (let step = 0; step < 100; step++) {
    if (await target.evaluate((element) => document.activeElement === element)) return;
    await page.keyboard.press('Tab');
  }
  throw new Error('Keyboard navigation did not reach the version control');
}

for (const locale of ['en', 'vi'] as const) {
  for (const theme of ['light', 'dark'] as const) {
    test(`${locale}/${theme} keyboard publish and restore confirmation expose focus and status`, async ({
      page,
      context,
    }, testInfo) => {
      test.setTimeout(180_000);
      await signIn(page);
      const origin = new URL(page.url()).origin;
      await context.addCookies([{ name: 'NEXT_LOCALE', value: locale, url: origin }]);
      await page.evaluate((value) => localStorage.setItem('theme', value), theme);
      const key = `v16-version-${locale}-${theme}-${Date.now()}-${testInfo.retry}`;
      const created = await page.request.post('/api/admin/pages', {
        headers: { Origin: origin },
        data: { key, title: 'V16 version dialog', locale, template: 'starter' },
      });
      expect(created.status(), await created.text()).toBe(201);
      await page.goto(`/admin/builder/${key}`);
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await expect(page.locator('html')).toHaveClass(new RegExp(`\\b${theme}\\b`));

      const copy =
        locale === 'vi'
          ? {
              activate: 'Kích hoạt bản nháp cây',
              components: 'Thành phần',
              section: 'Phần',
              heading: 'Tiêu đề',
              properties: 'Thuộc tính',
              level: 'Cấp tiêu đề',
              text: 'Văn bản',
              saved: 'Đã lưu bản nháp',
              publish: 'Xuất bản',
              published: 'Đã xuất bản · bản nháp sẵn sàng để chỉnh sửa tiếp',
              history: 'Lịch sử phiên bản',
              restoreVersion: 'Khôi phục bản nháp 1',
              confirm: 'Khôi phục phiên bản này vào bản nháp?',
              warning:
                'Thao tác này thay thế bản nháp trên máy chủ, không xuất bản hoặc xóa phiên bản.',
              cancel: 'Hủy',
              restore: 'Khôi phục bản nháp',
              restored: 'Đã khôi phục vào bản nháp · xuất bản riêng để cập nhật trang công khai',
            }
          : {
              activate: 'Activate tree draft',
              components: 'Components',
              section: 'Section',
              heading: 'Heading',
              properties: 'Properties',
              level: 'Heading level',
              text: 'Text',
              saved: 'Draft saved',
              publish: 'Publish',
              published: 'Published · draft is ready for further edits',
              history: 'Version history',
              restoreVersion: 'Restore draft 1',
              confirm: 'Restore this version to the draft?',
              warning:
                'This replaces the current server draft. It does not publish or delete any version.',
              cancel: 'Cancel',
              restore: 'Restore draft',
              restored: 'Version restored to draft · publish separately to make it public',
            };

      const activate = page.getByRole('button', { name: copy.activate });
      await tabTo(page, activate);
      await page.keyboard.press('Enter');
      const palette = page.getByRole('complementary', { name: copy.components });
      for (const name of [copy.section, copy.heading]) {
        await tabTo(page, palette.getByRole('button', { name, exact: true }));
        await page.keyboard.press('Enter');
      }
      const inspector = page.getByRole('complementary', { name: copy.properties });
      const level = inspector.getByRole('spinbutton', { name: copy.level });
      await tabTo(page, level);
      await page.keyboard.press('ControlOrMeta+A');
      await page.keyboard.press('1');
      await page.keyboard.press('Tab');
      const draftUrl = `/api/admin/pages/${key}/builder/draft`;
      await expect
        .poll(async () => {
          const response = await page.request.get(draftUrl);
          if (!response.ok()) return null;
          const draft = await response.json();
          return draft.tree?.root.sections[0]?.content[0]?.responsive.base.level === 1
            ? draft
            : null;
        })
        .not.toBeNull();
      await expect(page.getByText(copy.saved, { exact: true })).toBeVisible();

      const publish = page.getByRole('button', { name: copy.publish, exact: true });
      await tabTo(page, publish);
      const publishing = page.waitForResponse(
        (response) =>
          response.request().method() === 'POST' &&
          response.url().endsWith(`/admin/pages/${key}/builder/publish`),
      );
      await page.keyboard.press('Enter');
      expect((await publishing).status()).toBe(200);
      await expect(page.locator('.cms-core header [aria-live="polite"]')).toHaveText(
        copy.published,
      );
      const published = await page.request.get(`/api/admin/pages/${key}/versions/1`);
      expect(published.status()).toBe(200);
      const original = (await published.json()).snapshot.tree;

      const text = inspector.getByRole('textbox', { name: copy.text, exact: true });
      await tabTo(page, text);
      await page.keyboard.press('ControlOrMeta+A');
      await page.keyboard.type(locale === 'vi' ? 'Tiêu đề chưa xuất bản' : 'Unpublished heading');
      await page.keyboard.press('Tab');
      await expect
        .poll(async () => {
          const response = await page.request.get(draftUrl);
          const draft = await response.json();
          return draft.tree?.root.sections[0]?.content[0]?.responsive.base.text;
        })
        .toBe(locale === 'vi' ? 'Tiêu đề chưa xuất bản' : 'Unpublished heading');
      await expect(page.getByText(copy.saved, { exact: true })).toBeVisible();

      await page.setViewportSize({ width: theme === 'dark' ? 390 : 1440, height: 900 });
      const history = page.getByRole('button', { name: copy.history });
      await tabTo(page, history);
      await page.keyboard.press('Enter');
      const sheet = page.getByRole('dialog', { name: copy.history });
      await expect(sheet).toHaveAttribute('aria-modal', 'true');
      const trigger = sheet.getByRole('button', { name: copy.restoreVersion });
      await tabTo(page, trigger);

      const dialog = page.getByRole('alertdialog', { name: copy.confirm });
      const cancel = dialog.getByRole('button', { name: copy.cancel });
      const confirm = dialog.getByRole('button', { name: copy.restore, exact: true });
      for (const dismissal of ['Escape', 'Cancel'] as const) {
        await page.keyboard.press('Enter');
        await expect(dialog).toBeVisible();
        await expect(dialog).toHaveAttribute('aria-modal', 'true');
        await expect(dialog).toContainText(copy.warning);
        await expect(cancel).toBeFocused();
        for (let step = 0; step < 4; step++) {
          await page.keyboard.press('Tab');
          expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(
            true,
          );
          await page.keyboard.press('Shift+Tab');
          expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(
            true,
          );
        }
        const audit = await new AxeBuilder({ page })
          .include('[role="alertdialog"]')
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
          .analyze();
        expect(audit.violations).toEqual([]);
        await testInfo.attach(`${locale}-${theme}-${dismissal}-restore-dialog.png`, {
          body: await dialog.screenshot({ animations: 'disabled' }),
          contentType: 'image/png',
        });
        if (dismissal === 'Escape') await page.keyboard.press('Escape');
        else {
          await tabTo(page, cancel);
          await page.keyboard.press('Enter');
        }
        await expect(dialog).toHaveCount(0);
        await expect(trigger).toBeFocused();
        const draft = await page.request.get(draftUrl);
        expect((await draft.json()).tree).not.toEqual(original);
      }

      await page.keyboard.press('Enter');
      await expect(dialog).toBeVisible();
      await tabTo(page, confirm);
      const restoring = page.waitForResponse(
        (response) =>
          response.request().method() === 'POST' &&
          response.url().endsWith(`/admin/pages/${key}/versions/1/builder/restore`),
      );
      await page.keyboard.press('Enter');
      expect((await restoring).status()).toBe(200);
      await expect(dialog).toHaveCount(0);
      await expect(page.locator('.cms-core header [aria-live="polite"]')).toHaveText(copy.restored);
      await expect(history).toBeFocused();
      const restored = await page.request.get(draftUrl);
      expect((await restored.json()).tree).toEqual(original);
      const publicPage = await page.request.get(`/api/public/pages/${key}?locale=${locale}`);
      expect((await publicPage.json()).tree).toEqual(original);
    });
  }
}
