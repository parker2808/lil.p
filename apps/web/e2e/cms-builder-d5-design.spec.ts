import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

import { signIn } from './helpers/auth';

const directory = resolve(import.meta.dirname, '../../../docs/specs/screenshots/cms-d5-design');
const sourceSha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const entries: Array<{
  route: string;
  pageLocale: 'en' | 'vi';
  uiLocale: 'en' | 'vi';
  theme: 'light' | 'dark';
  brand: 'neutral' | 'lilp';
  width: number;
  state: string;
  input: 'keyboard' | 'pointer';
  file: string;
  axe: { serious: number; critical: number; other: number };
  contrast: Record<string, number>;
}> = [];

function contrast(foreground: string, background: string): number {
  function luminance(color: string): number {
    const hex = color.replace('#', '');
    const channels = (
      hex.length === 3 ? hex.split('').map((value) => value.repeat(2)) : (hex.match(/.{2}/g) ?? [])
    )
      .map((value) => Number.parseInt(value, 16) / 255)
      .map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
    return channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722;
  }
  const first = luminance(foreground);
  const second = luminance(background);
  return (
    Math.round(((Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05)) * 100) / 100
  );
}

async function capture(
  page: Page,
  options: {
    key: string;
    locale: 'en' | 'vi';
    theme: 'light' | 'dark';
    brand: 'neutral' | 'lilp';
    width: number;
    state: string;
    input?: 'keyboard' | 'pointer';
    sheet?: boolean;
  },
) {
  const shell = page.locator('.cms-core');
  await expect(shell).toHaveAttribute('data-theme', options.theme);
  await expect(shell).toHaveAttribute('data-brand', options.brand);
  await page.evaluate(async () => {
    await Promise.all(
      document
        .getAnimations()
        .filter((animation) => animation instanceof CSSTransition)
        .map((animation) => animation.finished.catch(() => undefined)),
    );
  });
  const audit = new AxeBuilder({ page })
    .include(options.sheet ? '[role="dialog"]' : '.cms-core')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']);
  const violations = (await audit.analyze()).violations;
  const serious = violations.filter((item) => item.impact === 'serious').length;
  const critical = violations.filter((item) => item.impact === 'critical').length;
  expect(
    violations.filter((item) => item.impact === 'serious' || item.impact === 'critical'),
  ).toEqual([]);
  const tokens = await shell.evaluate((element) => {
    const style = getComputedStyle(element);
    return Object.fromEntries(
      [
        'surface',
        'text',
        'muted',
        'accent',
        'accent-text',
        'accent-soft',
        'success',
        'selection',
        'focus',
      ].map((name) => [name, style.getPropertyValue(`--builder-${name}`).trim()]),
    );
  });
  const pairs = {
    textSurface: contrast(tokens.text!, tokens.surface!),
    mutedSurface: contrast(tokens.muted!, tokens.surface!),
    accentSoft: contrast(tokens.accent!, tokens['accent-soft']!),
    accentButton: contrast(tokens['accent-text']!, tokens.accent!),
    successSurface: contrast(tokens.success!, tokens.surface!),
    selectionSurface: contrast(tokens.selection!, tokens.surface!),
    focusSurface: contrast(tokens.focus!, tokens.surface!),
  };
  for (const name of [
    'textSurface',
    'mutedSurface',
    'accentSoft',
    'accentButton',
    'successSurface',
  ] as const)
    expect(pairs[name], `${options.theme}/${options.brand}/${name}`).toBeGreaterThanOrEqual(4.5);
  for (const name of ['selectionSurface', 'focusSurface'] as const)
    expect(pairs[name], `${options.theme}/${options.brand}/${name}`).toBeGreaterThanOrEqual(3);
  const file = `${options.locale}-${options.theme}-${options.brand}-${options.width}-${options.state}.png`;
  await page.screenshot({ path: join(directory, file), animations: 'disabled' });
  entries.push({
    route: `/admin/builder/${options.key}`,
    pageLocale: options.locale,
    uiLocale: options.locale,
    theme: options.theme,
    brand: options.brand,
    width: options.width,
    state: options.state,
    input: options.input ?? 'pointer',
    file,
    axe: { serious, critical, other: violations.length - serious - critical },
    contrast: pairs,
  });
}

