import { expect, test } from '@playwright/test';

import { signIn } from './helpers/auth';

const MISSING_ID = 999_999;

test('admin detail routes with a missing id offer retry and a link back to the list', async ({
  page,
}) => {
  await signIn(page);

  for (const [section, parent, label] of [
    ['projects', '/admin/projects', 'Projects'],
    ['posts', '/admin/posts', 'Posts'],
    ['experience', '/admin/pages/about?tab=experience', 'Experience'],
    ['inbox', '/admin/inbox', 'Inbox'],
  ] as const) {
    await page.goto(`/admin/${section}/${MISSING_ID}`);
    const alert = page.locator('main').getByRole('alert');
    await expect(alert, section).toBeVisible();
    const retry = alert.getByRole('button', { name: 'Retry' });
    await expect(retry, section).toBeVisible();
    await retry.click();
    await expect(alert, section).toBeVisible();
    await expect(alert.getByRole('link', { name: `Back to ${label}` }), section).toHaveAttribute(
      'href',
      parent,
    );
  }

  await page.locator('main').getByRole('alert').getByRole('link').click();
  await expect(page).toHaveURL(/\/admin\/inbox$/);
});
