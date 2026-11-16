import assert from 'node:assert/strict';
import { test } from 'node:test';

import { convertLegacySnapshot, migrateTree, readTree } from '@parker2808/cms-core/tree';

const source = {
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
            id: 'row',
            type: 'row',
            props: {},
            columns: [
              {
                id: 'column',
                type: 'column',
                props: { span: 1 },
                content: [
                  {
                    id: 'heading',
                    type: 'component',
                    componentType: 'heading',
                    props: { text: 'Tiêu đề', level: 1 },
                  },
                ],
              },
              {
                id: 'other-column',
                type: 'column',
                props: { span: 1 },
                content: [
                  { id: 'divider', type: 'component', componentType: 'divider', props: {} },
                ],
              },
            ],
          },
          {
            id: 'grid',
            type: 'grid',
            props: { columns: 2 },
            items: [
              {
                id: 'copy',
                type: 'component',
                componentType: 'paragraph',
                props: { text: 'Nested copy' },
              },
            ],
          },
        ],
      },
    ],
  },
};

function restoreSource(node) {
  const { responsive, ...fields } = node;
  const restored = { ...fields, props: responsive.base };
  for (const slot of ['sections', 'content', 'columns', 'items']) {
    if (node[slot]) restored[slot] = node[slot].map(restoreSource);
  }
  return restored;
}

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, canonical(entry)]),
    );
  }
  return value;
}

test('v0 nested slots round-trip losslessly and reject unknown nested node fields', () => {
  const originalBytes = JSON.stringify(source);
  const migrated = migrateTree(source);
  assert.equal(migrated.ok, true);
  assert.equal(JSON.stringify(source), originalBytes);
  assert.equal(readTree(migrated.value).ok, true);
  assert.deepEqual(migrateTree(JSON.parse(JSON.stringify(migrated.value))), migrated);
  assert.equal(
    JSON.stringify(canonical({ schemaVersion: 0, root: restoreSource(migrated.value.root) })),
    JSON.stringify(canonical(source)),
  );

  for (const slot of ['sections', 'content', 'columns', 'items']) {
    const invalid = JSON.parse(JSON.stringify(source));
    const section = invalid.root.sections[0];
    const node =
      slot === 'sections'
        ? section
        : slot === 'content'
          ? section.content[0]
          : slot === 'columns'
            ? section.content[0].columns[0]
            : section.content[1].items[0];
    node.unrecognized = { nested: ['must', 'not', 'disappear'] };
    assert.deepEqual(migrateTree(invalid), { ok: false, code: 'INVALID_TREE', input: invalid });
    assert.equal(JSON.stringify(source), originalBytes);
  }
});

test('legacy snapshot conversion retains unknown host block payload and source bytes', () => {
  const snapshot = {
    seo: {
      seoTitleEn: null,
      seoTitleVi: 'Bản tiếng Việt',
      seoDescriptionEn: null,
      seoDescriptionVi: 'Mô tả',
    },
    blocks: [
      {
        type: 'future-block',
        key: 'first',
        schemaVersion: 42,
        props: { nested: { vi: ['giữ nguyên', { extra: true }] } },
        layout: 'ONE',
        surface: 'PLAIN',
        isVisible: true,
        sortOrder: 0,
      },
    ],
  };
  const originalBytes = JSON.stringify(snapshot);
  const converted = convertLegacySnapshot(snapshot);
  assert.equal(converted.ok, true);
  const { seo, tree } = converted.value;
  assert.equal(
    JSON.stringify(
      canonical({
        seo,
        blocks: tree.root.sections.map((section) => section.content[0].responsive.base.block),
      }),
    ),
    JSON.stringify(canonical(snapshot)),
  );
  assert.equal(JSON.stringify(snapshot), originalBytes);
  assert.deepEqual(convertLegacySnapshot(JSON.parse(originalBytes)), converted);
  const invalid = JSON.parse(JSON.stringify(snapshot));
  invalid.blocks[0].unexpected = { nested: true };
  const unknownHost = convertLegacySnapshot(invalid);
  assert.equal(unknownHost.ok, true);
  assert.deepEqual(
    unknownHost.value.tree.root.sections[0].content[0].responsive.base.block,
    invalid.blocks[0],
  );
  assert.equal(JSON.stringify(snapshot), originalBytes);
});