async function createActivePage(page: Page, locale: 'en' | 'vi') {
  const key = `d5-design-${locale}-${Date.now()}`;
  const origin = new URL(page.url()).origin;
  const response = await page.request.post('/api/admin/pages', {
    headers: { Origin: origin },
    data: { title: 'D5 design evidence', key, locale, template: 'starter' },
  });
  expect(response.status(), await response.text()).toBe(201);
  await page.goto(`/admin/builder/${key}`);
  await page
    .getByRole('button', {
      name: locale === 'vi' ? 'Kích hoạt bản nháp cây' : 'Activate tree draft',
    })
    .click();
  await expect(page.getByText(locale === 'vi' ? 'Đã lưu bản nháp' : 'Draft saved')).toBeVisible();
  return { key, origin };
}

test.setTimeout(600_000);

test('active builder supports a keyboard-only nested edit, history and focus journey', async ({
  page,
}) => {
  await signIn(page);
  const { key } = await createActivePage(page, 'en');
  await mkdir(directory, { recursive: true });
  const palette = page.getByRole('complementary', { name: 'Components' });
  for (const name of ['Section', 'Columns', 'Heading']) {
    await palette.getByRole('button', { name, exact: true }).focus();
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
  await capture(page, {
    key,
    locale: 'en',
    theme: 'light',
    brand: 'neutral',
    width: 1440,
    state: 'keyboard-focus',
    input: 'keyboard',
  });
  await page.keyboard.press('Delete');
  const confirm = page.getByRole('alertdialog').getByRole('button', { name: 'Delete' });
  await confirm.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('status')).toContainText('Item deleted');
  await expect(tree.getByRole('treeitem', { name: /^Column / }).last()).toBeFocused();
  await expect(page.locator('[data-node-type="component"]')).toHaveCount(0);
  await page.keyboard.press('Control+z');
  await expect(page.locator('[data-node-type="component"]')).toHaveCount(1);
  await page.keyboard.press('Control+Shift+z');
  await expect(page.locator('[data-node-type="component"]')).toHaveCount(0);
  await page.setViewportSize({ width: 768, height: 900 });
  const trigger = page
    .getByRole('navigation', { name: 'Page builder' })
    .getByRole('button', { name: 'Properties' });
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog', { name: 'Properties' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
});

