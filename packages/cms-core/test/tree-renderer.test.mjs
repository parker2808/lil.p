import assert from 'node:assert/strict';
import { mkdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import process from 'node:process';
import { test } from 'node:test';
import { URL } from 'node:url';

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { z } from 'zod';

import { measure } from '../../../scripts/measure-cms-core.mjs';

const require = createRequire(import.meta.url);
const { renderTree } = await import('@parker2808/cms-core/react/server');
const makeNode = (id, type, base, slot = {}) => ({ id, type, responsive: { base }, ...slot });
const heading = makeNode(
  'head',
  'component',
  { text: 'Hello', level: 1 },
  { componentType: 'heading' },
);
const paragraph = makeNode(
  'paragraph',
  'component',
  { text: '<script>not HTML</script>' },
  { componentType: 'paragraph' },
);
const button = makeNode(
  'button',
  'component',
  { label: 'Open', href: '/about' },
  { componentType: 'button' },
);
const image = makeNode(
  'image',
  'component',
  { src: '/picture.png', alt: 'Picture' },
  { componentType: 'image' },
);
const rich = makeNode(
  'rich',
  'component',
  { text: 'Rich & plain' },
  { componentType: 'rich-text' },
);
const divider = makeNode('divider', 'component', {}, { componentType: 'divider' });
const spacer = makeNode('spacer', 'component', { size: 'sm' }, { componentType: 'spacer' });
const grid = makeNode('grid', 'grid', { columns: 2 }, { items: [paragraph, button] });
grid.responsive.mobile = { columns: 1 };
const column = makeNode('column', 'column', { span: 1 }, { content: [heading, image] });
const secondColumn = makeNode(
  'column2',
  'column',
  { span: 1 },
  { content: [rich, divider, spacer] },
);
const row = makeNode('row', 'row', {}, { columns: [column, secondColumn] });
const tree = {
  schemaVersion: 1,
  root: makeNode(
    'page',
    'page',
    {},
    { sections: [makeNode('section', 'section', {}, { content: [row, grid] })] },
  ),
};
const labels = { unsupported: 'Nội dung chưa được hỗ trợ' };
const render = (input, overrides = {}) =>
  renderTree({ input, createElement, labels, ...overrides });
const markup = (result) => renderToStaticMarkup(result.content);

test('built ESM and CJS server entries expose tree rendering without editor imports', async () => {
  assert.equal(typeof renderTree, 'function');
  assert.equal(typeof require('@parker2808/cms-core/react/server').renderTree, 'function');
  for (const file of ['react/server.js', 'react/server.cjs']) {
    const code = readFileSync(new URL(`../dist/${file}`, import.meta.url), 'utf8');
    assert.doesNotMatch(
      code,
      /use client|SchemaForm|WidgetRegistry|next-intl|@portfolio\/|@\/modules\//,
    );
  }
  const { totals, limits } = measure();
  assert.ok(totals.react <= limits.react);
  assert.ok(totals.browser <= limits.browser);
});

test('shared draft reader produces identical public and preview SSR without executable content', () => {
  const publicResult = render(tree);
  const previewResult = render(tree);
  assert.equal(publicResult.ok, true);
  assert.equal(previewResult.ok, true);
  const html = markup(publicResult);
  assert.equal(markup(previewResult), html);
  assert.match(html, /<h1>Hello<\/h1>/);
  assert.match(html, /&lt;script&gt;not HTML&lt;\/script&gt;/);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /<img src="\/picture.png" alt="Picture" loading="lazy"\/>/);
  assert.match(html, /<a href="\/about"/);
  assert.match(html, /Rich &amp; plain/);
  assert.match(html, /<hr aria-hidden="true"\/>/);
  assert.match(html, /cms-tree__spacer--sm/);
  assert.match(html, /--cms-grid-mobile:1/);
  assert.ok(html.indexOf('Hello') < html.indexOf('Rich &amp; plain'));
  assert.ok(html.indexOf('Rich &amp; plain') < html.indexOf('&lt;script&gt;'));
});

