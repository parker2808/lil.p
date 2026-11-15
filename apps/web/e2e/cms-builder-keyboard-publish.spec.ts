import { expect, test, type Locator, type Page } from '@playwright/test';

import { signIn } from './helpers/auth';

async function tabTo(page: Page, target: Locator) {
  await expect(target).toBeVisible();
  if (await target.evaluate((element) => document.activeElement === element)) {
    await expect(target).toBeFocused();
    return;
  }
  for (let step = 0; step < 100; step++) {
    await page.keyboard.press('Tab');
    if (await target.evaluate((element) => document.activeElement === element)) {
      await expect(target).toBeFocused();
      return;
    }
  }
  throw new Error(`Tab navigation did not reach ${await target.getAttribute('aria-label')}`);
}

for (const locale of ['en', 'vi'] as const) {
  test(`${locale} keyboard-only edit, reorder, publish and reload retain the saved tree`, async ({
    page,
    context,
  }, testInfo) => {
    await signIn(page);
    const origin = new URL(page.url()).origin;
    await context.addCookies([{ name: 'NEXT_LOCALE', value: locale, url: origin }]);
    const key = `v02-publish-${locale}-${Date.now()}-${testInfo.retry}`;
    const created = await page.request.post('/api/admin/pages', {
      headers: { Origin: origin },
      data: { title: `V02 ${locale}`, key, locale, template: 'starter' },
    });
    expect(created.status(), await created.text()).toBe(201);
    await page.goto(`/admin/builder/${key}`);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await page.evaluate(() => {
      document.documentElement.dataset.pointerDownCount = '0';
      document.addEventListener('pointerdown', () => {
        document.documentElement.dataset.pointerDownCount = String(
          Number(document.documentElement.dataset.pointerDownCount) + 1,
        );
      });
    });

    const copy =
      locale === 'en'
        ? {
            activate: 'Activate tree draft',
            palette: 'Components',
            section: 'Section',
            heading: 'Heading',
            paragraph: 'Paragraph',
            inspector: 'Properties',
            text: 'Text',
            level: 'Heading level',
            layers: 'Layers',
            selected: 'Selected: Paragraph',
            saved: 'Draft saved',
            history: 'Version history',
            publish: 'Publish',
            published: 'Published · draft is ready for further edits',
            version: 'Version 1',
          }
        : {
            activate: 'Kích hoạt bản nháp cây',
            palette: 'Thành phần',
            section: 'Phần',
            heading: 'Tiêu đề',
            paragraph: 'Đoạn văn',
            inspector: 'Thuộc tính',
            text: 'Văn bản',
            level: 'Cấp tiêu đề',
            layers: 'Lớp',
            selected: 'Đã chọn: Đoạn văn',
            saved: 'Đã lưu bản nháp',
            history: 'Lịch sử phiên bản',
            publish: 'Xuất bản',
            published: 'Đã xuất bản · bản nháp sẵn sàng để chỉnh sửa tiếp',
            version: 'Phiên bản 1',
          };
    const activate = page.getByRole('button', { name: copy.activate });
    await tabTo(page, activate);
    await page.keyboard.press('Enter');

    const palette = page.getByRole('complementary', { name: copy.palette });
    for (const name of [copy.section, copy.heading]) {
      const button = palette.getByRole('button', { name, exact: true });
      await tabTo(page, button);
      await page.keyboard.press('Enter');
    }
    const inspector = page.getByRole('complementary', { name: copy.inspector });
    const textField = inspector.getByRole('textbox', { name: copy.text, exact: true });
    const editedText = locale === 'vi' ? 'Tiêu đề dùng bàn phím' : 'Keyboard-edited heading';
    await tabTo(page, textField);
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.type(editedText);
    await page.keyboard.press('Tab');
    const headingLevel = inspector.getByRole('spinbutton', { name: copy.level });
    await tabTo(page, headingLevel);
    await expect(headingLevel).toBeFocused();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.press('1');
    await page.keyboard.press('Tab');

    const paragraphButton = palette.getByRole('button', {
      name: copy.paragraph,
      exact: true,
    });
    await tabTo(page, paragraphButton);
    await page.keyboard.press('Enter');
    const tree = page.getByRole('complementary', { name: copy.layers }).getByRole('tree');
    const paragraph = tree.getByRole('treeitem', { name: new RegExp(copy.paragraph) });
    const announcement = page.locator('.cms-core [role="status"][aria-live="polite"]').last();
    await expect(announcement).toHaveText(copy.selected);
    await tabTo(page, paragraph);
    const draftUrl = `/api/admin/pages/${key}/builder/draft`;
    await expect
      .poll(async () => {
        const response = await page.request.get(draftUrl);
        if (response.status() !== 200) return null;
        const content = (await response.json()).tree?.root.sections[0]?.content;
        return content?.map((node: { componentType: string }) => node.componentType);
      })
      .toEqual(['heading', 'paragraph']);
    await page.keyboard.press('Alt+ArrowUp');
    await expect(paragraph).toBeFocused();

    await expect
      .poll(async () => {
        const response = await page.request.get(draftUrl);
        if (response.status() !== 200) return null;
        const draft = await response.json();
        const content = draft.tree?.root.sections[0]?.content;
        return content?.[0]?.componentType === 'paragraph' &&
          content?.[1]?.componentType === 'heading' &&
          content?.[1]?.responsive.base.text === editedText &&
          content?.[1]?.responsive.base.level === 1
          ? draft
          : null;
      })
      .not.toBeNull();
    const savedResponse = await page.request.get(draftUrl);
    expect(savedResponse.status()).toBe(200);
    const saved = await savedResponse.json();
    await expect(page.getByText(copy.saved, { exact: true })).toBeVisible();

    const history = page.getByRole('button', { name: copy.history });
    const publish = page.getByRole('button', { name: copy.publish, exact: true });
    await expect(publish).toBeEnabled();
    await tabTo(page, history);
    await page.keyboard.press('Shift+Tab');
    await expect(publish).toBeFocused();
    const publishing = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        response.url().endsWith(`/admin/pages/${key}/builder/publish`),
    );
    await page.keyboard.press('Enter');
    const result = await publishing;
    expect(result.status(), await result.text()).toBe(200);
    expect((await result.json()).publishedVersion).toBe(1);
    await expect(page.locator('.cms-core header [aria-live="polite"]')).toHaveText(copy.published);
    await expect(page.locator('html')).toHaveAttribute('data-pointer-down-count', '0');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page.getByText(copy.saved, { exact: true })).toBeVisible();
    const reloaded = await page.request.get(draftUrl);
    expect(reloaded.status()).toBe(200);
    expect((await reloaded.json()).tree).toEqual(saved.tree);
    const version = await page.request.get(`/api/admin/pages/${key}/versions/1`);
    expect(version.status()).toBe(200);
    expect((await version.json()).snapshot.tree).toEqual(saved.tree);
    const publicPage = await page.request.get(`/api/public/pages/${key}?locale=${locale}`);
    expect(publicPage.status()).toBe(200);
    expect((await publicPage.json()).tree).toEqual(saved.tree);
    const pageLayer = tree.getByRole('treeitem', {
      name: new RegExp(locale === 'vi' ? 'Trang' : 'Page'),
    });
    await tabTo(page, pageLayer);
    await page.keyboard.press('ArrowDown');
    const section = tree.getByRole('treeitem', { name: new RegExp(copy.section) });
    await expect(section).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(section).toHaveAttribute('aria-expanded', 'true');
    await expect(tree.getByRole('treeitem', { name: new RegExp(copy.paragraph) })).toBeVisible();
    await expect(tree.getByRole('treeitem', { name: new RegExp(copy.heading) })).toBeVisible();
    const reloadedHistory = page.getByRole('button', { name: copy.history });
    await reloadedHistory.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByText(copy.version, { exact: true })).toBeVisible();
  });
}