test('EN/VI core and token-only lil.p builder states are visually and accessibly evidenced', async ({
  page,
  context,
}) => {
  await signIn(page);
  await mkdir(directory, { recursive: true });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const locale of ['en', 'vi'] as const) {
    await context.addCookies([
      { name: 'NEXT_LOCALE', value: locale, url: new URL(page.url()).origin, sameSite: 'Lax' },
    ]);
    await page.setViewportSize({ width: 1440, height: 900 });
    const { key, origin } = await createActivePage(page, locale);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    const shell = page.locator('.cms-core');
    const palette = page.getByRole('complementary', {
      name: locale === 'vi' ? 'Thành phần' : 'Components',
    });
    await palette
      .getByRole('button', { name: locale === 'vi' ? 'Phần' : 'Section', exact: true })
      .click();
    await palette
      .getByRole('button', { name: locale === 'vi' ? 'Tiêu đề' : 'Heading', exact: true })
      .click();
    await expect(page.getByText(locale === 'vi' ? 'Đã lưu bản nháp' : 'Draft saved')).toBeVisible({
      timeout: 15_000,
    });
    for (const theme of ['light', 'dark'] as const) {
      await page.evaluate(
        (value) => document.documentElement.classList.toggle('dark', value === 'dark'),
        theme,
      );
      for (const brand of ['neutral', 'lilp'] as const) {
        if (brand === 'lilp')
          await shell
            .getByRole('button', {
              name: /(?:Switch neutral and lil\.p theme|Đổi giao diện lõi và lil\.p)/,
            })
            .click();
        else if ((await shell.getAttribute('data-brand')) === 'lilp')
          await shell
            .getByRole('button', {
              name: /(?:Switch neutral and lil\.p theme|Đổi giao diện lõi và lil\.p)/,
            })
            .click();
        for (const width of [1440, 768, 390]) {
          await page.setViewportSize({ width, height: 900 });
          const options = { key, locale, theme, brand, width };
          await capture(page, { ...options, state: 'canvas-saved' });
          if (width <= 1100) {
            const navigation = page.getByRole('navigation', {
              name: locale === 'vi' ? 'Trình dựng trang' : 'Page builder',
            });
            for (const [state, name] of [
              ['palette', locale === 'vi' ? 'Thành phần' : 'Components'],
              ['layers', locale === 'vi' ? 'Lớp' : 'Layers'],
              ['properties', locale === 'vi' ? 'Thuộc tính' : 'Properties'],
            ] as const) {
              const trigger = navigation.getByRole('button', { name });
              await trigger.click();
              await capture(page, { ...options, state, sheet: true });
              await page.keyboard.press('Escape');
              await expect(trigger).toBeFocused();
            }
          } else {
            await expect(
              page.getByRole('complementary', {
                name: locale === 'vi' ? 'Thuộc tính' : 'Properties',
              }),
            ).toBeVisible();
            await expect(
              page.getByRole('complementary', { name: locale === 'vi' ? 'Lớp' : 'Layers' }),
            ).toBeVisible();
          }
        }
      }
    }
    const remote = await (await page.request.get(`/api/admin/pages/${key}/builder/draft`)).json();
    remote.tree.root.sections[0].content[0].responsive.base.text = `Concurrent ${locale} heading`;
    const concurrent = await page.request.put(`/api/admin/pages/${key}/builder/draft`, {
      headers: { Origin: origin },
      data: { tree: remote.tree, expectedRevision: remote.revision },
    });
    expect(concurrent.ok(), await concurrent.text()).toBeTruthy();
    await page.setViewportSize({ width: 1440, height: 900 });
    await palette
      .getByRole('button', { name: locale === 'vi' ? 'Đường kẻ' : 'Divider', exact: true })
      .click();
    await expect(
      page.getByText(
        locale === 'vi'
          ? 'Xung đột · thay đổi của bạn được giữ cục bộ'
          : 'Conflict · your edits are kept locally',
      ),
    ).toBeVisible({ timeout: 15_000 });
    for (const theme of ['light', 'dark'] as const) {
      await page.evaluate(
        (value) => document.documentElement.classList.toggle('dark', value === 'dark'),
        theme,
      );
      for (const brand of ['neutral', 'lilp'] as const) {
        if ((await shell.getAttribute('data-brand')) !== brand)
          await shell
            .getByRole('button', {
              name: /(?:Switch neutral and lil\.p theme|Đổi giao diện lõi và lil\.p)/,
            })
            .click();
        for (const width of [1440, 768, 390]) {
          await page.setViewportSize({ width, height: 900 });
          await capture(page, { key, locale, theme, brand, width, state: 'conflict' });
          await expect(
            page.getByRole('button', { name: locale === 'vi' ? 'Thử lại' : 'Retry' }),
          ).toBeVisible();
        }
      }
    }
  }
  const evidence = { sourceSha, browser: 'Chromium', lock: 'lilp-e2e.lock', entries };
  const serialized = `${JSON.stringify(evidence, null, 2)}\n`;
  await writeFile(join(directory, 'manifest.json'), serialized);
  await writeFile(
    join(directory, 'manifest.sha256'),
    `${createHash('sha256').update(serialized).digest('hex')}  manifest.json\n`,
  );
});
