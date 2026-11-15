import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  applyTreeOperation,
  createTreeHistory,
  endTreeTyping,
  readTree,
  undoTreeHistory,
  type TreeDocument,
  type TreeNode,
  type TreeOperation,
} from '@parker2808/cms-core/tree';
import { BLOCK_REGISTRY } from '@portfolio/contracts';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { useState } from 'react';

import type { BuilderState } from '../canvas/commands';
import { propertyFields } from './editor-model';
import { PropertiesPanel, type PropertyDraft } from './PropertiesPanel';
import { builderRegistry } from './registry';
import { commitProperty } from '../history/adapter';

const state = {
  selectedId: 'heading',
  document: {
    schemaVersion: 1 as const,
    root: {
      id: 'page',
      type: 'page' as const,
      responsive: { base: {} },
      sections: [
        {
          id: 'section',
          type: 'section' as const,
          responsive: { base: {} },
          content: [
            {
              id: 'heading',
              type: 'component' as const,
              componentType: 'heading',
              responsive: { base: { text: 'Hello', level: 2 }, mobile: { text: 'Small hello' } },
            },
          ],
        },
      ],
    },
  },
};

const scrollIntoView = Element.prototype.scrollIntoView;
beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(() => {
  cleanup();
  Element.prototype.scrollIntoView = scrollIntoView;
  vi.restoreAllMocks();
});

it.each(['en', 'vi'] as const)(
  'ends the %s keyboard property history session on blur even within 600ms',
  (locale) => {
    vi.spyOn(Date, 'now').mockReturnValue(1000);
    let history = createTreeHistory(state.document, 'heading');
    function Editor() {
      const [current, setCurrent] = useState(history.document);
      return (
        <PropertiesPanel
          state={{ document: current, selectedId: 'heading' }}
          locale={locale}
          onEdit={(operation, typing) => {
            const result = commitProperty(history, operation, typing);
            history = result.history;
            setCurrent(history.document);
            return result.error;
          }}
          onEndTyping={() => {
            history = endTreeTyping(history);
          }}
        />
      );
    }
    render(<Editor />);
    const input = screen.getByRole('textbox', { name: locale === 'vi' ? 'Văn bản' : 'Text' });
    fireEvent.change(input, { target: { value: 'First' } });
    fireEvent.blur(input);
    vi.mocked(Date.now).mockReturnValue(1100);
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'Second' } });
    expect(history.past).toHaveLength(2);
    const firstUndo = undoTreeHistory(history);
    expect(firstUndo.document.root.sections[0]!.content[0]!.responsive.base.text).toBe('First');
    expect(
      undoTreeHistory(firstUndo).document.root.sections[0]!.content[0]!.responsive.base.text,
    ).toBe('Hello');
  },
);

it.each(['en', 'vi'] as const)(
  'clears the %s invalid responsive input and error with the override',
  (locale) => {
    const initial: BuilderState = structuredClone(state);
    const heading = initial.document.root.sections[0]!.content[0]!;
    if (heading.type !== 'component') throw new Error('Expected heading');
    heading.responsive.mobile = { ...heading.responsive.mobile, level: 3 };
    const onEdit = vi.fn((operation: TreeOperation) => {
      if (operation.kind !== 'clear-override') return;
      delete heading.responsive.mobile?.level;
      return undefined;
    });
    const view = render(<PropertiesPanel state={initial} locale={locale} onEdit={onEdit} />);
    fireEvent.click(screen.getByRole('button', { name: locale === 'vi' ? 'Di động' : 'Mobile' }));
    const level = screen.getByRole('spinbutton', {
      name: locale === 'vi' ? 'Cấp tiêu đề' : 'Heading level',
    });
    fireEvent.change(level, { target: { value: '99' } });
    expect(level).toHaveValue(99);
    expect(level).toHaveAttribute('aria-invalid', 'true');
    fireEvent.click(
      screen.getByRole('button', {
        name: new RegExp(
          locale === 'vi' ? 'Xóa ghi đè.*Cấp tiêu đề' : 'Clear override.*Heading level',
        ),
      }),
    );
    view.rerender(<PropertiesPanel state={{ ...initial }} locale={locale} onEdit={onEdit} />);
    expect(level).toHaveValue(2);
    expect(level).toHaveAttribute('aria-invalid', 'false');
    expect(screen.queryByRole('alert')).toBeNull();
  },
);

