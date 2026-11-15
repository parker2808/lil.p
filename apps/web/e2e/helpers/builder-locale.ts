import { expect, type Page } from '@playwright/test';

export async function switchBuilderLocale(page: Page, locale: 'en' | 'vi'): Promise<void> {
  const select = async (next: 'en' | 'vi') => {
    await page.getByRole('combobox', { name: /^(Language|Ngôn ngữ)$/ }).click();
    await page.getByRole('option', { name: next === 'vi' ? 'VI' : 'EN' }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', next);
    await expect
      .poll(
        async () =>
          (await page.context().cookies()).find((cookie) => cookie.name === 'NEXT_LOCALE')?.value,
      )
      .toBe(next);
  };
  const cookie = (await page.context().cookies()).find((item) => item.name === 'NEXT_LOCALE');
  if (!cookie || cookie.value !== locale) {
    if ((await page.locator('html').getAttribute('lang')) === locale)
      await select(locale === 'vi' ? 'en' : 'vi');
    await select(locale);
  }
  await expect(page.locator('html')).toHaveAttribute('lang', locale);
  await expect
    .poll(
      async () =>
        (await page.context().cookies()).find((item) => item.name === 'NEXT_LOCALE')?.value,
    )
    .toBe(locale);
}
