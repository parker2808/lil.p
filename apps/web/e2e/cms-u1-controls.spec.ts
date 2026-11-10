import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator } from '@playwright/test';

import { signIn } from './helpers/auth';

async function expectTouchTarget(control: Locator) {
  const box = await control.boundingBox();
  expect(box?.width).toBeGreaterThanOrEqual(44);
  expect(box?.height).toBeGreaterThanOrEqual(44);
}

test('contact and admin controls keep localized names, keyboard choices and AA contrast', async ({
  page,
}) => {
  test.setTimeout(240_000);
  let authenticated = false;
  for (const locale of ['en', 'vi'] as const) {
    for (const theme of ['light', 'dark'] as const) {
      for (const width of [1440, 390] as const) {
        await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
        await page.goto(`/${locale}/contact`);
        await page.evaluate((value) => localStorage.setItem('theme', value), theme);
        await page.reload();
        const topic = page.getByRole('combobox', { name: locale === 'en' ? 'Topic' : 'Chủ đề' });
        await expect(topic).toBeVisible();
        await expectTouchTarget(topic);
        await topic.click();
        await expect(page.getByRole('option').first()).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(topic).toBeFocused();
        const contrast = await new AxeBuilder({ page })
          .include('#topic')
          .withTags(['wcag2aa', 'wcag21aa', 'wcag22aa'])
          .analyze();
        expect(
          contrast.violations.filter((violation) => violation.id === 'color-contrast'),
        ).toEqual([]);

        if (!authenticated) {
          await signIn(page);
          authenticated = true;
        }
        await page
          .context()
          .addCookies([{ name: 'NEXT_LOCALE', value: locale, url: new URL(page.url()).origin }]);
        await page.goto('/admin/audit');
        const entity = page.getByRole('combobox', {
          name: locale === 'en' ? 'Entity' : 'Đối tượng',
        });
        await expectTouchTarget(entity);
        await entity.click();
        await page.keyboard.press('Escape');
        await expect(entity).toBeFocused();
      }
    }
  }
});

test('block surface radios support keyboard-only selection', async ({ page }) => {
  await signIn(page);
  await page.goto('/admin/pages/home');
  await page
    .locator('[data-slot="block-row"]')
    .first()
    .getByRole('button', { name: /hero/i })
    .click();
  await page.getByRole('tab', { name: 'Appearance' }).click();
  const group = page.getByRole('radiogroup', { name: 'Surface' });
  const plain = group.getByRole('radio', { name: 'Plain' });
  const band = group.getByRole('radio', { name: 'Band' });
  const wasBand = await band.isChecked();
  const original = wasBand ? band : plain;
  const next = wasBand ? plain : band;
  const patches: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('/api/admin/pages/home/blocks/') && request.method() === 'PATCH') {
      patches.push(request.url());
    }
  });
  await original.focus();
  await expect(original).toBeFocused();
  await expect(original).toBeChecked();
  await next.focus();
  await expect(original).toBeChecked();
  await page.waitForTimeout(50);
  expect(patches).toHaveLength(0);
  await original.focus();
  const updated = page.waitForResponse(
    (response) =>
      response.url().includes('/api/admin/pages/home/blocks/') &&
      response.request().method() === 'PATCH',
  );
  await original.press('ArrowRight');
  const response = await updated;
  expect(response.status(), await response.text()).toBe(200);
  await expect(next).toBeChecked();
  const block = (await response.json()) as { id: number; updatedAt: string };
  const reset = await page.request.patch(`/api/admin/pages/home/blocks/${block.id}`, {
    headers: { Origin: new URL(page.url()).origin },
    data: { surface: wasBand ? 'BAND' : 'PLAIN', updatedAt: block.updatedAt },
  });
  expect(reset.ok(), await reset.text()).toBe(true);
  await page.reload();
  await page
    .locator('[data-slot="block-row"]')
    .first()
    .getByRole('button', { name: /hero/i })
    .click();
  await page.getByRole('tab', { name: 'Appearance' }).click();
  await expect(original).toBeChecked();
  await expectTouchTarget(page.getByRole('switch').first());
  await page.goto('/admin/projects');
  await expectTouchTarget(page.getByRole('checkbox').first());
});

test('radio Tab entry and programmatic focus leave empty and selected groups unchanged', async ({
  page,
}) => {
  await page.goto('/en/r3-loading-test/radio');
  const empty = page.getByRole('radiogroup', { name: 'Empty choice' });
  await page.getByRole('button', { name: 'Before empty' }).focus();
  await page.keyboard.press('Tab');
  await expect(empty.getByRole('radio', { name: 'One' })).toBeFocused();
  await expect(page.getByTestId('empty-value')).toBeEmpty();
  await empty.getByRole('radio', { name: 'Two' }).focus();
  await expect(page.getByTestId('empty-value')).toBeEmpty();
  await page.keyboard.press('Space');
  await expect(page.getByTestId('empty-value')).toHaveText('two');

  const selected = page.getByRole('radiogroup', { name: 'Selected choice' });
  await page.getByRole('button', { name: 'Before selected' }).focus();
  await page.keyboard.press('Tab');
  await expect(selected.getByRole('radio', { name: 'Two' })).toBeFocused();
  await selected.getByRole('radio', { name: 'One' }).focus();
  await expect(page.getByTestId('selected-value')).toHaveText('two');
});
