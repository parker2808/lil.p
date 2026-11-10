import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const output = process.env.CMS_U3_CAPTURE_DIR;
const followupOutput = process.env.CMS_U3_FOLLOWUP_DIR;
const evidenceDir = process.env.CMS_U3_EVIDENCE_DIR;
const evidence = new Set([
  'empty-desktop-en-light-neutral-1440.png',
  'empty-mobile-vi-dark-lilp-390.png',
  'nested-desktop-en-light-neutral-1440.png',
  'nested-mobile-vi-dark-lilp-390.png',
  'overrides-tablet-en-dark-neutral-1440.png',
  'overrides-mobile-vi-light-lilp-390.png',
  'sheet-components-mobile-en-light-neutral-390.png',
  'sheet-layers-mobile-en-light-neutral-390.png',
]);

function contrastRatio(foreground: string, background: string) {
  const luminance = (color: string) => {
    const channels = color
      .match(/[\d.]+/g)
      ?.slice(0, 3)
      .map(Number);
    if (channels?.length !== 3) throw new Error(`Unexpected color: ${color}`);
    const [red, green, blue] = channels.map((channel) => {
      const value = channel / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return red! * 0.2126 + green! * 0.7152 + blue! * 0.0722;
  };
  const values = [luminance(foreground), luminance(background)].sort((left, right) => right - left);
  return (values[0]! + 0.05) / (values[1]! + 0.05);
}

test('U3 search contrast and Layers guides cover desktop and mobile tokens', async ({ page }) => {
  for (const theme of ['light', 'dark']) {
    for (const brand of ['neutral', 'lilp']) {
      for (const width of [1440, 390]) {
        await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
        const query = new URLSearchParams({
          scene: 'nested',
          device: width === 390 ? 'mobile' : 'desktop',
          theme,
          brand,
        });
        await page.goto(`/en/cms-u3-study?${query}`);
        if (width === 390) await page.getByRole('button', { name: 'Components' }).click();
        const root = width === 390 ? 'dialog' : 'aside';
        const palette = await page
          .locator(root)
          .locator('input[type="search"]')
          .evaluate((input) => ({
            foreground: getComputedStyle(input, '::placeholder').color,
            opacity: getComputedStyle(input, '::placeholder').opacity,
            background: getComputedStyle(input).backgroundColor,
          }));
        expect(palette.opacity, `${theme}/${brand}/${width} placeholder opacity`).toBe('1');
        expect(
          contrastRatio(palette.foreground, palette.background),
          `${theme}/${brand}/${width} placeholder contrast`,
        ).toBeGreaterThanOrEqual(4.5);
        if (width === 390) {
          await page.getByRole('button', { name: 'Close panel' }).click();
          await page.getByRole('button', { name: 'Layers' }).click();
        }
        const guides = await page
          .locator(root)
          .getByRole('treeitem')
          .evaluateAll((nodes) =>
            nodes.map((node) => ({
              depth: Number((node as HTMLElement).dataset.depth),
              indent: parseFloat(getComputedStyle(node).paddingInlineStart),
              guide: getComputedStyle(node, '::before').borderInlineStartWidth,
            })),
          );
        for (const node of guides) {
          expect(node.indent, `${theme}/${brand}/${width} depth ${node.depth}`).toBe(
            12 + 20 * node.depth,
          );
          if (node.depth > 0) expect(parseFloat(node.guide)).toBeGreaterThanOrEqual(1);
        }
      }
    }
  }
});

test('U3 follow-up palette and Layers screenshots', async ({ page }) => {
  test.skip(!followupOutput, 'Opt-in affected screenshot review');
  test.setTimeout(300_000);
  await mkdir(followupOutput!, { recursive: true });
  if (evidenceDir) await mkdir(evidenceDir, { recursive: true });
  const captures: { file: string; sha256: string }[] = [];
  for (const locale of ['en', 'vi']) {
    for (const theme of ['light', 'dark']) {
      for (const brand of ['neutral', 'lilp']) {
        for (const width of [1440, 390]) {
          await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
          const query = new URLSearchParams({
            scene: 'nested',
            device: width === 390 ? 'mobile' : 'desktop',
            theme,
            brand,
          });
          await page.goto(`/${locale}/cms-u3-study?${query}`);
          const panels = width === 390 ? ['components', 'layers'] : ['desktop'];
          for (const panel of panels) {
            if (width === 390) {
              await page
                .getByRole('button', {
                  exact: true,
                  name:
                    panel === 'layers'
                      ? locale === 'en'
                        ? 'Layers'
                        : 'Lớp'
                      : locale === 'en'
                        ? 'Components'
                        : 'Thành phần',
                })
                .click();
              await expect(page.getByRole('dialog')).toBeVisible();
            } else {
              await expect(page.locator('aside').getByRole('treeitem').last()).toBeVisible();
            }
            const file =
              width === 390
                ? `sheet-${panel}-mobile-${locale}-${theme}-${brand}-390.png`
                : `nested-desktop-${locale}-${theme}-${brand}-1440.png`;
            const bytes = await page.screenshot({
              path: join(followupOutput!, file),
              fullPage: width === 1440,
              animations: 'disabled',
            });
            captures.push({ file, sha256: createHash('sha256').update(bytes).digest('hex') });
            if (evidenceDir) await writeFile(join(evidenceDir, file), bytes);
            if (width === 390)
              await page
                .getByRole('button', { name: locale === 'en' ? 'Close panel' : 'Đóng bảng' })
                .click();
          }
        }
      }
    }
  }
  await writeFile(join(followupOutput!, 'manifest.json'), JSON.stringify(captures, null, 2));
  expect(captures).toHaveLength(24);
});

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
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(844);
  await page.getByRole('button', { name: 'Components' }).click();
  const sheet = page.getByRole('dialog', { name: 'Components' });
  await expect(sheet).toBeVisible();
  await expect(sheet.getByRole('button', { name: 'Section' })).toBeVisible();
  await expect(sheet.getByRole('button', { name: 'Spacer' })).toBeVisible();
  await expect(sheet.getByRole('button', { name: 'Button' })).toBeVisible();
  await expect(sheet.getByRole('button', { name: 'Spacer' })).toHaveAttribute(
    'aria-disabled',
    'true',
  );
  await expect(sheet.getByText('Add a section first').first()).toBeVisible();
  const sheetAccessibility = await new AxeBuilder({ page }).include('dialog').analyze();
  expect(
    sheetAccessibility.violations.map(({ id, nodes }) => ({ id, count: nodes.length })),
  ).toEqual([]);
  await sheet.getByRole('searchbox', { name: 'Search components' }).fill('divider');
  await expect(sheet.getByRole('button', { name: 'Divider' })).toBeVisible();
  await expect(sheet.getByRole('button', { name: 'Heading' })).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(sheet).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Components' })).toBeFocused();
  await page.getByRole('button', { name: 'Layers' }).click();
  const layers = page.getByRole('dialog', { name: 'Layers' });
  await expect(layers.getByRole('tree', { name: 'Layers' })).toBeVisible();
  await layers.getByRole('treeitem', { name: 'New page' }).focus();
  await page.keyboard.press('ArrowDown');
  await expect(layers.getByRole('treeitem', { name: 'New page' })).toBeFocused();
  await page.keyboard.press('Escape');
  const accessibility = await new AxeBuilder({ page }).include('main#content').analyze();
  expect(accessibility.violations.map(({ id, nodes }) => ({ id, count: nodes.length }))).toEqual(
    [],
  );
  await page.getByRole('button', { name: 'Properties', exact: true }).click();
  await page
    .getByRole('dialog', { name: 'Properties' })
    .getByRole('navigation', { name: 'Status sample' })
    .getByRole('link', { name: 'Conflict' })
    .click();
  await page.getByRole('button', { name: 'Properties', exact: true }).click();
  await expect(page.getByRole('dialog').getByText('Your unsaved changes are kept.')).toBeVisible();
  await expect(page.getByRole('dialog').getByRole('link', { name: 'Retry' })).toBeVisible();
  await expect(
    page.getByRole('dialog').getByRole('link', { name: 'Review changes' }),
  ).toBeVisible();
  await page
    .getByRole('dialog')
    .getByRole('navigation', { name: 'Status sample' })
    .getByRole('link', { name: 'Undo' })
    .click();
  await expect(page.getByRole('status').getByText('Change undone')).toBeVisible();
});

