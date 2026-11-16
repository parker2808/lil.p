import { expect, test } from '@playwright/test';

import { signIn } from './helpers/auth';
import { expectNoSeriousAxeIssues } from './helpers/axe';

for (const locale of ['en', 'vi'] as const) {
  test(`${locale} builder announces keyboard actions and keeps an accessible reduced-motion UI`, async ({
    page,
    context,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await signIn(page);
    await context.addCookies([
      { name: 'NEXT_LOCALE', value: locale, url: new URL(page.url()).origin, sameSite: 'Lax' },
    ]);
    const key = `v16-${locale}-${Date.now()}`;
    const created = await page.request.post('/api/admin/pages', {
      headers: { Origin: new URL(page.url()).origin },
      data: { title: `V16 ${locale}`, key, locale, template: 'starter' },
    });
    expect(created.status(), await created.text()).toBe(201);
    await page.goto(`/admin/builder/${key}`);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await page
      .getByRole('button', {
        name: locale === 'vi' ? 'Kích hoạt bản nháp cây' : 'Activate tree draft',
      })
      .click();
    const shell = page.locator('.cms-core');
    const status = shell.locator('[role="status"][aria-live="polite"]').last();
    await expect(page.getByText(locale === 'vi' ? 'Đã lưu bản nháp' : 'Draft saved')).toBeVisible();
    expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(
      true,
    );
    const animationDuration = await shell.evaluate(
      (element) => getComputedStyle(element.querySelector('button')!).transitionDuration,
    );
    expect(animationDuration.split(',').every((duration) => parseFloat(duration) <= 0.001)).toBe(
      true,
    );
    await expectNoSeriousAxeIssues(page);

    const palette = page.getByRole('complementary', {
      name: locale === 'vi' ? 'Thành phần' : 'Components',
    });
    for (const name of locale === 'vi' ? ['Phần', 'Tiêu đề'] : ['Section', 'Heading']) {
      const control = palette.getByRole('button', { name, exact: true });
      await expect(control).toHaveAccessibleName(name);
      await control.focus();
      await page.keyboard.press('Enter');
    }
    await expect(status).toContainText(locale === 'vi' ? 'Đã chọn: Tiêu đề' : 'Selected: Heading');
    const tree = page
      .getByRole('complementary', { name: locale === 'vi' ? 'Lớp' : 'Layers' })
      .getByRole('tree');
    const heading = tree.getByRole('treeitem', {
      name: locale === 'vi' ? /Tiêu đề/ : /Heading/,
    });
    await heading.focus();
    await page.keyboard.press('Space');
    await expect(status).toContainText(locale === 'vi' ? 'Đã nhấc mục' : 'Picked up item');
    await page.keyboard.press('Escape');
    await expect(status).toContainText(locale === 'vi' ? 'Hủy' : 'Cancel');
    await expect(heading).toBeFocused();
    await page.keyboard.press('Delete');
    const dialog = page.getByRole('alertdialog', {
      name: locale === 'vi' ? 'Xóa mục đã chọn?' : 'Delete selected item?',
    });
    const cancel = dialog.getByRole('button', { name: locale === 'vi' ? 'Hủy' : 'Cancel' });
    const remove = dialog.getByRole('button', { name: locale === 'vi' ? 'Xóa' : 'Delete' });
    await expect(cancel).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(remove).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(cancel).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(remove).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(cancel).toBeFocused();
    await expectNoSeriousAxeIssues(page);
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(heading).toBeFocused();
    await page.keyboard.press('Delete');
    await expect(cancel).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(remove).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(dialog).toHaveCount(0);
    await expect(status).toContainText(locale === 'vi' ? 'Đã xóa mục' : 'Item deleted');
    await expectNoSeriousAxeIssues(page);
  });

  test(`${locale} compact Properties sheet traps keyboard focus and announces its local draft state`, async ({
    page,
    context,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await signIn(page);
    await context.addCookies([
      { name: 'NEXT_LOCALE', value: locale, url: new URL(page.url()).origin, sameSite: 'Lax' },
    ]);
    await page.goto('/admin/builder/home');
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    const trigger = page
      .getByRole('navigation', { name: locale === 'vi' ? 'Trình dựng trang' : 'Page builder' })
      .getByRole('button', { name: locale === 'vi' ? 'Thuộc tính' : 'Properties' });
    await trigger.click();
    const sheet = page.getByRole('dialog', { name: locale === 'vi' ? 'Thuộc tính' : 'Properties' });
    await expect(sheet).toHaveAttribute('aria-modal', 'true');
    await expect(sheet.getByRole('status')).toHaveText(
      locale === 'vi' ? 'Bản mẫu cục bộ · chưa lưu' : 'Local study · not saved',
    );
    const buttons = sheet.locator('button:not([disabled])');
    await expect(buttons.first()).toBeFocused();
    const count = await buttons.count();
    expect(count).toBeGreaterThan(1);
    await page.keyboard.press('Shift+Tab');
    await expect(buttons.last()).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(buttons.first()).toBeFocused();
    for (let index = 1; index < count; index++) await page.keyboard.press('Tab');
    await expect(buttons.last()).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(buttons.first()).toBeFocused();
    await expectNoSeriousAxeIssues(page);
    await page.keyboard.press('Escape');
    await expect(sheet).toHaveCount(0);
    await expect(trigger).toBeFocused();
    const publish = page.getByRole('button', { name: locale === 'vi' ? 'Xuất bản' : 'Publish' });
    await expect(publish).toBeDisabled();
    await expect(publish).toHaveAttribute('aria-describedby', 'builder-publish-reason');
  });
}
