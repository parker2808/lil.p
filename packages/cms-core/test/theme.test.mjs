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
  const digits = hex.startsWith('#') ? hex.slice(1) : null;
  const expanded =
    digits?.length === 3 ? [...digits].map((digit) => digit.repeat(2)).join('') : digits;
  const rgb = expanded
    ? expanded.match(/[\da-f]{2}/gi).map((part) => parseInt(part, 16) / 255)
    : hex
        .match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*1)?\)$/)
        ?.slice(1)
        .map((part) => Number(part) / 255);
  assert.equal(rgb?.length, 3, `Unsupported computed color ${hex}`);
  const linear = rgb.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrast(foreground, background) {
  const values = [luminance(foreground), luminance(background)].sort((left, right) => right - left);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

const surfaces = ['chrome', 'canvas', 'surface', 'raised'];
const feedback = ['success', 'warning', 'danger', 'info'];
const indicators = ['focus', 'selection', 'drop'];
const specialPairs = [
  ['accent-text', 'accent'],
  ['accent', 'accent-soft'],
  ['drop', 'accent-soft'],
  ['art-ink', 'art'],
];
const pairsPerMode = surfaces.length * (2 + feedback.length * 2 + indicators.length) + 4;

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
    for (const surface of surfaces) {
      for (const foreground of ['text', 'muted', ...feedback]) {
        const ratio = contrast(palette[`--builder-${foreground}`], palette[`--builder-${surface}`]);
        assert.ok(ratio >= 4.5, `${mode}: ${foreground}/${surface} is ${ratio.toFixed(2)}:1`);
      }
      for (const foreground of indicators) {
        const ratio = contrast(palette[`--builder-${foreground}`], palette[`--builder-${surface}`]);
        assert.ok(ratio >= 3, `${mode}: ${foreground}/${surface} is ${ratio.toFixed(2)}:1`);
      }
      for (const role of feedback) {
        const ratio = contrast(palette[`--builder-${role}`], palette[`--builder-${surface}`]);
        assert.ok(ratio >= 3, `${mode}: ${role} border/${surface} is ${ratio.toFixed(2)}:1`);
      }
    }
    for (const [foreground, background] of specialPairs) {
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
  'browser-computed AA matrix, focus, targets and token-only host overrides',
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
          const computedPairs = await page.locator('.cms-core').evaluate((root) => {
            const surfaces = ['chrome', 'canvas', 'surface', 'raised'];
            const feedback = ['success', 'warning', 'danger', 'info'];
            const indicators = ['focus', 'selection', 'drop'];
            const pairs = [];
            const probe = globalThis.document.createElement('div');
            root.append(probe);
            const computed = (token) => {
              probe.style.color = `var(--builder-${token})`;
              return globalThis.getComputedStyle(probe).color;
            };
            for (const surface of surfaces) {
              probe.style.backgroundColor = `var(--builder-${surface})`;
              const background = globalThis.getComputedStyle(probe).backgroundColor;
              for (const role of ['text', 'muted', ...feedback]) {
                probe.className =
                  role === 'text'
                    ? 'cms-core__title'
                    : role === 'muted'
                      ? 'cms-core__muted'
                      : `cms-core__status cms-core__status--${role}`;
                probe.style.color = '';
                pairs.push({
                  label: `${role}/${surface}`,
                  foreground: globalThis.getComputedStyle(probe).color,
                  background,
                  minimum: 4.5,
                });
                probe.className = '';
              }
              for (const role of indicators) {
                pairs.push({
                  label: `${role}/${surface}`,
                  foreground: computed(role),
                  background,
                  minimum: 3,
                });
              }
              for (const role of feedback) {
                probe.className = `cms-core__status cms-core__status--${role}`;
                probe.style.color = '';
                const style = globalThis.getComputedStyle(probe);
                pairs.push({
                  label: `${role} border/${surface}`,
                  foreground: style.borderTopColor,
                  background,
                  minimum: 3,
                });
                probe.className = '';
              }
            }
            for (const [foreground, background] of [
              ['accent-text', 'accent'],
              ['accent', 'accent-soft'],
              ['drop', 'accent-soft'],
              ['art-ink', 'art'],
            ]) {
              probe.style.backgroundColor = `var(--builder-${background})`;
              pairs.push({
                label: `${foreground}/${background}`,
                foreground: computed(foreground),
                background: globalThis.getComputedStyle(probe).backgroundColor,
                minimum: 4.5,
              });
            }
            probe.remove();
            return pairs;
          });
          assert.equal(computedPairs.length, pairsPerMode);
          for (const pair of computedPairs) {
            const ratio = contrast(pair.foreground, pair.background);
            assert.ok(
              ratio >= pair.minimum,
              `${mode} ${width}px: computed ${pair.label} is ${ratio.toFixed(2)}:1 (needs ${pair.minimum}:1)`,
            );
          }
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
          const outlineColor = await page
            .locator('.cms-core__button--primary')
            .evaluate((element) => globalThis.getComputedStyle(element).outlineColor);
          const focusPair = computedPairs.find((pair) => pair.label === 'focus/surface');
          assert.equal(outlineColor, focusPair.foreground);
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
