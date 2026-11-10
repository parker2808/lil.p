import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const output = process.env.CMS_U3_CAPTURE_DIR;
const evidenceDir = process.env.CMS_U3_EVIDENCE_DIR;
const evidence = new Set([
  'empty-desktop-en-light-neutral-1440.png',
  'empty-desktop-vi-dark-lilp-390.png',
  'nested-desktop-en-light-neutral-1440.png',
  'nested-desktop-vi-dark-lilp-390.png',
  'overrides-tablet-en-dark-neutral-1440.png',
  'overrides-mobile-vi-light-lilp-390.png',
]);

test('U3 study is gated and has named sample navigation', async ({ page }) => {
  await page.goto('/en/cms-u3-study');
  await expect(page.getByRole('heading', { name: 'A page with room to breathe' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Sample page' })).toBeVisible();
  await page
    .getByRole('navigation', { name: 'Sample page' })
    .getByRole('link', { name: 'Empty' })
    .click();
  await expect(page.getByRole('heading', { name: 'Your page starts here.' }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Nothing selected yet' })).toBeVisible();
  await page.getByRole('navigation', { name: 'Token set' }).getByRole('link').click();
  await expect(page.locator('main#content')).toHaveAttribute('data-brand', 'lilp');
  await page.getByRole('navigation', { name: 'Theme' }).getByRole('link').click();
  await expect(page.locator('main#content')).toHaveAttribute('data-theme', 'dark');
  await page
    .getByRole('navigation', { name: 'Preview size' })
    .getByRole('link', { name: 'Mobile' })
    .click();
  await expect(page.locator('[data-device="mobile"]')).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  for (const name of ['Desktop', 'Tablet', 'Mobile']) {
    const box = await page
      .getByRole('navigation', { name: 'Preview size' })
      .getByRole('link', { name })
      .boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
  await page
    .getByRole('navigation', { name: 'Sample page' })
    .getByRole('link', { name: 'Empty' })
    .focus();
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('navigation', { name: 'Sample page' }).getByRole('link', { name: 'Nested' }),
  ).toBeFocused();
  const accessibility = await new AxeBuilder({ page }).include('main#content').analyze();
  expect(accessibility.violations.map(({ id, nodes }) => ({ id, count: nodes.length }))).toEqual(
    [],
  );
  await page
    .getByRole('navigation', { name: 'Status sample' })
    .getByRole('link', { name: 'Conflict' })
    .click();
  await expect(page.getByText('Could not save changes').last()).toBeVisible();
  await page
    .getByRole('navigation', { name: 'Status sample' })
    .getByRole('link', { name: 'Undo' })
    .click();
  await expect(page.getByRole('status').getByText('Change undone')).toBeVisible();
});

test('U3 review matrix screenshots', async ({ page }) => {
  test.skip(!output, 'Opt-in screenshot review outside the repository');
  test.setTimeout(600_000);
  await mkdir(output!, { recursive: true });
  if (evidenceDir) await mkdir(evidenceDir, { recursive: true });
  const captures: { file: string; sha256: string }[] = [];
  for (const locale of ['en', 'vi']) {
    for (const theme of ['light', 'dark']) {
      for (const width of [1440, 390]) {
        await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
        for (const scene of ['empty', 'nested', 'overrides']) {
          for (const device of scene === 'overrides'
            ? ['desktop', 'tablet', 'mobile']
            : ['desktop']) {
            for (const brand of ['neutral', 'lilp']) {
              const query = new URLSearchParams({ scene, device, theme, brand });
              await page.goto(`/${locale}/cms-u3-study?${query}`);
              await expect(page.locator('main#content')).toHaveAttribute('data-theme', theme);
              await expect(page.locator('main#content')).toHaveAttribute('data-brand', brand);
              const file = `${scene}-${device}-${locale}-${theme}-${brand}-${width}.png`;
              const bytes = await page.screenshot({
                path: join(output!, file),
                fullPage: true,
                animations: 'disabled',
              });
              captures.push({ file, sha256: createHash('sha256').update(bytes).digest('hex') });
              if (evidenceDir && evidence.has(file))
                await writeFile(join(evidenceDir, file), bytes);
              const overflow = await page.evaluate(
                () => document.documentElement.scrollWidth > window.innerWidth,
              );
              expect(overflow, file).toBe(false);
            }
          }
        }
      }
    }
  }
  for (const variant of [
    { status: 'conflict', locale: 'en', theme: 'dark', brand: 'neutral', width: 1440 },
    { status: 'undone', locale: 'vi', theme: 'light', brand: 'lilp', width: 390 },
  ]) {
    await page.setViewportSize({ width: variant.width, height: variant.width === 390 ? 844 : 900 });
    const query = new URLSearchParams({
      scene: 'nested',
      device: 'desktop',
      status: variant.status,
      theme: variant.theme,
      brand: variant.brand,
    });
    const file = `status-${variant.status}-${variant.locale}-${variant.theme}-${variant.brand}-${variant.width}.png`;
    await page.goto(`/${variant.locale}/cms-u3-study?${query}`);
    const bytes = await page.screenshot({
      path: join(output!, file),
      fullPage: true,
      animations: 'disabled',
    });
    captures.push({ file, sha256: createHash('sha256').update(bytes).digest('hex') });
    if (evidenceDir) await writeFile(join(evidenceDir, file), bytes);
  }
  await writeFile(join(output!, 'manifest.json'), JSON.stringify(captures, null, 2));
});
