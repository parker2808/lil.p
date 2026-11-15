import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

import AxeBuilder from '@axe-core/playwright';
import { expect, type BrowserContext, type Page, type TestInfo } from '@playwright/test';

const checkoutSha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const sourceHead = process.env.E2E_SOURCE_HEAD_SHA ?? checkoutSha;

export async function captureEditorHostVisuals(
  page: Page,
  context: BrowserContext,
  testInfo: TestInfo,
  key: string,
  componentType: string,
  hostId: string,
  revision: string,
): Promise<void> {
  const entries: Array<{
    locale: 'en' | 'vi';
    theme: 'light' | 'dark';
    width: 390 | 1440;
    surface: 'canvas' | 'properties-sheet';
    file: string;
    screenshotSha256: string;
    axe: Array<{ id: string; impact: string | null; targets: string[] }>;
  }> = [];
  await page.emulateMedia({ reducedMotion: 'reduce' });

  for (const locale of ['en', 'vi'] as const) {
    await context.addCookies([
      { name: 'NEXT_LOCALE', value: locale, url: new URL(page.url()).origin, sameSite: 'Lax' },
    ]);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/admin/builder/${key}`);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    const hostNode = page.locator(
      `[data-node-type="component"] button[data-canvas-id="${hostId}"]`,
    );
    await expect(hostNode).toHaveCount(1);
    await hostNode.click();

    for (const theme of ['light', 'dark'] as const) {
      await page.evaluate(
        (dark) => document.documentElement.classList.toggle('dark', dark),
        theme === 'dark',
      );
      await expect(page.locator('.cms-core')).toHaveAttribute('data-theme', theme);
      for (const width of [1440, 390] as const) {
        await page.setViewportSize({ width, height: 900 });
        await expect(hostNode).toHaveCount(1);
        const screenshot = await page.screenshot({ fullPage: true, animations: 'disabled' });
        const file = `${componentType}-${locale}-${theme}-${width}.png`;
        await testInfo.attach(file, { body: screenshot, contentType: 'image/png' });
        const result = await new AxeBuilder({ page })
          .include('.cms-core')
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
          .analyze();
        entries.push({
          locale,
          theme,
          width,
          surface: 'canvas',
          file,
          screenshotSha256: createHash('sha256').update(screenshot).digest('hex'),
          axe: result.violations.map((violation) => ({
            id: violation.id,
            impact: violation.impact ?? null,
            targets: violation.nodes.map((node) => JSON.stringify(node.target)),
          })),
        });
        if (width === 390) {
          const properties = locale === 'vi' ? 'Thuộc tính' : 'Properties';
          await page
            .getByRole('navigation', {
              name: locale === 'vi' ? 'Trình dựng trang' : 'Page builder',
            })
            .getByRole('button', { name: properties })
            .click();
          const sheet = page.getByRole('dialog', { name: properties });
          await expect(sheet).toBeVisible();
          const hostField = sheet.locator(`[id^="builder-field-${hostId}-base-"]`).first();
          await expect(hostField).toBeVisible();
          await hostField.scrollIntoViewIfNeeded();
          const sheetScreenshot = await page.screenshot({ fullPage: true, animations: 'disabled' });
          const sheetFile = `${componentType}-${locale}-${theme}-390-properties.png`;
          await testInfo.attach(sheetFile, { body: sheetScreenshot, contentType: 'image/png' });
          const sheetResult = await new AxeBuilder({ page })
            .include('[role="dialog"]')
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
            .analyze();
          entries.push({
            locale,
            theme,
            width,
            surface: 'properties-sheet',
            file: sheetFile,
            screenshotSha256: createHash('sha256').update(sheetScreenshot).digest('hex'),
            axe: sheetResult.violations.map((violation) => ({
              id: violation.id,
              impact: violation.impact ?? null,
              targets: violation.nodes.map((node) => JSON.stringify(node.target)),
            })),
          });
          await sheet.press('Escape');
          await expect(sheet).toHaveCount(0);
        }
      }
    }
  }

  await testInfo.attach(`${componentType}-manifest.json`, {
    body: Buffer.from(
      JSON.stringify(
        {
          sourceHead,
          checkoutSha,
          ciRunId: process.env.GITHUB_RUN_ID ?? null,
          route: `/admin/builder/${key}`,
          componentType,
          draftRevision: revision,
          captureStage: 'after-real-editor-autosave-before-publish',
          entries,
        },
        null,
        2,
      ),
    ),
    contentType: 'application/json',
  });
  expect(entries.filter((entry) => entry.surface === 'canvas')).toHaveLength(8);
  expect(entries.filter((entry) => entry.surface === 'properties-sheet')).toHaveLength(4);
  expect(
    entries.flatMap((entry) =>
      entry.axe
        .filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))
        .map((violation) => `${entry.file}: ${violation.id} (${violation.impact})`),
    ),
  ).toEqual([]);
  await page.setViewportSize({ width: 1440, height: 900 });
}
