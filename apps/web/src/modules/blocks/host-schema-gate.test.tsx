import { renderTree } from '@parker2808/cms-core/react/server';
import {
  applyTreeOperation,
  commitTreeHistory,
  createTreeHistory,
  DraftAutosave,
  readTree,
  redoTreeHistory,
  undoTreeHistory,
  type ResponsiveProps,
  type TreeDocument,
} from '@parker2808/cms-core/tree';
import { BLOCK_REGISTRY } from '@portfolio/contracts';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

const hostRegistry = Object.fromEntries(
  Object.values(BLOCK_REGISTRY).map(({ type, props, role }) => [type, { props, role }]),
);
const blank: TreeDocument = {
  schemaVersion: 1,
  root: {
    id: 'page-root',
    type: 'page',
    responsive: { base: {} },
    sections: [{ id: 'section-root', type: 'section', responsive: { base: {} }, content: [] }],
  },
};

function localize(value: unknown, locale: 'en' | 'vi'): unknown {
  if (Array.isArray(value)) return value.map((item) => localize(item, locale));
  if (!value || typeof value !== 'object') return value;
  const fields = value as Record<string, unknown>;
  if (typeof fields.en === 'string' && typeof fields.vi === 'string') {
    return (locale === 'vi' && fields.vi) || fields.en;
  }
  return Object.fromEntries(
    Object.entries(fields).map(([key, item]) => [key, localize(item, locale)]),
  );
}

describe('D6 all-20 host schema release gate', () => {
  it('registers exactly the 20 host definitions rather than accepting an implicit starter schema', () => {
    expect(Object.keys(BLOCK_REGISTRY)).toHaveLength(20);
    expect(Object.keys(hostRegistry).sort()).toEqual(Object.keys(BLOCK_REGISTRY).sort());
  });

  it.each(Object.values(BLOCK_REGISTRY))(
    '$type validates D5 edits, history and autosave and renders EN/VI SSR parity',
    async (definition) => {
      const base = structuredClone(definition.defaults) as Record<string, unknown>;
      if (definition.type === 'page-header') {
        base.title = { ...(base.title as Record<string, string>), vi: 'Tiêu đề kiểm thử' };
      }
      const node = {
        id: `host-${definition.type}`,
        type: 'component' as const,
        componentType: definition.type,
        responsive: { base },
      };
      expect(definition.props.safeParse(base).success).toBe(true);
      const insert = {
        kind: 'insert' as const,
        parentId: 'section-root',
        slot: 'content' as const,
        index: 0,
        node,
      };
      const inserted = applyTreeOperation(blank, insert, hostRegistry);
      expect(inserted.ok).toBe(true);
      if (!inserted.ok) return;
      expect(readTree(inserted.value, hostRegistry).ok).toBe(true);
      const propertyKey = Object.keys(base)[0];
      if (propertyKey) {
        const changed = applyTreeOperation(
          inserted.value,
          {
            kind: 'property',
            nodeId: node.id,
            breakpoint: 'mobile',
            key: propertyKey,
            value: structuredClone(base[propertyKey]) as ResponsiveProps['base'][string],
          },
          hostRegistry,
        );
        expect(changed.ok).toBe(true);
        if (changed.ok) expect(readTree(changed.value, hostRegistry).ok).toBe(true);
      }
      expect(readTree(inserted.value, {})).toMatchObject({ ok: false, code: 'UNKNOWN_TYPE' });
      expect(
        applyTreeOperation(inserted.value, { kind: 'delete', nodeId: node.id }, {}),
      ).toMatchObject({
        ok: false,
        code: 'UNKNOWN_TYPE',
      });
      expect(
        () =>
          new DraftAutosave(
            { tree: inserted.value, revision: '0' },
            {
              save: async () => ({ tree: inserted.value, revision: '1' }),
              read: async () => ({ tree: inserted.value, revision: '1' }),
            },
            { schedule: () => 1, cancel: () => {} },
            {},
          ),
      ).toThrow('Invalid draft snapshot');

      const rejected = applyTreeOperation(
        inserted.value,
        { kind: 'property', nodeId: node.id, breakpoint: 'base', key: 'unexpected', value: null },
        hostRegistry,
      );
      expect(rejected).toMatchObject({ ok: false, code: 'INVALID_PROPS' });
      if (!rejected.ok) expect(rejected.input).toBe(inserted.value);
      const history = commitTreeHistory(createTreeHistory(blank), insert, { at: 0 }, hostRegistry);
      expect(history.ok).toBe(true);
      if (!history.ok) return;
      expect(undoTreeHistory(history.value).document).toEqual(blank);
      expect(redoTreeHistory(undoTreeHistory(history.value)).document).toEqual(inserted.value);

      const autosave = new DraftAutosave(
        { tree: blank, revision: '0' },
        {
          save: async ({ tree, expectedRevision }) => {
            expect(expectedRevision).toBe('0');
            return { tree, revision: '1' };
          },
          read: async () => ({ tree: inserted.value, revision: '1' }),
        },
        { schedule: () => 1, cancel: () => {} },
        hostRegistry,
      );
      expect(autosave.edit(inserted.value).ok).toBe(true);
      await autosave.flush();
      expect(autosave.state).toMatchObject({ status: 'saved', acknowledged: { revision: '1' } });
      expect(autosave.state.local).toEqual(inserted.value);
      autosave.dispose();

      for (const locale of ['en', 'vi'] as const) {
        const render = (input: TreeDocument) =>
          renderTree({
            input,
            registry: hostRegistry,
            createElement,
            labels: { unsupported: 'Unsupported' },
            components: {
              [definition.type]: (_component, props) =>
                createElement(
                  'article',
                  { 'data-type': definition.type, lang: locale },
                  JSON.stringify(localize(props, locale)),
                ),
            },
          });
        const preview = render(inserted.value);
        const published = render(autosave.state.acknowledged.tree);
        expect(preview.ok).toBe(true);
        expect(published.ok).toBe(true);
        expect(renderToStaticMarkup(preview.content)).toBe(renderToStaticMarkup(published.content));
        expect(renderToStaticMarkup(preview.content)).toContain(`lang="${locale}"`);
        if (definition.type === 'page-header' && locale === 'vi') {
          expect(renderToStaticMarkup(preview.content)).toContain('Tiêu đề kiểm thử');
        }
      }
    },
  );
});