test('responsive component variants and registered host components stay server-only', () => {
  const custom = makeNode('custom', 'component', { text: 'Base' }, { componentType: 'quote' });
  custom.responsive.mobile = { text: 'Điện thoại' };
  const sample = globalThis.structuredClone(tree);
  sample.root.sections[0].content[1].items = [custom];
  const result = render(sample, {
    registry: { quote: { props: z.strictObject({ text: z.string() }) } },
    components: { quote: (_, props) => createElement('blockquote', null, props.text) },
  });
  assert.equal(result.ok, true);
  const html = markup(result);
  assert.match(html, /cms-tree__variant--mobile"><blockquote>Điện thoại<\/blockquote>/);
  assert.match(html, /cms-tree__variant--desktop"><blockquote>Base<\/blockquote>/);
});

test('invalid, unknown and future trees preserve input with a typed, localized warning', () => {
  const cases = [
    [null, 'INVALID_TREE'],
    [{ ...tree, schemaVersion: 29 }, 'UNSUPPORTED_VERSION'],
    {
      ...tree,
      root: {
        ...tree.root,
        sections: [
          makeNode(
            'bad',
            'section',
            {},
            { content: [makeNode('mystery', 'component', {}, { componentType: 'missing' })] },
          ),
        ],
      },
    },
  ];
  for (const entry of cases) {
    const input = Array.isArray(entry) ? entry[0] : entry;
    const result = render(input);
    assert.equal(result.ok, false);
    assert.strictEqual(result.input, input);
    if (Array.isArray(entry)) assert.equal(result.code, entry[1]);
    else assert.equal(result.code, 'UNKNOWN_TYPE');
    assert.match(markup(result), /role="status".*Nội dung chưa được hỗ trợ/);
  }
  const legacy = globalThis.structuredClone(tree);
  legacy.root.sections[0].content[1].items = [
    makeNode('opaque', 'legacy-component', { block: { original: 'never drop' } }),
  ];
  const opaque = render(legacy);
  assert.equal(opaque.ok, false);
  assert.equal(opaque.code, 'UNKNOWN_TYPE');
  assert.strictEqual(opaque.input, legacy);
  assert.doesNotMatch(markup(opaque), /never drop/);
});

test('malformed deep or wide trees cannot exhaust the renderer', () => {
  const deep = globalThis.structuredClone(tree);
  let cursor = deep.root.sections[0];
  for (let index = 0; index < 701; index++) {
    const child = makeNode(`deep-${index}`, 'section', {}, { content: [] });
    cursor.content = [child];
    cursor = child;
  }
  const wide = globalThis.structuredClone(tree);
  wide.root.sections = Array.from({ length: 501 }, (_, index) =>
    makeNode(`section-${index}`, 'section', {}, { content: [] }),
  );
  for (const input of [deep, wide]) {
    const result = render(input);
    assert.equal(result.ok, false);
    assert.equal(result.code, 'TREE_LIMIT');
    assert.strictEqual(result.input, input);
    assert.match(markup(result), /Nội dung chưa được hỗ trợ/);
  }
});

test('media resolver cannot introduce unsafe URLs', () => {
  for (const resolver of [() => 'javascript:alert(1)', () => undefined]) {
    const result = render(tree, { resolveMedia: resolver });
    assert.equal(result.ok, false);
    assert.equal(result.code, 'INVALID_PROPS');
    assert.strictEqual(result.input, tree);
    assert.doesNotMatch(markup(result), /javascript:/);
  }
});

test('core stylesheet defines responsive grid and variants under neutral scope', () => {
  const css = readFileSync(new URL('../dist/theme.css', import.meta.url), 'utf8');
  assert.match(
    css,
    /\.cms-core \.cms-tree__grid\s*\{\s*grid-template-columns: repeat\(var\(--cms-grid-mobile\)/,
  );
  assert.match(css, /@media \(min-width: 640px\) and \(max-width: 1023px\)/);
  assert.match(css, /@media \(min-width: 1024px\)/);
  assert.match(css, /--cms-grid-desktop/);
  assert.match(css, /cms-tree__variant--mobile/);
});

test(
  'browser renders neutral light/dark EN/VI grid, focus and token overrides',
  {
    skip: !process.env.CMS_TREE_BROWSER,
  },
  async () => {
    const requireWeb = createRequire(new URL('../../../apps/web/package.json', import.meta.url));
    const { chromium } = requireWeb('@playwright/test');
    const browser = await chromium.launch({ headless: true });
    const css = readFileSync(new URL('../dist/theme.css', import.meta.url), 'utf8');
    const illustration = readFileSync(
      new URL('../../../examples/cms-core-fixture/public/illustration.svg', import.meta.url),
    );
    const output = process.env.CMS_TREE_CAPTURES_DIR;
    if (output) mkdirSync(output, { recursive: true });
    try {
      for (const width of [390, 768, 1440]) {
        for (const mode of ['light', 'dark']) {
          for (const locale of ['en', 'vi']) {
            const localized = globalThis.structuredClone(tree);
            localized.root.sections[0].content[0].columns[0].content[0].responsive.base.text =
              locale === 'vi' ? 'Xin chào' : 'Hello';
            localized.root.sections[0].content[0].columns[0].content[1].responsive.base.alt =
              locale === 'vi' ? 'Phong cảnh' : 'Picture';
            localized.root.sections[0].content[0].columns[1].content[0].responsive.base.text =
              locale === 'vi' ? 'Nội dung phong phú' : 'Rich & plain';
            localized.root.sections[0].content[1].items[0].responsive.base.text =
              locale === 'vi' ? 'Văn bản an toàn' : 'Safe text';
            localized.root.sections[0].content[1].items[1].responsive.base.label =
              locale === 'vi' ? 'Xem thêm' : 'Open';
            const result = render(localized, {
              resolveMedia: () => 'https://example.test/picture.svg',
            });
            assert.equal(result.ok, true);
            const page = await browser.newPage({ viewport: { width, height: 800 } });
            await page.route('https://example.test/picture.svg', (route) =>
              route.fulfill({ status: 200, contentType: 'image/svg+xml', body: illustration }),
            );
            await page.setContent(
              `<main class="cms-core" data-theme="${mode}" lang="${locale}">${markup(result)}</main>`,
            );
            await page.addStyleTag({ content: css });
            await page.locator('img').evaluate((image) => image.decode());
            const gridColumns = await page
              .locator('.cms-tree__grid')
              .evaluate(
                (element) =>
                  globalThis.getComputedStyle(element).gridTemplateColumns.split(' ').length,
              );
            assert.equal(gridColumns, width === 390 ? 1 : 2);
            assert.equal(
              await page.locator('h1').textContent(),
              locale === 'vi' ? 'Xin chào' : 'Hello',
            );
            assert.equal(await page.locator('script').count(), 0);
            await page.locator('.cms-tree__component a').focus();
            assert.equal(
              await page
                .locator('.cms-tree__component a')
                .evaluate((element) => globalThis.getComputedStyle(element).outlineStyle),
              'solid',
            );
            const before = await page
              .locator('.cms-core')
              .evaluate((element) =>
                globalThis.getComputedStyle(element).getPropertyValue('--builder-accent').trim(),
              );
            if (output && width !== 768) {
              await page.screenshot({
                path: `${output}/${locale}-${mode}-${width}.png`,
                fullPage: true,
              });
            }
            await page.addStyleTag({
              content: '.cms-core[data-brand="sample"] { --builder-accent: #005a3d; }',
            });
            await page
              .locator('.cms-core')
              .evaluate((element) => element.setAttribute('data-brand', 'sample'));
            const after = await page
              .locator('.cms-core')
              .evaluate((element) =>
                globalThis.getComputedStyle(element).getPropertyValue('--builder-accent').trim(),
              );
            assert.notEqual(before, after);
            assert.equal(
              markup(render(localized, { resolveMedia: () => 'https://example.test/picture.svg' })),
              markup(result),
            );
            await page.close();
          }
        }
      }
    } finally {
      await browser.close();
    }
  },
);
