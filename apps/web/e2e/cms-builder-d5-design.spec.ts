import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

import { signIn } from './helpers/auth';

const directory = resolve(import.meta.dirname, '../../../docs/specs/screenshots/cms-d5-design');
const checkoutSha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const event = process.env.GITHUB_EVENT_PATH
  ? (JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8')) as {
      pull_request?: { head?: { sha?: string } };
    })
  : undefined;
const sourceSha = event?.pull_request?.head?.sha ?? checkoutSha;
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
  checkedTargets: number;
  checkedFocus: number;
}> = [];

async function contrastPairs(page: Page, pairs: Record<string, [string, string]>) {
  return page.evaluate((colors) => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('Canvas color measurement unavailable');
    function pixel(color: string, name: string) {
      if (!CSS.supports('color', color)) throw new Error(`${name}: invalid color ${color}`);
      context!.clearRect(0, 0, 1, 1);
      context!.fillStyle = color;
      context!.fillRect(0, 0, 1, 1);
      return context!.getImageData(0, 0, 1, 1).data;
    }
    function luminance([red, green, blue]: Uint8ClampedArray): number {
      const channel = (value: number) => {
        const normalized = value / 255;
        return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
      };
      return channel(red!) * 0.2126 + channel(green!) * 0.7152 + channel(blue!) * 0.0722;
    }
    return Object.fromEntries(
      Object.entries(colors).map(([name, [foreground, background]]) => {
        const surface = pixel(background, name);
        if (surface[3] !== 255) throw new Error(`${name}: uncomposited surface ${background}`);
        const paint = pixel(foreground, name);
        context!.clearRect(0, 0, 1, 1);
        context!.fillStyle = background;
        context!.fillRect(0, 0, 1, 1);
        context!.fillStyle = foreground;
        context!.fillRect(0, 0, 1, 1);
        const first = luminance(context!.getImageData(0, 0, 1, 1).data);
        const second = luminance(surface);
        if (paint[3] === 0) return [name, 1];
        return [
          name,
          Math.round(((Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05)) * 100) /
            100,
        ];
      }),
    );
  }, pairs);
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
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(
    true,
  );
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
  const pairs = await contrastPairs(page, {
    textSurface: [tokens.text!, tokens.surface!],
    mutedSurface: [tokens.muted!, tokens.surface!],
    accentSoft: [tokens.accent!, tokens['accent-soft']!],
    accentButton: [tokens['accent-text']!, tokens.accent!],
    successSurface: [tokens.success!, tokens.surface!],
    selectionSurface: [tokens.selection!, tokens.surface!],
    focusSurface: [tokens.focus!, tokens.surface!],
  });
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
  const targetGeometry = await page.locator('.admin-shell').evaluate((root) => {
    function visibleRect(control: HTMLElement) {
      const rect = control.getBoundingClientRect();
      let left = Math.max(0, rect.left);
      let right = Math.min(innerWidth, rect.right);
      let top = Math.max(0, rect.top);
      let bottom = Math.min(innerHeight, rect.bottom);
      for (let parent = control.parentElement; parent; parent = parent.parentElement) {
        const style = getComputedStyle(parent);
        const bounds = parent.getBoundingClientRect();
        if (/hidden|auto|scroll|clip/.test(style.overflowX)) {
          left = Math.max(left, bounds.left);
          right = Math.min(right, bounds.right);
        }
        if (/hidden|auto|scroll|clip/.test(style.overflowY)) {
          top = Math.max(top, bounds.top);
          bottom = Math.min(bottom, bounds.bottom);
        }
      }
      return { width: Math.max(0, right - left), height: Math.max(0, bottom - top) };
    }
    const controls = Array.from(
      root.querySelectorAll<HTMLElement>(
        'button, a[href], input:not([type="hidden"]), select, textarea, [role="treeitem"], [role="button"], [role="link"], [role="menuitem"], [role="checkbox"], [role="radio"], [role="switch"], [role="tab"], [role="combobox"], [tabindex]:not([tabindex="-1"])',
      ),
    );
    const visible = controls.filter((control) => {
      const style = getComputedStyle(control);
      const rect = visibleRect(control);
      return (
        control.getClientRects().length > 0 &&
        rect.width > 0 &&
        rect.height > 0 &&
        style.visibility !== 'hidden' &&
        style.display !== 'none' &&
        !control.hasAttribute('disabled') &&
        control.getAttribute('aria-disabled') !== 'true' &&
        !control.closest('[inert], [aria-hidden="true"]')
      );
    });
    return visible.map((control) => {
      let rect = visibleRect(control);
      if (
        (rect.width < 44 || rect.height < 44) &&
        control.getBoundingClientRect().width >= 44 &&
        control.getBoundingClientRect().height >= 44
      ) {
        const ancestors: Element[] = [];
        for (let parent = control.parentElement; parent; parent = parent.parentElement)
          ancestors.push(parent);
        const scrollPositions = [document.scrollingElement, ...ancestors]
          .filter((element): element is Element =>
            Boolean(
              element &&
              (element.scrollWidth > element.clientWidth ||
                element.scrollHeight > element.clientHeight),
            ),
          )
          .map((element) => ({ element, left: element.scrollLeft, top: element.scrollTop }));
        control.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' });
        rect = visibleRect(control);
        for (const { element, left, top } of scrollPositions)
          element.scrollTo({ left, top, behavior: 'instant' });
      }
      return {
        name:
          control.getAttribute('aria-label') ??
          control.textContent?.trim().slice(0, 70) ??
          control.tagName,
        width: rect.width,
        height: rect.height,
      };
    });
  });
  expect(targetGeometry.length, `${options.state} has visible controls`).toBeGreaterThan(0);
  expect(
    targetGeometry.filter((target) => target.width < 44 || target.height < 44),
    `${options.locale}/${options.theme}/${options.brand}/${options.width}/${options.state} undersized targets`,
  ).toEqual([]);
  const overflow = await (options.sheet ? page.getByRole('dialog') : shell).evaluate(
    (element) => element.scrollWidth - element.clientWidth,
  );
  expect(
    overflow,
    `${options.locale}/${options.width}/${options.state} horizontal overflow`,
  ).toBeLessThanOrEqual(1);
  await page.keyboard.press('Tab');
  const focusIndicators = await page.locator('.admin-shell').evaluate((root) => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('Canvas focus measurement unavailable');
    function alpha(color: string) {
      if (!CSS.supports('color', color)) return 0;
      context!.clearRect(0, 0, 1, 1);
      context!.fillStyle = color;
      context!.fillRect(0, 0, 1, 1);
      return context!.getImageData(0, 0, 1, 1).data[3]!;
    }
    function paintedSurface(element: HTMLElement) {
      const ancestors: HTMLElement[] = [];
      for (let current: HTMLElement | null = element; current; current = current.parentElement)
        ancestors.unshift(current);
      context!.clearRect(0, 0, 1, 1);
      context!.fillStyle = 'white';
      context!.fillRect(0, 0, 1, 1);
      for (const ancestor of ancestors) {
        context!.fillStyle = getComputedStyle(ancestor).backgroundColor;
        context!.fillRect(0, 0, 1, 1);
      }
      const [red, green, blue] = context!.getImageData(0, 0, 1, 1).data;
      return `rgb(${red} ${green} ${blue})`;
    }
    function shadowColors(value: string) {
      return value.split(/,(?![^()]*\))/).flatMap((shadow) => {
        const color = shadow.match(
          /(?:rgba?|hsla?|oklch|oklab|lab|lch|color)\([^)]*\)|#[\da-f]{3,8}/i,
        )?.[0];
        if (!color) return [];
        const offsets = shadow
          .replace(color, '')
          .match(/-?\d+(?:\.\d+)?(?:px)?/g)
          ?.map((offset) => Number.parseFloat(offset));
        return offsets && offsets.length >= 4 && offsets[3]! >= 2 && alpha(color) > 0
          ? [color]
          : [];
      });
    }
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const controls = Array.from(
      root.querySelectorAll<HTMLElement>(
        'button, a[href], input:not([type="hidden"]), select, textarea, [role="treeitem"], [role="button"], [role="link"], [role="menuitem"], [role="checkbox"], [role="radio"], [role="switch"], [role="tab"], [role="combobox"], [tabindex]:not([tabindex="-1"])',
      ),
    );
    const results = [];
    for (const control of controls) {
      const bounds = control.getBoundingClientRect();
      const style = getComputedStyle(control);
      if (
        !bounds.width ||
        !bounds.height ||
        bounds.right <= 0 ||
        bounds.bottom <= 0 ||
        bounds.left >= innerWidth ||
        bounds.top >= innerHeight ||
        style.visibility === 'hidden' ||
        style.display === 'none' ||
        control.hasAttribute('disabled') ||
        control.getAttribute('aria-disabled') === 'true' ||
        control.closest('[inert], [aria-hidden="true"]')
      )
        continue;
      control.focus({ preventScroll: true });
      if (document.activeElement !== control) {
        results.push({
          name: control.getAttribute('aria-label') ?? control.textContent?.trim(),
          colors: [],
          surfaces: [],
          reached: false,
          visibleFocus: false,
        });
        continue;
      }
      const focused = getComputedStyle(control);
      const surfaces: string[] = [];
      for (let element: HTMLElement | null = control; element; element = element.parentElement) {
        const color = getComputedStyle(element).backgroundColor;
        if (alpha(color) > 0) surfaces.push(paintedSurface(element));
        if (surfaces.length === 2) break;
      }
      if (surfaces.length === 0) surfaces.push(paintedSurface(control));
      const outline =
        focused.outlineStyle !== 'none' &&
        Number.parseFloat(focused.outlineWidth) >= 2 &&
        alpha(focused.outlineColor) > 0
          ? focused.outlineColor
          : '';
      results.push({
        name: control.getAttribute('aria-label') ?? control.textContent?.trim().slice(0, 70),
        colors: [...(outline ? [outline] : []), ...shadowColors(focused.boxShadow)],
        surfaces,
        reached: true,
        visibleFocus: control.matches(':focus-visible'),
        diagnostic: control.className.toString().includes('brandButton')
          ? {
              outline: focused.outline,
              boxShadow: focused.boxShadow,
              focusToken: focused.getPropertyValue('--builder-focus'),
              coreMatch: control.matches('.cms-core :where(button):focus-visible'),
              rules: Array.from(document.styleSheets).flatMap((sheet) => {
                try {
                  return Array.from(sheet.cssRules).flatMap((rule) =>
                    rule instanceof CSSStyleRule &&
                    rule.selectorText.includes('focus-visible') &&
                    control.matches(rule.selectorText)
                      ? [
                          {
                            selector: rule.selectorText,
                            color: rule.style.getPropertyValue('outline-color'),
                            priority: rule.style.getPropertyPriority('outline-color'),
                          },
                        ]
                      : [],
                  );
                } catch {
                  return [];
                }
              }),
            }
          : undefined,
      });
    }
    previous?.focus({ preventScroll: true });
    return results;
  });
  expect(focusIndicators.length, `${options.state} keyboard-focusable controls`).toBeGreaterThan(0);
  const focusPairs = Object.fromEntries(
    focusIndicators.flatMap((focus, index) =>
      focus.colors.flatMap((color, colorIndex) =>
        focus.surfaces.map((surface, surfaceIndex) => [
          `${index}/${colorIndex}/${surfaceIndex}`,
          [color, surface] as [string, string],
        ]),
      ),
    ),
  );
  const focusContrast = await contrastPairs(page, focusPairs);
  for (const [index, focus] of focusIndicators.entries()) {
    expect(focus.reached, `${options.state}/${focus.name} programmatic focus`).toBe(true);
    expect(focus.visibleFocus, `${options.state}/${focus.name} keyboard-visible focus`).toBe(true);
    expect(focus.colors.length, `${options.state}/${focus.name} focus indicator`).toBeGreaterThan(
      0,
    );
    expect(focus.surfaces.length, `${options.state}/${focus.name} painted surface`).toBeGreaterThan(
      0,
    );
    expect(
      focus.colors.some((color, colorIndex) =>
        focus.surfaces.every(
          (_, surfaceIndex) => (focusContrast[`${index}/${colorIndex}/${surfaceIndex}`] ?? 0) >= 3,
        ),
      ),
      `${options.state}/${focus.name} ${JSON.stringify(focus.diagnostic)} painted focus rings ${focus.colors
        .map(
          (color, colorIndex) =>
            `${color}: ${focus.surfaces
              .map(
                (surface, surfaceIndex) =>
                  `${surface}=${focusContrast[`${index}/${colorIndex}/${surfaceIndex}`]}`,
              )
              .join(', ')}`,
        )
        .join('; ')}`,
    ).toBe(true);
  }
  if (
    options.state === 'properties' ||
    options.state === 'empty' ||
    options.state === 'field-error'
  ) {
    const breakpoints = page.getByRole('group', {
      name: options.locale === 'vi' ? 'Điểm ngắt' : 'Breakpoint',
    });
    const overflow = await breakpoints.locator('button').evaluateAll((buttons) =>
      buttons.flatMap((button) => {
        const bounds = button.getBoundingClientRect();
        const range = document.createRange();
        range.selectNodeContents(button);
        return Array.from(range.getClientRects())
          .filter(
            (text) =>
              text.left < bounds.left - 1 ||
              text.right > bounds.right + 1 ||
              text.top < bounds.top - 1 ||
              text.bottom > bounds.bottom + 1,
          )
          .map(() => button.textContent?.trim());
      }),
    );
    expect(await breakpoints.locator('button').count()).toBe(4);
    expect(
      overflow,
      `${options.locale}/${options.theme}/${options.width} breakpoint overflow`,
    ).toEqual([]);
  }
  const file = `${options.locale}-${options.theme}-${options.brand}-${options.width}-${options.state}.png`;
  const image = await page.screenshot({ path: join(directory, file), animations: 'disabled' });
  await test.info().attach(file, { body: image, contentType: 'image/png' });
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
    checkedTargets: targetGeometry.length,
    checkedFocus: focusIndicators.length,
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

