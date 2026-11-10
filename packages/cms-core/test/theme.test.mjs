import assert from 'node:assert/strict';
import { mkdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import process from 'node:process';
import { test } from 'node:test';
import { URL } from 'node:url';

import { measure } from '../../../scripts/measure-cms-core.mjs';

const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const theme = readFileSync(new URL('../dist/theme.css', import.meta.url), 'utf8');
const source = readFileSync(new URL('../src/theme/theme.css', import.meta.url), 'utf8');

function tokens(selector) {
  const start = source.indexOf(`${selector} {`);
  assert.notEqual(start, -1, `Missing ${selector}`);
  const body = source.slice(start, source.indexOf('}', start));
  return Object.fromEntries(
    [...body.matchAll(/(--builder-[\w-]+):\s*(#[\da-f]{3,8}|\d+(?:px|ms))/gi)].map(
      ([, name, value]) => [name, value],
    ),
  );
}

function luminance(hex) {
  const digits = hex.slice(1);
  const expanded =
    digits.length === 3 ? [...digits].map((digit) => digit.repeat(2)).join('') : digits;
  const rgb = expanded.match(/[\da-f]{2}/gi).map((part) => parseInt(part, 16) / 255);
  const linear = rgb.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrast(foreground, background) {
  const values = [luminance(foreground), luminance(background)].sort((left, right) => right - left);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

test('built stylesheet is exported, preserved, scoped and measured independently', () => {
  assert.equal(manifest.exports['./theme.css'], './dist/theme.css');
  assert.ok(manifest.sideEffects.includes('./dist/theme.css'));
  assert.equal(theme, source);
  assert.match(theme, /^\.cms-core\s*\{/);
  assert.doesNotMatch(theme, /@portfolio\/|next-intl|@\/modules\/|\[data-brand=/);
  const { sizes, totals } = measure();
  assert.ok(sizes.css > 0);
  assert.equal(totals.react, sizes.react + sizes['react/server']);
  assert.equal(totals.browser, sizes.contracts + sizes.engine);
});

test('actual light and dark CSS token pairs meet WCAG AA text and focus contrast', () => {
  const light = tokens('.cms-core');
  const dark = { ...light, ...tokens(".cms-core[data-theme='dark']") };
  for (const [mode, palette] of Object.entries({ light, dark })) {
    for (const surface of ['chrome', 'canvas', 'surface', 'raised']) {
      for (const foreground of ['text', 'muted', 'success', 'warning']) {
        const ratio = contrast(palette[`--builder-${foreground}`], palette[`--builder-${surface}`]);
        assert.ok(ratio >= 4.5, `${mode}: ${foreground}/${surface} is ${ratio.toFixed(2)}:1`);
      }
      for (const foreground of ['focus', 'selection', 'drop']) {
        const ratio = contrast(palette[`--builder-${foreground}`], palette[`--builder-${surface}`]);
        assert.ok(ratio >= 3, `${mode}: ${foreground}/${surface} is ${ratio.toFixed(2)}:1`);
      }
    }
    for (const [foreground, background] of [
      ['accent-text', 'accent'],
      ['accent', 'accent-soft'],
      ['drop', 'accent-soft'],
      ['art-ink', 'art'],
    ]) {
      const ratio = contrast(
        palette[`--builder-${foreground}`],
        palette[`--builder-${background}`],
      );
      assert.ok(ratio >= 4.5, `${mode}: ${foreground}/${background} is ${ratio.toFixed(2)}:1`);
    }
    for (const family of [
      'font-body',
      'font-display',
      'font-mono',
      'radius-sm',
      'radius',
      'radius-lg',
      'shadow',
      'motion-fast',
      'motion-normal',
    ]) {
      assert.match(source, new RegExp(`--builder-${family}:`));
    }
  }
});

test('core controls are reachable and focusable without a host theme', () => {
  assert.match(
    theme,
    /\.cms-core__input,\s*\.cms-core__button\s*\{[^}]*min-height:\s*44px;[^}]*min-width:\s*44px;/,
  );
  assert.match(
    theme,
    /:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--builder-focus\);[^}]*outline-offset:\s*2px;/,
  );
  assert.match(theme, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(theme, /--builder-motion-fast:\s*0ms;/);
  assert.match(theme, /\.cms-core__button:disabled,[^{]*\{[^}]*opacity:\s*1;/);
});

test(
  'browser-computed tokens, focus, targets and token-only host overrides',
  {
    skip: !process.env.CMS_THEME_BROWSER,
  },
  async () => {
    const requireWeb = createRequire(new URL('../../../apps/web/package.json', import.meta.url));
    const { chromium } = requireWeb('@playwright/test');
    const browser = await chromium.launch({ headless: true });
    try {
      for (const width of [1440, 390]) {
        for (const mode of ['light', 'dark']) {
          const page = await browser.newPage({ viewport: { width, height: 844 } });
          await page.setContent(`<main class="cms-core" data-theme="${mode}">
          <div class="cms-core__toolbar"><span class="cms-core__eyebrow">Draft</span><button class="cms-core__button">Preview</button></div>
          <div class="cms-core__canvas"><section class="cms-core__panel cms-core__panel--narrow"><h1 class="cms-core__title">A new page</h1>
          <p class="cms-core__muted">Start with a section. Everything is yours to shape.</p>
          <div class="cms-core__field"><label class="cms-core__label" for="title">Title</label>
          <input class="cms-core__input" id="title" placeholder="A clear introduction"></div>
          <p class="cms-core__status cms-core__status--success">Saved draft</p>
          <div class="cms-core__drop-target">Drop a section here</div>
          <button class="cms-core__button cms-core__button--primary">Add section</button></section></div>
        </main>`);
          await page.addStyleTag({ content: theme });
          const initial = await page.locator('.cms-core').evaluate((root) => {
            const style = globalThis.getComputedStyle(root);
            const button = root.querySelector('.cms-core__button--primary');
            const input = root.querySelector('.cms-core__input');
            return {
              text: style.getPropertyValue('--builder-text').trim(),
              surface: style.getPropertyValue('--builder-surface').trim(),
              muted: style.getPropertyValue('--builder-muted').trim(),
              accent: style.getPropertyValue('--builder-accent').trim(),
              accentText: style.getPropertyValue('--builder-accent-text').trim(),
              button: button.getBoundingClientRect().height,
              input: input.getBoundingClientRect().height,
            };
          });
          assert.ok(contrast(initial.text, initial.surface) >= 4.5);
          assert.ok(contrast(initial.muted, initial.surface) >= 4.5);
          assert.ok(contrast(initial.accentText, initial.accent) >= 4.5);
          assert.ok(initial.button >= 44 && initial.input >= 44);
          const actionGap = await page.locator('.cms-core__button--primary').evaluate((element) => {
            const target = element.previousElementSibling;
            return element.getBoundingClientRect().top - target.getBoundingClientRect().bottom;
          });
          assert.ok(actionGap >= 16, `Drop target and action touch: ${actionGap}px`);
          await page.locator('.cms-core__button--primary').focus();
          assert.equal(
            await page
              .locator('.cms-core__button--primary')
              .evaluate((element) => globalThis.getComputedStyle(element).outlineWidth),
            '2px',
          );
          await page.screenshot({ animations: 'disabled' });
          const primaryBackground = await page
            .locator('.cms-core__button--primary')
            .evaluate((element) => globalThis.getComputedStyle(element).backgroundColor);
          assert.equal(
            primaryBackground,
            mode === 'dark' ? 'rgb(152, 184, 255)' : 'rgb(37, 92, 206)',
          );
          if (process.env.CMS_THEME_SCREENSHOTS) {
            mkdirSync(process.env.CMS_THEME_SCREENSHOTS, { recursive: true });
            await page.screenshot({
              path: `${process.env.CMS_THEME_SCREENSHOTS}/neutral-${mode}-${width}.png`,
              animations: 'disabled',
            });
          }
          const hostAccent = mode === 'dark' ? '#b599f4' : '#5634a2';
          await page.addStyleTag({
            content: `.cms-core[data-brand="host"] { --builder-accent: ${hostAccent}; }`,
          });
          await page
            .locator('.cms-core')
            .evaluate((root) => root.setAttribute('data-brand', 'host'));
          const override = await page.locator('.cms-core').evaluate((root) => {
            const style = globalThis.getComputedStyle(root);
            return {
              accent: style.getPropertyValue('--builder-accent').trim(),
              text: style.getPropertyValue('--builder-text').trim(),
            };
          });
          assert.equal(override.accent, hostAccent);
          assert.equal(override.text, initial.text);
          assert.ok(contrast(initial.accentText, override.accent) >= 4.5);
          await page.emulateMedia({ reducedMotion: 'reduce' });
          assert.equal(
            await page
              .locator('.cms-core')
              .evaluate((root) =>
                globalThis.getComputedStyle(root).getPropertyValue('--builder-motion-fast').trim(),
              ),
            '0ms',
          );
          await page.close();
        }
      }
    } finally {
      await browser.close();
    }
  },
);
