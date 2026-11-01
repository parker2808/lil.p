import { expect, test } from '@playwright/test';

for (const locale of ['en', 'vi']) {
  test(`public pages in ${locale} have no unfinished text`, async ({ page }) => {
    const response = await page.request.get(`/api/public/projects?locale=${locale}&pageSize=6`);
    expect(response.ok()).toBe(true);
    const projects = (await response.json()) as { items: Array<{ slug: string }> };
    const paths = [
      '',
      '/about',
      '/projects',
      ...projects.items.slice(0, 6).map((project) => `/projects/${project.slug}`),
      '/contact',
    ];
    for (const path of paths) {
      const navigation = await page.goto(`/${locale}${path}`);
      expect(navigation?.ok(), `/${locale}${path}`).toBe(true);
      await expect(page.locator('body')).not.toContainText(/\bTODO\b|TBD/i);
    }
  });
}
