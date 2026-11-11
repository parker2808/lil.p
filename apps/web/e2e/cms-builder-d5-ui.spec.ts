import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { signIn } from './helpers/auth';

const captures = resolve(import.meta.dirname, '../../../docs/specs/screenshots/cms-d5-ui');
const manifest: Array<{
  locale: string;
  theme: string;
  width: number;
  state: string;
  file: string;
}> = [];

test.setTimeout(240_000);

test('custom page edits autosave, reload, undo and review conflict without losing local changes', async ({
  page,
  context,
}) => {
  await signIn(page);
  const key = `d5-${Date.now()}`;
  const origin = new URL(page.url()).origin;
  const created = await page.request.post('/api/admin/pages', {
    headers: { Origin: origin },
    data: { title: 'D5 builder', key, locale: 'en', template: 'starter' },
  });
  expect(created.status(), await created.text()).toBe(201);
  await page.goto(`/admin/builder/${key}`);
  await expect(page.getByText('Local study · activate to save')).toBeVisible();
  await page.getByRole('button', { name: 'Activate tree draft' }).click();
  await expect(page.getByText('Draft saved')).toBeVisible();
  const palette = page.getByRole('complementary', { name: 'Components' });
  await palette.getByRole('button', { name: 'Section', exact: true }).click();
  await palette.getByRole('button', { name: 'Heading', exact: true }).click();
  const inspector = page.getByRole('complementary', { name: 'Properties' });
  await inspector.getByRole('textbox', { name: 'Text' }).fill('Saved builder heading');
  await expect
    .poll(async () => {
      const response = await page.request.get(`/api/admin/pages/${key}/builder/draft`);
      return JSON.stringify((await response.json()).tree).includes('Saved builder heading');
    })
    .toBe(true);
  await expect(page.getByText('Draft saved')).toBeVisible({ timeout: 15_000 });
  await page.reload();
  await expect(inspector.getByRole('textbox', { name: 'Text' })).not.toBeVisible();
  await page.getByRole('treeitem', { name: /Section/ }).focus();
  await page.keyboard.press('ArrowRight');
  await page.getByRole('treeitem', { name: /Heading/ }).click();
  await expect(inspector.getByRole('textbox', { name: 'Text' })).toHaveValue(
    'Saved builder heading',
  );
  await palette.getByRole('button', { name: 'Paragraph', exact: true }).click();
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(page.locator('[data-node-type="component"]')).toHaveCount(1);
  await page.keyboard.press('Control+Shift+z');
  await expect(page.locator('[data-node-type="component"]')).toHaveCount(2);
  await expect
    .poll(async () => {
      const response = await page.request.get(`/api/admin/pages/${key}/builder/draft`);
      return (await response.json()).tree.root.sections[0].content.length;
    })
    .toBe(2);
  await expect(page.getByText('Draft saved')).toBeVisible({ timeout: 15_000 });

  const remote = await (await page.request.get(`/api/admin/pages/${key}/builder/draft`)).json();
  remote.tree.root.sections[0].content[0].responsive.base.text = 'Concurrent heading';
  const concurrent = await page.request.put(`/api/admin/pages/${key}/builder/draft`, {
    headers: { Origin: origin },
    data: { tree: remote.tree, expectedRevision: remote.revision },
  });
  expect(concurrent.ok(), await concurrent.text()).toBeTruthy();
  await palette.getByRole('button', { name: 'Divider', exact: true }).click();
  await expect(page.getByText('Conflict · your edits are kept locally')).toBeVisible({
    timeout: 15_000,
  });
  expect(
    (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
      .violations,
  ).toEqual([]);
  await expect(page.locator('[data-node-type="component"]')).toHaveCount(3);
  await page.getByRole('button', { name: 'Review changes' }).click();
  await expect(
    page
      .getByRole('region', { name: 'Review changes' })
      .getByRole('button', { name: 'Export local draft' }),
  ).toBeVisible();
  await page
    .getByRole('region', { name: 'Review changes' })
    .getByRole('button', { name: 'Retry' })
    .click();
  await expect(page.locator('[data-node-type="component"]')).toHaveCount(3);
  await expect(
    page.locator('header').getByText('Conflict · your edits are kept locally'),
  ).toBeVisible();
  await page
    .getByRole('region', { name: 'Review changes' })
    .getByRole('button', { name: 'Discard local edits and reload server draft' })
    .click();
  await context.setOffline(true);
  await palette.getByRole('button', { name: 'Spacer', exact: true }).click();
  await expect(page.getByText('Offline · your edits are kept locally')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Retry' }).first()).toBeVisible({
    timeout: 15_000,
  });
  expect(
    (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
      .violations,
  ).toEqual([]);
  await context.setOffline(false);
  await page.getByRole('button', { name: 'Retry' }).first().click();
  await expect(page.getByText('Draft saved')).toBeVisible({ timeout: 15_000 });
});

test('offline edits remain recoverable; EN/VI light/dark responsive chrome is accessible', async ({
  page,
  context,
}) => {
  await signIn(page);
  await mkdir(captures, { recursive: true });
  for (const locale of ['en', 'vi'] as const) {
    await context.addCookies([
      { name: 'NEXT_LOCALE', value: locale, url: new URL(page.url()).origin, sameSite: 'Lax' },
    ]);
    for (const theme of ['light', 'dark'])
      for (const width of [1440, 768, 390]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto('/admin/builder/home');
        await page.evaluate((value) => localStorage.setItem('theme', value), theme);
        await page.reload();
        await expect(
          page.getByText(locale === 'en' ? 'Local study · not saved' : 'Bản mẫu cục bộ · chưa lưu'),
        ).toBeVisible();
        const mobile = width <= 1100;
        if (mobile)
          await page
            .getByRole('navigation', {
              name: locale === 'en' ? 'Page builder' : 'Trình dựng trang',
            })
            .getByRole('button', { name: locale === 'en' ? 'Components' : 'Thành phần' })
            .click();
        const palette = mobile
          ? page.getByRole('dialog', { name: locale === 'en' ? 'Components' : 'Thành phần' })
          : page.getByRole('complementary', {
              name: locale === 'en' ? 'Components' : 'Thành phần',
            });
        await palette
          .getByRole('button', { name: locale === 'en' ? 'Section' : 'Phần', exact: true })
          .click();
        if (mobile)
          await page
            .getByRole('navigation', {
              name: locale === 'en' ? 'Page builder' : 'Trình dựng trang',
            })
            .getByRole('button', { name: locale === 'en' ? 'Components' : 'Thành phần' })
            .click();
        await (
          mobile
            ? page.getByRole('dialog', { name: locale === 'en' ? 'Components' : 'Thành phần' })
            : palette
        )
          .getByRole('button', { name: locale === 'en' ? 'Heading' : 'Tiêu đề', exact: true })
          .click();
        if (mobile)
          await page
            .getByRole('navigation', {
              name: locale === 'en' ? 'Page builder' : 'Trình dựng trang',
            })
            .getByRole('button', { name: locale === 'en' ? 'Properties' : 'Thuộc tính' })
            .click();
        const panel = mobile
          ? page.getByRole('dialog', { name: locale === 'en' ? 'Properties' : 'Thuộc tính' })
          : page.getByRole('complementary', {
              name: locale === 'en' ? 'Properties' : 'Thuộc tính',
            });
        if (mobile)
          await expect(panel.getByRole('status')).toHaveText(
            locale === 'en' ? 'Local study · not saved' : 'Bản mẫu cục bộ · chưa lưu',
          );
        await panel.getByRole('button', { name: locale === 'en' ? 'Mobile' : 'Di động' }).click();
        await panel.evaluate(async (element) => {
          await Promise.all(
            Array.from(element.querySelectorAll('button'))
              .flatMap((button) => button.getAnimations())
              .map((animation) => animation.finished),
          );
        });
        const buttons = await panel.getByRole('button').all();
        for (const button of buttons) {
          const box = await button.boundingBox();
          if (box) {
            expect(box.width).toBeGreaterThanOrEqual(44);
            expect(box.height).toBeGreaterThanOrEqual(44);
          }
        }
        const audit = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']);
        const violations = await (mobile ? audit.include('[role="dialog"]') : audit).analyze();
        expect(violations.violations).toEqual([]);
        const file = `${locale}-${theme}-${width}-properties.png`;
        await page.screenshot({ path: join(captures, file), animations: 'disabled' });
        manifest.push({ locale, theme, width, state: 'properties', file });
      }
  }
  await writeFile(join(captures, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
});
