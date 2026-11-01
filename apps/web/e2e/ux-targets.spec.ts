import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 375, height: 667 }, hasTouch: true, isMobile: true });

const routes = [
  '',
  '/projects',
  '/projects/particula',
  '/notes',
  '/notes/vue-to-react',
  '/about',
  '/contact',
];

for (const locale of ['en', 'vi']) {
  for (const route of routes) {
    test(`${locale}${route || '/'} has 24px visible tap targets`, async ({ page }) => {
      await page.goto(`/${locale}${route}`);
      await expect(page.locator('main')).toBeVisible();

      if (route === '/projects/particula') {
        await expect(
          page.getByRole('link', { name: locale === 'vi' ? 'Tất cả dự án' : 'All case studies' }),
        ).toBeVisible();
        await expect(
          page.getByText(locale === 'vi' ? /^(Trước|Sau)$/ : /^(Previous|Next)$/).first(),
        ).toBeVisible();
      }

      const undersized = await page.locator('a, button').evaluateAll((elements) =>
        elements.flatMap((element) => {
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          if (
            style.display === 'none' ||
            style.display === 'inline' ||
            style.visibility !== 'visible' ||
            rect.width === 0 ||
            rect.height === 0 ||
            (rect.width <= 1 && rect.height <= 1) ||
            element.closest('[aria-hidden="true"], [inert]')
          ) {
            return [];
          }
          if (rect.width >= 24 && rect.height >= 24) return [];
          return [
            {
              tag: element.tagName.toLowerCase(),
              text: element.textContent?.trim().slice(0, 48),
              href: element.getAttribute('href'),
              width: Math.round(rect.width),
              height: Math.round(rect.height),
            },
          ];
        }),
      );

      expect(undersized).toEqual([]);
    });
  }
}