test('U3 narrow viewport defaults to mobile preview and exposes an outline sheet', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/en/cms-u3-study?scene=nested');
  await expect(page.locator('[data-device="mobile"]')).toBeVisible();
  await expect(page.getByText('390 px · design width · scaled')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(844);
  await page.getByRole('button', { name: 'Layers' }).click();
  const sheet = page.getByRole('dialog', { name: 'Layers' });
  await sheet.getByRole('treeitem', { name: 'New page' }).focus();
  await page.keyboard.press('ArrowDown');
  await expect(sheet.getByRole('treeitem', { name: 'Hero section' })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(sheet.getByRole('treeitem', { name: 'Heading', exact: true })).toBeFocused();
  await page.keyboard.press('Alt+ArrowDown');
  await expect(sheet.getByText('Static design sample — no content changes')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Layers' })).toBeFocused();
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
            : [width === 390 ? 'mobile' : 'desktop']) {
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
  for (const locale of ['en', 'vi']) {
    for (const theme of ['light', 'dark']) {
      for (const brand of ['neutral', 'lilp']) {
        await page.setViewportSize({ width: 390, height: 844 });
        const query = new URLSearchParams({ scene: 'nested', device: 'mobile', theme, brand });
        await page.goto(`/${locale}/cms-u3-study?${query}`);
        await page
          .locator('nav')
          .getByRole('button', { name: locale === 'en' ? 'Properties' : 'Thuộc tính' })
          .click();
        const file = `sheet-properties-mobile-${locale}-${theme}-${brand}-390.png`;
        const bytes = await page.screenshot({ path: join(output!, file), animations: 'disabled' });
        captures.push({ file, sha256: createHash('sha256').update(bytes).digest('hex') });
        if (evidenceDir) await writeFile(join(evidenceDir, file), bytes);
        if (locale === 'en' && theme === 'light' && brand === 'neutral') {
          await page.getByRole('button', { name: 'Close panel' }).click();
          for (const panel of ['Components', 'Layers']) {
            await page.getByRole('button', { name: panel }).click();
            const panelFile = `sheet-${panel.toLowerCase()}-mobile-en-light-neutral-390.png`;
            const panelBytes = await page.screenshot({
              path: join(output!, panelFile),
              animations: 'disabled',
            });
            captures.push({
              file: panelFile,
              sha256: createHash('sha256').update(panelBytes).digest('hex'),
            });
            if (evidenceDir) await writeFile(join(evidenceDir, panelFile), panelBytes);
            await page.getByRole('button', { name: 'Close panel' }).click();
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
      device: variant.width === 390 ? 'mobile' : 'desktop',
      status: variant.status,
      theme: variant.theme,
      brand: variant.brand,
    });
    const file = `status-${variant.status}-${variant.width === 390 ? 'mobile-' : ''}${variant.locale}-${variant.theme}-${variant.brand}-${variant.width}.png`;
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
