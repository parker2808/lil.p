import { expect, type Page } from '@playwright/test';

export async function switchBuilderLocale(page: Page, locale: 'en' | 'vi'): Promise<void> {
  await page.getByRole('combobox', { name: /^(Language|Ngôn ngữ)$/ }).click();
  await page.getByRole('option', { name: locale === 'vi' ? 'VI' : 'EN' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', locale);
  await expect
    .poll(
      async () =>
        (await page.context().cookies()).find((cookie) => cookie.name === 'NEXT_LOCALE')?.value,
    )
    .toBe(locale);
}
