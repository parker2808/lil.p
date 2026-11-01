import { expect, test } from '@playwright/test';

import { expectNoSeriousAxeIssues } from './helpers/axe';

const copy = {
  en: {
    cta: "Let's work together?",
    action: 'Get in touch',
    sitemap: 'Sitemap',
    updated: /Last updated/,
  },
  vi: {
    cta: 'Cùng làm việc nhé?',
    action: 'Liên hệ với tôi',
    sitemap: 'Sơ đồ trang',
    updated: /Cập nhật lần cuối/,
  },
} as const;

for (const width of [375, 1280]) {
  for (const locale of ['en', 'vi'] as const) {
    test(`/${locale} footer at ${width}px: CTA, sitemap, ⌘K hint, date and locale switch`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/${locale}`);
      const footer = page.getByRole('contentinfo');
      await footer.scrollIntoViewIfNeeded();

      await expect(footer.getByRole('heading', { name: copy[locale].cta })).toBeVisible();
      await expect(footer.getByRole('link', { name: copy[locale].action })).toHaveAttribute(
        'href',
        `/${locale}/contact`,
      );

      const sitemap = footer.getByRole('navigation', { name: copy[locale].sitemap });
      const links = sitemap.getByRole('link');
      expect(await links.count()).toBeGreaterThanOrEqual(2);
      for (const link of await links.all()) {
        await expect(link).toBeVisible();
        await expect(link).toHaveAttribute('href', new RegExp(`^/${locale}(/|$)`));
      }

      const hint = footer.locator('.footer-hint');
      await expect(hint).toBeVisible();
      await expect(hint.locator('kbd')).toHaveText('⌘K');

      const updated = footer.locator('.footer-bottom p');
      await expect(updated).toContainText(copy[locale].updated);
      await expect(updated.locator('time')).toHaveAttribute('datetime', /^\d{4}-\d{2}-\d{2}T/);
      await expect(footer.getByRole('link', { name: 'VI', exact: true })).toBeVisible();
      await expect(footer.getByRole('link', { name: 'EN', exact: true })).toBeVisible();

      const columns = await footer
        .locator('.footer-grid > *')
        .evaluateAll((elements) =>
          elements.map((element) => Math.round(element.getBoundingClientRect().left)),
        );
      expect(columns).toHaveLength(3);
      expect(new Set(columns).size).toBe(width < 768 ? 1 : 3);

      await expectNoSeriousAxeIssues(page);
    });
  }
}
