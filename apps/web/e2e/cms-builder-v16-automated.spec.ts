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
    await expect(
      dialog.getByRole('button', { name: locale === 'vi' ? 'Hủy' : 'Cancel' }),
    ).toBeVisible();
    await expectNoSeriousAxeIssues(page);
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(heading).toBeFocused();
    await page.keyboard.press('Delete');
    await dialog.getByRole('button', { name: locale === 'vi' ? 'Xóa' : 'Delete' }).click();
    await expect(status).toContainText(locale === 'vi' ? 'Đã xóa mục' : 'Item deleted');
    await expectNoSeriousAxeIssues(page);
  });
}