it('uses localized labels and submits base, mobile and clear-override operations', () => {
  const onEdit = vi.fn();
  render(<PropertiesPanel state={state} locale="vi" onEdit={onEdit} />);
  fireEvent.change(screen.getByRole('textbox', { name: 'Văn bản' }), {
    target: { value: 'Xin chào' },
  });
  expect(onEdit).toHaveBeenCalledWith(
    expect.objectContaining({ breakpoint: 'base', key: 'text', value: 'Xin chào' }),
    true,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Di động' }));
  expect(screen.getByRole('textbox', { name: 'Văn bản' })).toHaveValue('Small hello');
  fireEvent.click(screen.getByRole('button', { name: /Xóa ghi đè.*Văn bản/ }));
  expect(onEdit).toHaveBeenCalledWith(
    expect.objectContaining({ kind: 'clear-override', breakpoint: 'mobile', key: 'text' }),
  );
  expect(screen.queryByText('Inherited from base')).toBeNull();
});

it('names spacer choices in the selected UI locale without changing their stored value', () => {
  const spacer: BuilderState = {
    selectedId: 'spacer',
    document: {
      schemaVersion: 1,
      root: {
        id: 'page',
        type: 'page',
        responsive: { base: {} },
        sections: [
          {
            id: 'section',
            type: 'section',
            responsive: { base: {} },
            content: [
              {
                id: 'spacer',
                type: 'component',
                componentType: 'spacer',
                responsive: { base: { size: 'sm' } },
              },
            ],
          },
        ],
      },
    },
  };
  render(<PropertiesPanel state={spacer} locale="vi" onEdit={vi.fn()} />);
  fireEvent.click(screen.getByRole('combobox', { name: 'Khoảng cách' }));
  expect(screen.getByRole('option', { name: 'Nhỏ' })).toBeInTheDocument();
  expect(screen.getByRole('option', { name: 'Vừa' })).toBeInTheDocument();
  expect(screen.getByRole('option', { name: 'Lớn' })).toBeInTheDocument();
  cleanup();
  render(<PropertiesPanel state={spacer} locale="en" onEdit={vi.fn()} />);
  fireEvent.click(screen.getByRole('combobox', { name: 'Spacing' }));
  expect(screen.getByRole('option', { name: 'Small' })).toBeInTheDocument();
  expect(screen.getByRole('option', { name: 'Medium' })).toBeInTheDocument();
  expect(screen.getByRole('option', { name: 'Large' })).toBeInTheDocument();
});

function hostState(type: string, base: Record<string, unknown>): BuilderState {
  return {
    selectedId: 'block',
    document: {
      schemaVersion: 1,
      root: {
        id: 'page',
        type: 'page',
        responsive: { base: {} },
        sections: [
          {
            id: 'section',
            type: 'section',
            responsive: { base: {} },
            content: [
              {
                id: 'block',
                type: 'component',
                componentType: type,
                responsive: {
                  base: base as Extract<TreeNode, { type: 'component' }>['responsive']['base'],
                },
              },
            ],
          },
        ],
      },
    },
  };
}

const definitions = Object.values(BLOCK_REGISTRY);

it('registers exactly the twenty host definitions and derives editable EN/VI controls for each', () => {
  expect(definitions).toHaveLength(20);
  for (const definition of definitions) {
    expect(builderRegistry[definition.type]?.props).toBe(definition.props);
    for (const locale of ['en', 'vi'] as const) {
      const fields = propertyFields(definition.props, locale);
      expect(fields.length, `${definition.type}/${locale}`).toBeGreaterThan(0);
      expect(fields.every((field) => field.label.length > 0)).toBe(true);
    }
  }
});

it.each(
  definitions.flatMap((definition) =>
    (['en', 'vi'] as const).map((locale) => ({ definition, locale })),
  ),
)(
  'edits $definition.type in $locale through its real registry schema without losing data',
  ({ definition, locale }) => {
    const base = definition.props.parse(definition.defaults) as Record<string, unknown>;
    const initial = hostState(definition.type, base);
    expect(readTree(initial.document, builderRegistry).ok).toBe(true);
    let updated: TreeDocument | undefined;
    const onEdit = vi.fn((operation: TreeOperation) => {
      const result = applyTreeOperation(initial.document, operation, builderRegistry);
      if (!result.ok) return result.code;
      updated = result.value;
    });
    render(<PropertiesPanel state={initial} locale={locale} onEdit={onEdit} />);
    const fields = propertyFields(definition.props, locale);
    const available = fields.find((field) => Object.hasOwn(base, field.path.split('.')[0]!));
    if (!available || definition.type === 'featured-case') {
      if (definition.type === 'featured-case') {
        fireEvent.change(
          screen.getByRole('spinbutton', { name: locale === 'en' ? 'Project ID' : 'ID dự án' }),
          {
            target: { value: '12' },
          },
        );
      } else {
        fireEvent.click(
          screen.getByRole('button', {
            name: locale === 'en' ? 'Add · Heading' : 'Thêm · Tiêu đề mục',
          }),
        );
        fireEvent.change(
          screen.getByRole('textbox', {
            name:
              locale === 'en' ? 'Heading · Title · English' : 'Tiêu đề mục · Tiêu đề · Tiếng Anh',
          }),
          {
            target: { value: 'A new section' },
          },
        );
      }
    } else {
      const field = available;
      const name = `${field.label}${['localized-text', 'localized-textarea', 'markdown'].includes(field.kind) ? ` · ${locale === 'en' ? 'English' : 'Tiếng Anh'}` : ''}`;
      if (field.kind === 'switch') fireEvent.click(screen.getByRole('switch', { name }));
      else if (field.kind === 'select') {
        fireEvent.click(screen.getByRole('combobox', { name }));
        fireEvent.click(screen.getAllByRole('option').at(-1)!);
      } else if (field.kind === 'array') {
        fireEvent.change(screen.getByRole('textbox', { name }), { target: { value: '12, 13' } });
      } else if (field.kind === 'number') {
        fireEvent.change(screen.getByRole('spinbutton', { name }), { target: { value: '2' } });
      } else {
        fireEvent.change(screen.getByRole('textbox', { name }), { target: { value: 'New copy' } });
      }
    }
    expect(onEdit, definition.type).toHaveBeenCalled();
    expect(updated, definition.type).toBeDefined();
    expect(readTree(updated, builderRegistry).ok).toBe(true);
    const actual = (
      updated!.root.sections[0]!.content[0] as { responsive: { base: Record<string, unknown> } }
    ).responsive.base;
    const changedKey = (onEdit.mock.calls[0]![0] as TreeOperation & { key: string }).key;
    expect(
      Object.fromEntries(Object.entries(actual).filter(([key]) => key !== changedKey)),
    ).toEqual(Object.fromEntries(Object.entries(base).filter(([key]) => key !== changedKey)));
  },
);

it('preserves nested siblings while editing VI copy and clearing a desktop override', () => {
  const base = BLOCK_REGISTRY.hero.props.parse(BLOCK_REGISTRY.hero.defaults);
  const initial = hostState('hero', base);
  const onEdit = vi.fn();
  render(<PropertiesPanel state={initial} locale="vi" onEdit={onEdit} />);
  fireEvent.change(screen.getByRole('textbox', { name: 'Hành động chính · Nhãn · Tiếng Việt' }), {
    target: { value: 'Xem dự án' },
  });
  expect(onEdit).toHaveBeenCalledWith(
    expect.objectContaining({
      breakpoint: 'base',
      key: 'primaryCta',
      value: {
        label: { en: base.primaryCta.label.en, vi: 'Xem dự án' },
        href: base.primaryCta.href,
      },
    }),
    true,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Máy tính bàn' }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Hành động chính · Nhãn · Tiếng Việt' }), {
    target: { value: 'Desktop' },
  });
  expect(onEdit).toHaveBeenCalledWith(
    expect.objectContaining({ breakpoint: 'desktop', key: 'primaryCta' }),
    true,
  );
});

