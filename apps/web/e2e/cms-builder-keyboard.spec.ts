import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { signIn } from './helpers/auth';

test('keyboard navigation, pickup, reorder and cancellation preserve selection', async ({
  page,
}) => {
  await signIn(page);
  await page.goto('/admin/builder/home');
  const components = page.getByRole('complementary', { name: 'Components' });
  await components.getByRole('button', { name: 'Section', exact: true }).click();
  await components.getByRole('button', { name: 'Heading', exact: true }).click();
  const layers = page.getByRole('complementary', { name: 'Layers' });
  const tree = layers.getByRole('tree');
  await tree.getByRole('treeitem', { name: /Page/ }).focus();
  await page.keyboard.press('ArrowDown');
  await expect(tree.getByRole('treeitem', { name: /Section/ })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(tree.getByRole('treeitem', { name: /Heading/ })).toBeFocused();
  await page.keyboard.press('Space');
  await expect(page.getByRole('status')).toContainText('Picked up');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Escape');
  await expect(tree.getByRole('treeitem', { name: /Heading/ })).toBeFocused();
});

test('keyboard-only insertion and nested placement identifies the destination', async ({
  page,
}) => {
  await signIn(page);
  await page.goto('/admin/builder/home');
  const components = page.getByRole('complementary', { name: 'Components' });
  for (const name of ['Section', 'Columns', 'Heading']) {
    const button = components.getByRole('button', { name, exact: true });
    await button.focus();
    await page.keyboard.press('Enter');
  }
  const tree = page.getByRole('complementary', { name: 'Layers' }).getByRole('tree');
  await tree.getByRole('treeitem', { name: /Heading/ }).focus();
  await page.keyboard.press('Space');
  await expect(page.getByRole('status')).toContainText('position 1');
  await page.keyboard.press('ArrowUp');
  await expect(page.getByRole('status')).toContainText('Column 2 · position 1');
  await page.keyboard.press('Enter');
  await expect(
    page.locator('[data-node-type="column"]').nth(1).locator('[data-node-type="component"]'),
  ).toHaveCount(1);
  await expect(tree.getByRole('treeitem', { name: /Heading/ })).toBeFocused();
});

test('builder chrome and mobile sheets pass WCAG AA checks', async ({ page }) => {
  test.setTimeout(120_000);
  await signIn(page);
  for (const locale of ['en', 'vi'] as const) {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.getByRole('combobox', { name: 'Language' }).selectOption(locale);
    if (locale === 'vi')
      await expect
        .poll(
          async () =>
            (await page.context().cookies()).find((cookie) => cookie.name === 'NEXT_LOCALE')?.value,
        )
        .toBe(locale);
    await page.goto('/admin/builder/home');
    for (const theme of ['light', 'dark'] as const) {
      await page.setViewportSize({ width: 1440, height: 900 });
      if (
        !(await page
          .locator('html')
          .evaluate((element, name) => element.classList.contains(name), theme))
      )
        await page
          .getByRole('button', {
            name: locale === 'vi' ? 'Đổi giao diện' : 'Toggle theme',
            exact: true,
          })
          .click();
      await expect(page.locator('html')).toHaveClass(new RegExp(theme));
      for (const width of [1440, 390]) {
        await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
        await page.goto('/admin/builder/home');
        await expect(
          page.getByRole('region', { name: locale === 'vi' ? 'Trình dựng trang' : 'Page builder' }),
        ).toHaveAttribute('data-theme', theme);
        const result = await new AxeBuilder({ page })
          .include('.cms-core')
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
          .analyze();
        expect(result.violations, JSON.stringify(result.violations, null, 2)).toEqual([]);
        if (width === 390) {
          await page
            .getByRole('navigation', {
              name: locale === 'vi' ? 'Trình dựng trang' : 'Page builder',
            })
            .getByRole('button', { name: locale === 'vi' ? 'Lớp' : 'Layers' })
            .click();
          const sheet = await new AxeBuilder({ page })
            .include('[role="dialog"]')
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
            .analyze();
          expect(sheet.violations, JSON.stringify(sheet.violations, null, 2)).toEqual([]);
          await page.keyboard.press('Escape');
        }
      }
    }
  }
});