async function assertTabReachability(page: Page) {
  const expected = await page.locator('.admin-shell').evaluate((root) => {
    const controls = Array.from(
      root.querySelectorAll<HTMLElement>('button, a[href], input, select, textarea, [tabindex]'),
    ).filter((control) => {
      const style = getComputedStyle(control);
      const rect = control.getBoundingClientRect();
      return (
        control.tabIndex >= 0 &&
        !control.matches(':disabled') &&
        !control.closest('[inert], [aria-hidden="true"]') &&
        style.visibility !== 'hidden' &&
        style.display !== 'none' &&
        rect.width > 0 &&
        rect.height > 0 &&
        rect.right > 0 &&
        rect.bottom > 0 &&
        rect.left < innerWidth &&
        rect.top < innerHeight
      );
    });
    return controls.map((control, index) => {
      control.dataset.auditTab = String(index);
      return (
        control.getAttribute('aria-label') ??
        control.textContent?.trim().slice(0, 70) ??
        String(index)
      );
    });
  });
  expect(expected.length).toBeGreaterThan(0);
  const count = await page.locator('button, a[href], input, select, textarea, [tabindex]').count();
  await page.evaluate(() => {
    document.body.tabIndex = -1;
    document.body.focus();
  });
  const visited = new Set<number>();
  try {
    for (let index = 0; index < count + 2 && visited.size < expected.length; index++) {
      await page.keyboard.press('Tab');
      const active = await page.evaluate(() =>
        document.activeElement instanceof HTMLElement
          ? document.activeElement.dataset.auditTab
          : undefined,
      );
      if (active !== undefined) visited.add(Number(active));
    }
    expect(
      expected.filter((_, index) => !visited.has(index)),
      'Visible, enabled builder controls unreachable by Tab',
    ).toEqual([]);
  } finally {
    await page.evaluate(() => {
      document
        .querySelectorAll('[data-audit-tab]')
        .forEach((element) => element.removeAttribute('data-audit-tab'));
      document.body.removeAttribute('tabindex');
    });
  }
}

