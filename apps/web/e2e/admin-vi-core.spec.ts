import { expect, test } from '@playwright/test';

import { signIn } from './helpers/auth';

test('Vietnamese login has no known English auth copy', async ({ page }) => {
  await page.goto('/admin/login');
  await page.context().addCookies([{ name: 'NEXT_LOCALE', value: 'vi', url: page.url() }]);
  await page.reload();

  await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
  await expect(page.getByRole('heading', { name: 'Đăng nhập' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Đăng nhập' })).toBeVisible();
  await expect(page.locator('body')).not.toContainText(/Sign in|Admin workspace|Checking session/);
});

test('Vietnamese dashboard, shell and lists have no known English copy', async ({ page }) => {
  await signIn(page);
  await page.getByRole('combobox', { name: 'Language' }).selectOption('vi');
  await expect(page.locator('html')).toHaveAttribute('lang', 'vi');

  const routes = [
    ['/admin', 'Bảng điều khiển', /Dashboard|Content health|Recent activity/],
    ['/admin/projects', 'Dự án', /Filter projects|New project|No projects yet/],
    ['/admin/posts', 'Bài viết', /Filter posts|New post|No posts yet/],
    ['/admin/experience', 'Kinh nghiệm', /Filter experience|New role|No experience rows yet/],
    ['/admin/education', 'Học vấn', /Filter education|New school|No education rows yet/],
    ['/admin/principles', 'Nguyên tắc', /Filter principles|New principle|No principles yet/],
    ['/admin/tags', 'Thẻ', /Filter tags|New tag|No tags yet/],
    ['/admin/domains', 'Lĩnh vực', /Filter domains|New domain|No domains yet/],
    ['/admin/process', 'Các bước quy trình', /Filter steps|New step|No process steps yet/],
    ['/admin/stats', 'Chỉ số hồ sơ', /Filter stats|New stat|No stats yet/],
    ['/admin/inbox', 'Hộp thư', /Filter messages|Latest messages|No messages yet/],
    ['/admin/users', 'Người dùng', /Filter users|New user|No users yet/],
    ['/admin/skills', 'Kỹ năng', /Filter skills|New skill|No skills yet/],
    ['/admin/pages', 'Trang', /No pages yet|Pages could not be loaded/],
    ['/admin/media', 'Thư viện', /No files yet|Media|Missing alt/],
    ['/admin/analytics', 'Phân tích', /Top pages|Top referrers|No views yet/],
    ['/admin/audit', 'Nhật ký hoạt động', /Audit log|Load more|No activity yet/],
  ] as const;

  for (const [route, heading, english] of routes) {
    await page.goto(route);
    await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
    await expect(page.locator('body')).not.toContainText(english);
    await expect(page.locator('body')).not.toContainText(/Site settings|Change password|Log out/);
  }
});