it('keeps invalid partial values visible without dispatching and allows keyboard corrections', () => {
  const initial = hostState(
    'case-grid',
    BLOCK_REGISTRY['case-grid'].props.parse(BLOCK_REGISTRY['case-grid'].defaults),
  );
  const onEdit = vi.fn();
  render(<PropertiesPanel state={initial} locale="en" onEdit={onEdit} />);
  const ids = screen.getByRole('textbox', { name: 'Project IDs' });
  fireEvent.change(ids, { target: { value: '1,not-a-number' } });
  expect(ids).toHaveAttribute('aria-invalid', 'true');
  expect(ids).toHaveValue('1,not-a-number');
  expect(onEdit).not.toHaveBeenCalled();
  fireEvent.change(ids, { target: { value: '1,,2' } });
  expect(onEdit).not.toHaveBeenCalled();
  fireEvent.keyDown(ids, { key: 'Tab' });
  fireEvent.change(ids, { target: { value: '1, 2' } });
  expect(onEdit).toHaveBeenCalledWith(
    expect.objectContaining({ key: 'projectIds', value: [1, 2] }),
    true,
  );
});

it('retains an invalid partial edit across breakpoint, node and sheet remounts', () => {
  const initial = hostState(
    'case-grid',
    BLOCK_REGISTRY['case-grid'].props.parse(BLOCK_REGISTRY['case-grid'].defaults),
  );
  initial.document.root.sections[0]!.content.push({
    id: 'other',
    type: 'component',
    componentType: 'heading',
    responsive: { base: { text: 'Other', level: 2 } },
  });
  const drafts = new Map<string, PropertyDraft>();
  const onEdit = vi.fn();
  const props = { locale: 'en' as const, onEdit, pageKey: 'draft-page', propertyDrafts: drafts };
  const view = render(<PropertiesPanel state={initial} {...props} />);
  const ids = screen.getByRole('textbox', { name: 'Project IDs' });
  fireEvent.change(ids, { target: { value: '1,not-a-number' } });
  expect(ids).toHaveAttribute('aria-invalid', 'true');
  expect(onEdit).not.toHaveBeenCalled();

  fireEvent.click(screen.getByRole('button', { name: 'Mobile' }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Project IDs' }), {
    target: { value: '3,not-a-number' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Base' }));
  expect(screen.getByRole('textbox', { name: 'Project IDs' })).toHaveValue('1,not-a-number');
  fireEvent.click(screen.getByRole('button', { name: 'Mobile' }));
  expect(screen.getByRole('textbox', { name: 'Project IDs' })).toHaveValue('3,not-a-number');
  fireEvent.click(screen.getByRole('button', { name: 'Base' }));
  view.rerender(<PropertiesPanel state={{ ...initial, selectedId: 'other' }} {...props} />);
  view.rerender(<PropertiesPanel state={initial} {...props} />);
  expect(screen.getByRole('textbox', { name: 'Project IDs' })).toHaveAttribute(
    'aria-invalid',
    'true',
  );

  view.unmount();
  render(<PropertiesPanel state={initial} {...props} />);
  expect(screen.getByRole('textbox', { name: 'Project IDs' })).toHaveValue('1,not-a-number');
  expect(onEdit).not.toHaveBeenCalled();
  fireEvent.change(screen.getByRole('textbox', { name: 'Project IDs' }), {
    target: { value: '1, 2' },
  });
  expect(onEdit).toHaveBeenCalledWith(
    expect.objectContaining({ key: 'projectIds', value: [1, 2] }),
    true,
  );
});

it('edits a switch from the keyboard and clears inherited responsive values without changing base', async () => {
  const user = userEvent.setup();
  const initial = hostState(
    'projects-browser',
    BLOCK_REGISTRY['projects-browser'].props.parse(BLOCK_REGISTRY['projects-browser'].defaults),
  );
  const node = initial.document.root.sections[0]!.content[0]!;
  node.responsive.mobile = { showFeatured: false };
  const onEdit = vi.fn();
  render(<PropertiesPanel state={initial} locale="en" onEdit={onEdit} />);
  const toggle = screen.getByRole('switch', { name: 'Show featured' });
  toggle.focus();
  await user.keyboard('[Space]');
  expect(onEdit).toHaveBeenCalledWith(
    expect.objectContaining({ kind: 'property', breakpoint: 'base', value: false }),
    false,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Mobile' }));
  expect(screen.getByRole('switch', { name: 'Show featured' })).not.toBeChecked();
  fireEvent.click(screen.getByRole('button', { name: 'Clear override · Show featured' }));
  expect(onEdit).toHaveBeenCalledWith(
    expect.objectContaining({ kind: 'clear-override', breakpoint: 'mobile', key: 'showFeatured' }),
  );
  for (const breakpoint of ['Tablet', 'Desktop'] as const) {
    fireEvent.click(screen.getByRole('button', { name: breakpoint }));
    expect(screen.getAllByText('Inherited from base').length).toBeGreaterThan(0);
  }
});