test.setTimeout(600_000);

test('active builder supports a keyboard-only nested edit, history and focus journey', async ({
  page,
}) => {
  await signIn(page);
  const { key } = await createActivePage(page, 'en');
  await page.emulateMedia({ reducedMotion: 'reduce' });
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
  await page.setViewportSize({ width: 1440, height: 900 });
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
  await assertTabReachability(page);
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
    await page.evaluate(() => document.documentElement.classList.remove('dark'));
    await expect(
      page.getByText(
        locale === 'vi'
          ? 'Thành phần này không có thuộc tính chỉnh sửa.'
          : 'This component has no editable properties.',
      ),
    ).toBeVisible();
    await page.setViewportSize({ width: 390, height: 900 });
    const emptyTrigger = page
      .getByRole('navigation', {
        name: locale === 'vi' ? 'Trình dựng trang' : 'Page builder',
      })
      .getByRole('button', { name: locale === 'vi' ? 'Thuộc tính' : 'Properties' });
    await emptyTrigger.click();
    await expect(
      page
        .getByRole('dialog', { name: locale === 'vi' ? 'Thuộc tính' : 'Properties' })
        .getByText(
          locale === 'vi'
            ? 'Thành phần này không có thuộc tính chỉnh sửa.'
            : 'This component has no editable properties.',
        ),
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(emptyTrigger).toBeFocused();
    for (const theme of ['light', 'dark'] as const) {
      await page.evaluate(
        (value) => document.documentElement.classList.toggle('dark', value === 'dark'),
        theme,
      );
      for (const brand of ['neutral', 'lilp'] as const) {
        if ((await shell.getAttribute('data-brand')) !== brand)
          await shell
            .getByRole('button', {
              name: /Switch neutral and lil\.p theme|Đổi giao diện lõi và lil\.p/,
            })
            .click();
        for (const width of [1440, 768, 390]) {
          await page.setViewportSize({ width, height: 900 });
          if (width <= 1100) {
            const trigger = page
              .getByRole('navigation', {
                name: locale === 'vi' ? 'Trình dựng trang' : 'Page builder',
              })
              .getByRole('button', { name: locale === 'vi' ? 'Thuộc tính' : 'Properties' });
            await trigger.click();
            await capture(page, { key, locale, theme, brand, width, state: 'empty', sheet: true });
            await page.keyboard.press('Escape');
            await expect(trigger).toBeFocused();
          } else await capture(page, { key, locale, theme, brand, width, state: 'empty' });
        }
      }
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.evaluate(() => document.documentElement.classList.remove('dark'));
    if ((await shell.getAttribute('data-brand')) !== 'neutral')
      await shell
        .getByRole('button', {
          name: /Switch neutral and lil\.p theme|Đổi giao diện lõi và lil\.p/,
        })
        .click();
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
          const focusTarget =
            width <= 1100
              ? page
                  .getByRole('navigation', {
                    name: locale === 'vi' ? 'Trình dựng trang' : 'Page builder',
                  })
                  .getByRole('button', { name: locale === 'vi' ? 'Thuộc tính' : 'Properties' })
              : page
                  .getByRole('complementary', {
                    name: locale === 'vi' ? 'Thuộc tính' : 'Properties',
                  })
                  .getByRole('spinbutton', {
                    name: locale === 'vi' ? 'Cấp tiêu đề' : 'Heading level',
                  });
          await page.keyboard.press('Tab');
          await focusTarget.focus();
          await expect(focusTarget).toBeFocused();
          await capture(page, { ...options, state: 'keyboard-focus', input: 'keyboard' });
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
              if (state === 'properties') {
                const field = page.getByRole('dialog', { name }).getByRole('spinbutton', {
                  name: locale === 'vi' ? 'Cấp tiêu đề' : 'Heading level',
                });
                await field.fill('99');
                await expect(field).toHaveAttribute('aria-invalid', 'true');
                await capture(page, { ...options, state: 'field-error', sheet: true });
                await field.fill('2');
                await expect(field).toHaveAttribute('aria-invalid', 'false');
              }
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
            const field = page
              .getByRole('complementary', {
                name: locale === 'vi' ? 'Thuộc tính' : 'Properties',
              })
              .getByRole('spinbutton', {
                name: locale === 'vi' ? 'Cấp tiêu đề' : 'Heading level',
              });
            await field.fill('99');
            await expect(field).toHaveAttribute('aria-invalid', 'true');
            await capture(page, { ...options, state: 'field-error' });
            await field.fill('2');
            await expect(field).toHaveAttribute('aria-invalid', 'false');
          }
        }
      }
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.evaluate(() => document.documentElement.classList.remove('dark'));
    if ((await shell.getAttribute('data-brand')) !== 'neutral')
      await shell
        .getByRole('button', {
          name: /(?:Switch neutral and lil\.p theme|Đổi giao diện lõi và lil\.p)/,
        })
        .click();
    const invalidField = page
      .getByRole('complementary', {
        name: locale === 'vi' ? 'Thuộc tính' : 'Properties',
      })
      .getByRole('spinbutton', { name: locale === 'vi' ? 'Cấp tiêu đề' : 'Heading level' });
    await invalidField.fill('99');
    await expect(invalidField).toHaveAttribute('aria-invalid', 'true');
    await capture(page, {
      key,
      locale,
      theme: 'light',
      brand: 'neutral',
      width: 1440,
      state: 'field-error',
    });
    await page.setViewportSize({ width: 390, height: 900 });
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await shell
      .getByRole('button', {
        name: /(?:Switch neutral and lil\.p theme|Đổi giao diện lõi và lil\.p)/,
      })
      .click();
    const errorTrigger = page
      .getByRole('navigation', {
        name: locale === 'vi' ? 'Trình dựng trang' : 'Page builder',
      })
      .getByRole('button', { name: locale === 'vi' ? 'Thuộc tính' : 'Properties' });
    await errorTrigger.click();
    await expect(
      page
        .getByRole('dialog', {
          name: locale === 'vi' ? 'Thuộc tính' : 'Properties',
        })
        .getByRole('spinbutton', { name: locale === 'vi' ? 'Cấp tiêu đề' : 'Heading level' }),
    ).toHaveAttribute('aria-invalid', 'true');
    await capture(page, {
      key,
      locale,
      theme: 'dark',
      brand: 'lilp',
      width: 390,
      state: 'field-error',
      sheet: true,
    });
    await page.keyboard.press('Escape');
    await expect(errorTrigger).toBeFocused();
    await page.setViewportSize({ width: 1440, height: 900 });
    let releaseSave: (() => void) | undefined;
    const heldSave = new Promise<void>((resolveSave) => {
      releaseSave = resolveSave;
    });
    const draftRoute = `**/admin/pages/${key}/builder/draft`;
    await page.route(draftRoute, async (route) => {
      if (route.request().method() === 'PUT') await heldSave;
      await route.continue();
    });
    try {
      await palette
        .getByRole('button', { name: locale === 'vi' ? 'Đoạn văn' : 'Paragraph', exact: true })
        .click();
      await expect(
        page.getByText(locale === 'vi' ? 'Đang lưu bản nháp' : 'Saving draft'),
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
            await capture(page, { key, locale, theme, brand, width, state: 'saving' });
          }
        }
      }
    } finally {
      releaseSave?.();
    }
    await expect(page.getByText(locale === 'vi' ? 'Đã lưu bản nháp' : 'Draft saved')).toBeVisible({
      timeout: 15_000,
    });
    await page.unroute(draftRoute);
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
  const evidence = { sourceSha, checkoutSha, browser: 'Chromium', lock: 'lilp-e2e.lock', entries };
  const serialized = `${JSON.stringify(evidence, null, 2)}\n`;
  await writeFile(join(directory, 'manifest.json'), serialized);
  await test.info().attach('cms-d5-design-manifest.json', {
    body: Buffer.from(serialized),
    contentType: 'application/json',
  });
  await writeFile(
    join(directory, 'manifest.sha256'),
    `${createHash('sha256').update(serialized).digest('hex')}  manifest.json\n`,
  );
  await test.info().attach('cms-d5-design-manifest.sha256', {
    body: Buffer.from(`${createHash('sha256').update(serialized).digest('hex')}  manifest.json\n`),
    contentType: 'text/plain',
  });
});
