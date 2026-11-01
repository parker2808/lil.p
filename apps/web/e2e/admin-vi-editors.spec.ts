import { expect, test } from '@playwright/test';

import { signIn } from './helpers/auth';

test('Vietnamese editors, page builder and site settings use translated controls', async ({
  page,
}) => {
  test.setTimeout(120_000);
  await signIn(page);
  await page.getByRole('combobox', { name: 'Language' }).selectOption('vi');

  const routes = [
    [
      '/admin/projects/new',
      'Dự án chưa có tiêu đề',
      /Untitled project|Card and facts|Add metric|Choose file/,
    ],
    [
      '/admin/posts/new',
      'Bài viết chưa có tiêu đề',
      /Untitled post|Takeaways|Add tags|Choose file/,
    ],
    [
      '/admin/experience/new',
      'Vai trò chưa có tiêu đề',
      /Untitled role|Employment type|Company URL|Highlights/,
    ],
    ['/admin/pages/home', 'Thêm khối', /Add block|Live preview|Unpublished changes|Block actions/],
    ['/admin/profile', 'Hồ sơ', /Headline preview|Private phone|Resume \(English\)/],
    ['/admin/site', 'Trang web', /Site settings|Navigation|Contact intro \(EN\)|Choose file/],
  ] as const;

  for (const [route, translated, english] of routes) {
    await page.goto(route);
    await expect(page.locator('html'), route).toHaveAttribute('lang', 'vi');
    await expect(page.getByText(translated, { exact: true }).first(), route).toBeVisible();
    await expect(page.locator('body'), route).not.toContainText(english);
  }
});

test('Vietnamese about forms and experience dates have no English or ISO date copy', async ({
  page,
}) => {
  test.setTimeout(120_000);
  await signIn(page);
  await page.getByRole('combobox', { name: 'Language' }).selectOption('vi');

  await page.goto('/admin/experience');
  await expect(page.getByRole('heading', { name: 'Kinh nghiệm' })).toBeVisible();
  const dates = page.locator('tbody tr td').filter({ hasText: /\d{2}\/\d{4}/ });
  await expect(dates.first()).toBeVisible();
  await expect(dates.first()).toContainText(/\d{2}\/\d{4}/);
  await expect(page.locator('tbody')).not.toContainText(/\d{4}-\d{2}-\d{2}/);

  for (const [route, create, title, english] of [
    ['/admin/education', 'Trường mới', 'Học vấn mới', /New school|Save|Start date/],
    ['/admin/principles', 'Nguyên tắc mới', 'Nguyên tắc mới', /New principle|Save|Icon/],
    ['/admin/process', 'Bước mới', 'Bước mới', /New step|Save|Icon/],
    ['/admin/stats', 'Chỉ số mới', 'Chỉ số mới', /New stat|Save|Source/],
  ] as const) {
    await page.goto(route);
    await page.getByRole('button', { name: create }).click();
    await expect(page.getByRole('dialog').getByText(title, { exact: true })).toBeVisible();
    await expect(page.getByRole('dialog')).not.toContainText(english);
  }
});
