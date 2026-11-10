import { expect, test } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { signIn } from './helpers/auth';

test('empty page composes two sections and nested components with mouse', async ({ page }) => {
  await signIn(page);
  await page.goto('/admin/builder/home');
  await expect(page.getByRole('region', { name: 'Page builder' })).toBeVisible();
  await page
    .getByRole('complementary', { name: 'Components' })
    .getByRole('button', { name: 'Section', exact: true })
    .click();
  await page
    .getByRole('complementary', { name: 'Components' })
    .getByRole('button', { name: 'Columns', exact: true })
    .click();
  await page
    .getByRole('complementary', { name: 'Components' })
    .getByRole('button', { name: 'Heading', exact: true })
    .click();
  await page
    .getByRole('complementary', { name: 'Components' })
    .getByRole('button', { name: 'Section' })
    .click();
  await expect(page.locator('[data-node-type]')).toHaveCount(7);
  await expect(page.locator('[data-node-type="column"] [data-node-type="component"]')).toHaveCount(
    1,
  );
  const tree = page.getByRole('complementary', { name: 'Layers' }).getByRole('tree');
  await tree
    .getByRole('treeitem', { name: /Heading/ })
    .dragTo(tree.getByRole('treeitem', { name: /Section/ }).nth(1));
  await expect(
    page.locator('[data-node-type="section"]').nth(1).locator('[data-node-type="component"]'),
  ).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Publish' })).toBeDisabled();
});

test('mobile sheets contain focus, restore it, and retain a full canvas', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await signIn(page);
  await page.goto('/admin/builder/home');
  const layers = page
    .getByRole('navigation', { name: 'Page builder' })
    .getByRole('button', { name: 'Layers' });
  await layers.click();
  const sheet = page.getByRole('dialog', { name: 'Layers' });
  await expect(sheet).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(sheet).toBeHidden();
  await expect(layers).toBeFocused();
  await expect(page.getByRole('button', { name: '390 px' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByRole('region', { name: 'Page canvas' })).toBeVisible();
});

test('reviewed visual matrix', async ({ page }) => {
  test.skip(process.env.D4_CAPTURE !== '1', 'Only capture during the serialized visual gate');
  test.setTimeout(360_000);
  const directory = resolve(import.meta.dirname, '../../../docs/specs/assets/cms-d4');
  mkdirSync(directory, { recursive: true });
  const captures: string[] = [];
  await signIn(page);
  for (const locale of ['en', 'vi'] as const) {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.getByRole('combobox', { name: 'Language' }).selectOption(locale);
    if (locale === 'vi') {
      await expect
        .poll(
          async () =>
            (await page.context().cookies()).find((cookie) => cookie.name === 'NEXT_LOCALE')?.value,
        )
        .toBe(locale);
    }
    await page.goto('/admin/builder/home');
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
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
      await expect(
        page.getByRole('region', { name: locale === 'vi' ? 'Trình dựng trang' : 'Page builder' }),
      ).toHaveAttribute('data-theme', theme);
      for (const width of [1440, 390] as const) {
        await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
        for (const brand of ['neutral', 'lilp'] as const) {
          await page.goto('/admin/builder/home');
          const builder = page.getByRole('region', {
            name: locale === 'vi' ? 'Trình dựng trang' : 'Page builder',
          });
          await expect(builder).toHaveAttribute('data-theme', theme);
          if (brand === 'lilp')
            await builder.getByRole('button', { name: /Switch neutral|Đổi giao diện/ }).click();
          const prefix = `${locale}-${theme}-${brand}-${width}`;
          async function capture(state: string) {
            const name = `${prefix}-${state}.png`;
            await page.screenshot({ path: resolve(directory, name), animations: 'disabled' });
            captures.push(name);
          }
          await capture('empty');
          const palette =
            width === 390
              ? page
                  .getByRole('navigation', { name: /Page builder|Trình dựng trang/ })
                  .getByRole('button', { name: locale === 'vi' ? 'Thành phần' : 'Components' })
              : null;
          if (palette) await palette.click();
          const container =
            width === 390
              ? page.getByRole('dialog', { name: locale === 'vi' ? 'Thành phần' : 'Components' })
              : page.getByRole('complementary', {
                  name: locale === 'vi' ? 'Thành phần' : 'Components',
                });
          await container
            .getByRole('button', { name: locale === 'vi' ? 'Phần' : 'Section', exact: true })
            .click();
          if (palette) await palette.click();
          const components =
            width === 390
              ? page.getByRole('dialog', { name: locale === 'vi' ? 'Thành phần' : 'Components' })
              : page.getByRole('complementary', {
                  name: locale === 'vi' ? 'Thành phần' : 'Components',
                });
          await components
            .getByRole('button', { name: locale === 'vi' ? 'Tiêu đề' : 'Heading' })
            .click();
          if (width === 390) await capture('canvas');
          else await capture('nested');
          if (width === 390) {
            await page
              .getByRole('navigation', { name: /Page builder|Trình dựng trang/ })
              .getByRole('button', { name: locale === 'vi' ? 'Lớp' : 'Layers' })
              .click();
            await capture('layers-sheet');
            await page.keyboard.press('Escape');
          }
        }
      }
    }
  }
  writeFileSync(resolve(directory, 'manifest.json'), `${JSON.stringify({ captures }, null, 2)}\n`);
});
