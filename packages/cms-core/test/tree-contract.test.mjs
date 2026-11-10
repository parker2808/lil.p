import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import { URL } from 'node:url';
import { gzipSync } from 'node:zlib';

import {
  convertLegacySnapshot,
  legacyTreeDocumentSchema,
  migrateTree,
  readTree,
  resolveResponsive,
  starterComponentSchemas,
  TREE_LIMITS,
  TREE_VERSION,
  treeDocumentSchema,
  treeIdSchema,
  validateTreeForPublish,
} from '@parker2808/cms-core/tree';
import { z } from 'zod';

const require = createRequire(import.meta.url);
const responsive = (base = {}) => ({ base });
const heading = {
  id: 'heading',
  type: 'component',
  componentType: 'heading',
  responsive: responsive({ text: 'Hello', level: 1 }),
};
const page = (content = [heading]) => ({
  schemaVersion: 1,
  root: {
    id: 'page',
    type: 'page',
    responsive: responsive(),
    sections: [{ id: 'section', type: 'section', responsive: responsive(), content }],
  },
});
const errorCode = (input, code, registry, validate = readTree) => {
  const result = validate(input, registry);
  assert.equal(result.ok, false);
  assert.equal(result.code, code);
  assert.strictEqual(result.input, input);
};

test('versioned public schemas, ESM and CJS resolve without host modules', () => {
  const specifier = '@parker2808/cms-core/tree';
  assert.match(require.resolve(specifier), /\/dist\/tree\.cjs$/);
  assert.match(import.meta.resolve(specifier), /\/dist\/tree\.js$/);
  assert.equal(require(specifier).TREE_VERSION, TREE_VERSION);
  assert.equal(typeof require(specifier).convertLegacySnapshot, 'function');
  assert.equal(typeof require(specifier).validateTreeForPublish, 'function');
  assert.equal(typeof require(specifier).treeDocumentSchema.safeParse, 'function');
  assert.equal(typeof legacyTreeDocumentSchema.safeParse, 'function');
  assert.equal(typeof treeIdSchema.safeParse, 'function');
  assert.equal(typeof starterComponentSchemas.heading.safeParse, 'function');
  assert.equal(treeDocumentSchema.safeParse(page()).success, true);
  assert.match(readFileSync(new URL('../dist/tree.d.ts', import.meta.url), 'utf8'), /TreeDocument/);
  assert.equal(
    Object.keys(require.cache).some((path) => /\/packages\/contracts\/|\/apps\//.test(path)),
    false,
  );
  assert.doesNotMatch(
    readFileSync(new URL('../dist/tree.js', import.meta.url), 'utf8'),
    /@portfolio\/|@\/modules\//,
  );
});

test('empty builder root, slot nesting, stable IDs and responsive shallow overrides', () => {
  assert.equal(readTree({ ...page(), root: { ...page().root, sections: [] } }).ok, true);
  const nested = page([
    {
      id: 'row',
      type: 'row',
      responsive: responsive(),
      columns: [
        { id: 'left', type: 'column', responsive: responsive({ span: 2 }), content: [heading] },
        {
          id: 'right',
          type: 'column',
          responsive: responsive({ span: 2 }),
          content: [
            {
              id: 'divider',
              type: 'component',
              componentType: 'divider',
              responsive: responsive(),
            },
          ],
        },
      ],
    },
  ]);
  assert.equal(readTree(nested).ok, true);
  assert.deepEqual(
    resolveResponsive({ base: { text: 'EN', level: 1 }, mobile: { text: 'VI' } }, 'mobile'),
    { text: 'VI', level: 1 },
  );
  assert.equal(
    readTree(nested).value.root.sections[0].content[0].columns[0].content[0].id,
    'heading',
  );
  const duplicated = JSON.parse(JSON.stringify(nested));
  duplicated.root.sections[0].content[0].columns[1].content[0].id = 'heading';
  errorCode(duplicated, 'DUPLICATE_ID');
  errorCode(page([{ ...heading, id: 'bad id' }]), 'INVALID_TREE');
  errorCode(
    page([{ id: 'row', type: 'row', responsive: responsive(), columns: [heading] }]),
    'INVALID_SLOT',
  );
  errorCode(page([{ ...heading, type: 'future-node' }]), 'INVALID_TREE');
});

test('unknown/future/extra fields and invalid JSON fail closed without mutating input', () => {
  const future = { ...page(), schemaVersion: 2 };
  errorCode(future, 'UNSUPPORTED_VERSION');
  errorCode({ ...page(), extra: 'retained' }, 'INVALID_TREE');
  errorCode(page([{ ...heading, extra: 1 }]), 'INVALID_TREE');
  errorCode(
    page([{ ...heading, responsive: responsive({ text: 'Hello', level: 1, unknown: true }) }]),
    'INVALID_PROPS',
  );
  errorCode(page([{ ...heading, componentType: 'unregistered' }]), 'UNKNOWN_TYPE');
  errorCode(
    page([{ ...heading, responsive: { base: { text: 'Hello', level: 1 }, mobile: { level: 7 } } }]),
    'INVALID_PROPS',
  );
  errorCode(
    page([{ ...heading, responsive: { base: { text: 'Hello', level: 1 }, television: {} } }]),
    'INVALID_TREE',
  );
  errorCode(
    page([{ ...heading, responsive: responsive({ text: 'Hello', level: 1, broken: undefined }) }]),
    'INVALID_TREE',
  );
  assert.equal(future.schemaVersion, 2);
});

test('registered components, H1/required policies, URLs and rich text', () => {
  const registry = { alert: { props: z.strictObject({ text: z.string() }), role: 'required' } };
  assert.equal(readTree(page([heading]), registry).ok, true);
  errorCode(page([heading]), 'HEADING_RULE', registry, validateTreeForPublish);
  assert.equal(
    validateTreeForPublish(
      page([
        heading,
        {
          id: 'alert',
          type: 'component',
          componentType: 'alert',
          responsive: responsive({ text: 'Hi' }),
        },
      ]),
      registry,
    ).ok,
    true,
  );
  assert.equal(readTree(page([heading, { ...heading, id: 'heading-2' }])).ok, true);
  errorCode(
    page([heading, { ...heading, id: 'heading-2' }]),
    'HEADING_RULE',
    undefined,
    validateTreeForPublish,
  );
  const incomplete = page([
    {
      id: 'paragraph',
      type: 'component',
      componentType: 'paragraph',
      responsive: responsive({ text: 'Draft' }),
    },
  ]);
  assert.equal(readTree(incomplete).ok, true);
  errorCode(incomplete, 'HEADING_RULE', undefined, validateTreeForPublish);
  assert.equal(readTree(page([])).ok, true);
  errorCode(
    page([
      {
        ...heading,
        componentType: 'rich-text',
        responsive: responsive({ text: '<script>alert(1)</script>' }),
      },
    ]),
    'INVALID_PROPS',
  );
  errorCode(
    page([
      heading,
      {
        id: 'link',
        type: 'component',
        componentType: 'button',
        responsive: responsive({ label: 'Go', href: 'javascript:alert(1)' }),
      },
    ]),
    'INVALID_PROPS',
  );
  errorCode(
    page([
      heading,
      {
        id: 'img',
        type: 'component',
        componentType: 'image',
        responsive: responsive({ alt: 'Alt', src: '//evil.test' }),
      },
    ]),
    'INVALID_PROPS',
  );
});

test('bounded depth/count/bytes, including multibyte payloads', () => {
  const grid = {
    id: 'grid',
    type: 'grid',
    responsive: responsive({ columns: 2 }),
    items: [heading],
  };
  errorCode(
    page([
      {
        id: 'row',
        type: 'row',
        responsive: responsive(),
        columns: [
          { id: 'column-1', type: 'column', responsive: responsive({ span: 2 }), content: [grid] },
          { id: 'column-2', type: 'column', responsive: responsive({ span: 2 }), content: [] },
        ],
      },
    ]),
    'TREE_LIMIT',
  );
  let deep = heading;
  for (let index = 0; index < 720; index += 1) {
    deep = { id: `deep-${index}`, type: 'section', responsive: responsive(), content: [deep] };
  }
  errorCode(
    {
      schemaVersion: 1,
      root: { id: 'page', type: 'page', responsive: responsive(), sections: [deep] },
    },
    'TREE_LIMIT',
  );
  const oldDeep = JSON.parse(
    JSON.stringify({
      schemaVersion: 0,
      root: { id: 'page', type: 'page', props: {}, sections: [] },
    }),
  );
  let oldChild = {
    id: 'heading',
    type: 'component',
    componentType: 'heading',
    props: { text: 'Hi', level: 1 },
  };
  for (let index = 0; index < 720; index += 1)
    oldChild = { id: `old-${index}`, type: 'section', props: {}, content: [oldChild] };
  oldDeep.root.sections = [oldChild];
  const migrated = migrateTree(oldDeep);
  assert.equal(migrated.ok, false);
  assert.equal(migrated.code, 'TREE_LIMIT');
  assert.strictEqual(migrated.input, oldDeep);
  let deepProps = { text: 'deep', level: 1 };
  for (let index = 0; index < 70; index += 1) deepProps = { nested: deepProps };
  errorCode(page([{ ...heading, responsive: responsive(deepProps) }]), 'TREE_LIMIT');
  errorCode(
    page(
      Array.from({ length: TREE_LIMITS.nodes }, (_, index) => ({
        ...heading,
        id: `item-${index}`,
      })),
    ),
    'TREE_LIMIT',
  );
  errorCode(
    page(
      Array.from({ length: 750 }, (_, index) => ({
        ...heading,
        id: `wide-${index}`,
      })),
    ),
    'TREE_LIMIT',
  );
  errorCode(
    page([
      { ...heading, responsive: responsive({ text: 'ữ'.repeat(TREE_LIMITS.bytes), level: 1 }) },
    ]),
    'TREE_LIMIT',
  );
  errorCode(
    page([
      {
        ...heading,
        responsive: responsive({ text: 'ữ'.repeat(TREE_LIMITS.propsBytes / 3), level: 1 }),
      },
    ]),
    'TREE_LIMIT',
  );
});

test('every allowed layout path can hold a component within the depth budget', () => {
  const component = {
    id: 'divider',
    type: 'component',
    componentType: 'divider',
    responsive: responsive(),
  };
  const grid = {
    id: 'grid',
    type: 'grid',
    responsive: { base: { columns: 2 }, mobile: { columns: 1 } },
    items: [component],
  };
  assert.equal(readTree(page([grid])).ok, true);
  errorCode(page([{ ...grid, responsive: { base: { columns: 1 } } }]), 'INVALID_PROPS');
  const columns = [
    { id: 'one', type: 'column', responsive: responsive({ span: 2 }), content: [heading] },
    { id: 'two', type: 'column', responsive: responsive({ span: 2 }), content: [component] },
  ];
  assert.equal(
    readTree(page([{ id: 'row', type: 'row', responsive: responsive(), columns }])).ok,
    true,
  );
  errorCode(
    page([
      {
        id: 'row',
        type: 'row',
        responsive: responsive(),
        columns: [columns[0], { ...columns[1], content: [{ ...grid, items: [] }] }],
      },
    ]),
    'INVALID_SLOT',
  );
});

test('v0 migrator upgrades exactly once, rejects future/unknown and retains source', () => {
  const old = {
    schemaVersion: 0,
    root: {
      id: 'page',
      type: 'page',
      props: {},
      sections: [
        {
          id: 'section',
          type: 'section',
          props: {},
          content: [
            {
              id: 'heading',
              type: 'component',
              componentType: 'heading',
              props: { level: 1, text: 'Old' },
            },
          ],
        },
      ],
    },
  };
  assert.equal(legacyTreeDocumentSchema.safeParse(old).success, true);
  const upgraded = migrateTree(old);
  assert.equal(upgraded.ok, true);
  assert.equal(old.root.sections[0].content[0].props.text, 'Old');
  assert.equal(upgraded.value.root.sections[0].content[0].responsive.base.text, 'Old');
  assert.deepEqual(migrateTree(upgraded.value), upgraded);
  assert.deepEqual(migrateTree(old), upgraded);
  const unknown = JSON.parse(JSON.stringify(old));
  unknown.root.sections[0].content[0].mystery = 2;
  assert.deepEqual(migrateTree(unknown), { ok: false, code: 'INVALID_TREE', input: unknown });
  assert.deepEqual(migrateTree({ ...old, schemaVersion: 3 }), {
    ok: false,
    code: 'UNSUPPORTED_VERSION',
    input: { ...old, schemaVersion: 3 },
  });
});

test('opt-in legacy conversion preserves SEO, every block field, unknown type and order', () => {
  const seo = {
    seoTitleEn: 'EN',
    seoTitleVi: 'VI',
    seoDescriptionEn: null,
    seoDescriptionVi: 'Mô tả',
  };
  const blocks = [
    {
      id: 17,
      type: 'future-host-block',
      key: 'first',
      schemaVersion: 12,
      props: { nested: { data: ['vi', 1] } },
      layout: 'ONE',
      surface: 'PLAIN',
      isVisible: false,
      sortOrder: 1,
      updatedAt: 'date',
      issues: ['review'],
    },
    {
      type: 'hero',
      key: 'second',
      schemaVersion: 0,
      props: { text: 'EN' },
      layout: 'TWO',
      surface: 'BAND',
      isVisible: true,
      sortOrder: 2,
    },
  ];
  const snapshot = { seo, blocks };
  const converted = convertLegacySnapshot(snapshot);
  assert.equal(converted.ok, true);
  assert.deepEqual(converted.value.seo, seo);
  assert.deepEqual(
    converted.value.tree.root.sections.map((section) => section.content[0].responsive.base.block),
    blocks,
  );
  assert.deepEqual(
    converted.value.tree.root.sections.map((section) => section.id),
    ['legacy-section-first', 'legacy-section-second'],
  );
  assert.notStrictEqual(
    converted.value.tree.root.sections[0].content[0].responsive.base.block,
    blocks[0],
  );
  assert.equal(readTree(converted.value.tree).ok, true);
  assert.equal(snapshot.blocks[0].type, 'future-host-block');
  assert.deepEqual(
    convertLegacySnapshot({ ...snapshot, blocks: [...blocks, { ...blocks[0] }] }).code,
    'DUPLICATE_ID',
  );
  assert.deepEqual(
    convertLegacySnapshot({ ...snapshot, blocks: [{ ...blocks[0], key: 'bad key' }] }).code,
    'INVALID_TREE',
  );
  assert.deepEqual(convertLegacySnapshot({ ...snapshot, extra: 1 }).code, 'INVALID_TREE');
});

test('combined contracts+engine+tree gzip stays under unchanged 60 KiB cap', () => {
  const sizes = ['contracts', 'engine', 'tree'].map(
    (name) =>
      gzipSync(readFileSync(new URL(`../dist/${name}.js`, import.meta.url)), { level: 9, mtime: 0 })
        .byteLength,
  );
  assert.ok(sizes.reduce((sum, size) => sum + size, 0) <= 60 * 1024);
});
