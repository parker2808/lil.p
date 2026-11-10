import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import { URL } from 'node:url';

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { z } from 'zod';

import { measure } from '../../../scripts/measure-cms-core.mjs';

const require = createRequire(import.meta.url);
const built = (path) => readFileSync(new URL(`../dist/${path}`, import.meta.url), 'utf8');

test('built server/client entries have independent ESM and CommonJS boundaries', async () => {
  for (const subpath of ['contracts', 'engine', 'react', 'react/server']) {
    const specifier = `@parker2808/cms-core/${subpath}`;
    assert.match(import.meta.resolve(specifier), new RegExp(`/dist/${subpath}\\.js$`));
    assert.match(require.resolve(specifier), new RegExp(`/dist/${subpath}\\.cjs$`));
    assert.ok(await import(specifier));
    assert.ok(require(specifier));
  }
  for (const file of ['react.js', 'react.cjs']) {
    assert.match(built(file), /^['"]use client['"];?/);
  }
  for (const file of ['react/server.js', 'react/server.cjs']) {
    assert.doesNotMatch(built(file), /use client|SchemaForm|WidgetRegistry|useState|useEffect/);
    assert.match(built(file), /renderBlocks/);
  }
  assert.equal(typeof (await import('@parker2808/cms-core/react/server')).renderBlocks, 'function');
  assert.equal(typeof require('@parker2808/cms-core/react/server').renderBlocks, 'function');
  assert.equal(typeof (await import('@parker2808/cms-core/react')).schemaToFields, 'function');
  assert.equal(typeof require('@parker2808/cms-core/react').fieldMessage, 'function');
});

test('server and client gzip sizes share the original React cap', () => {
  const { sizes, totals, limits } = measure();
  assert.equal(totals.react, sizes.react + sizes['react/server']);
  assert.ok(totals.react <= limits.react);
});

test('server dispatch preserves order and draft-only unknowns with host wrappers', async () => {
  const { renderBlocks } = await import('@parker2808/cms-core/react/server');
  const block = (id, surface = 'PLAIN') => ({
    id,
    type: id === 3 ? 'missing' : 'heading',
    key: `block-${id}`,
    layout: 'ONE',
    surface,
    props: {},
    lang: 'vi',
  });
  const props = {
    blocks: [block(1, 'BAND'), block(2, 'BAND'), block(3)],
    context: {},
    labels: { error: 'Lỗi', retry: 'Thử lại', empty: 'Trống', unknown: 'Không rõ' },
    registry: {
      heading: {
        component: ({ block: entry }) => createElement('strong', null, entry.key),
        skeleton: () => null,
      },
    },
    renderComponent: (entry, value) => createElement(entry.component, { block: value }),
    renderSkeleton: (entry) => createElement(entry.skeleton),
    wrapBlock: (entry, content) =>
      createElement('section', { id: entry.key, key: entry.id }, content),
    wrapBand: (group, content) => createElement('aside', { key: group[0].id }, content),
    wrapBoundary: (_, content) => content,
    renderUnknown: (entry, label) =>
      createElement('p', { key: entry.id }, `${label}: ${entry.type}`),
  };
  const publicHtml = renderToStaticMarkup(createElement('div', null, renderBlocks(props)));
  assert.match(publicHtml, /<aside><section id="block-1">.*<section id="block-2">/);
  assert.doesNotMatch(publicHtml, /Không rõ/);
  const draftHtml = renderToStaticMarkup(
    createElement('div', null, renderBlocks({ ...props, draft: true })),
  );
  assert.match(draftHtml, /Không rõ: missing/);
  assert.equal(
    renderToStaticMarkup(
      createElement(
        'div',
        null,
        renderBlocks({ ...props, resolved: { 1: null, 2: null, 3: null } }),
      ),
    ),
    '<div></div>',
  );
});

test('form contracts let a host override widgets and supply localized messages', async () => {
  const { schemaToFields, fieldMessage, createEditorMetadata, SchemaFieldControl } =
    await import('@parker2808/cms-core/react');
  const fields = schemaToFields(
    z.object({
      title: z.object({ en: z.string(), vi: z.string() }),
      caption: z.string().meta({ widget: 'callout' }),
    }),
    { widgetKinds: { callout: 'textarea' } },
  );
  assert.equal(fields[0].kind, 'localized-text');
  assert.equal(fields[1].kind, 'textarea');
  assert.equal(
    fieldMessage(fields[0], { message: 'Invalid' }, { 'props.title.en': 'Cần tiếng Anh' }),
    'Cần tiếng Anh',
  );
  assert.deepEqual(
    createEditorMetadata({
      heading: { icon: 'heading', labelKey: 'title', descriptionKey: 'hint' },
    }).heading.icon,
    'heading',
  );
  const html = renderToStaticMarkup(
    createElement(SchemaFieldControl, {
      field: fields[0],
      value: { en: '', vi: '' },
      label: 'Tiêu đề',
      readOnly: true,
      onChange: () => {},
      widgets: {
        localized: ({ label, readOnly }) => createElement('span', null, `${label}: ${readOnly}`),
        array: () => null,
        scalar: () => null,
      },
    }),
  );
  assert.match(html, /Tiêu đề: true/);
});
