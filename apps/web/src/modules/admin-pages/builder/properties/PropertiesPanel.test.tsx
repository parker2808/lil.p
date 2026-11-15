import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { BLOCK_REGISTRY } from '@portfolio/contracts';
import type { TreeNode } from '@parker2808/cms-core/tree';

import type { BuilderState } from '../canvas/commands';
import { newNode } from '../palette/catalog';
import { PropertiesPanel } from './PropertiesPanel';

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
});

it.each(Object.keys(BLOCK_REGISTRY))('renders Properties for host component %s', (kind) => {
  const hostState: BuilderState = {
    selectedId: 'host',
    document: {
      ...state.document,
      root: {
        ...state.document.root,
        sections: [
          {
            ...state.document.root.sections[0]!,
            content: [
              newNode(kind as Parameters<typeof newNode>[0], () => 'host') as Extract<
                TreeNode,
                { type: 'component' }
              >,
            ],
          },
        ],
      },
    },
  };
  render(<PropertiesPanel state={hostState} locale="en" onEdit={vi.fn()} />);
  expect(screen.getByRole('group', { name: 'Breakpoint' })).toBeInTheDocument();
  cleanup();
});

it('shows the translated host name in the Properties heading', () => {
  const host = newNode('page-header', () => 'host') as Extract<TreeNode, { type: 'component' }>;
  const hostState: BuilderState = {
    selectedId: 'host',
    document: {
      ...state.document,
      root: {
        ...state.document.root,
        sections: [{ ...state.document.root.sections[0]!, content: [host] }],
      },
    },
  };
  render(
    <PropertiesPanel
      state={hostState}
      locale="vi"
      onEdit={vi.fn()}
      hostLabel={() => 'Đầu trang'}
    />,
  );
  expect(screen.getByText('Đầu trang')).toBeInTheDocument();
  expect(screen.queryByText('page-header')).toBeNull();
});

it('submits bilingual nested host values as one validated root property', () => {
  const onEdit = vi.fn();
  const host = newNode('hero', () => 'host') as Extract<TreeNode, { type: 'component' }>;
  const hostState: BuilderState = {
    selectedId: 'host',
    document: {
      ...state.document,
      root: {
        ...state.document.root,
        sections: [{ ...state.document.root.sections[0]!, content: [host] }],
      },
    },
  };
  render(<PropertiesPanel state={hostState} locale="en" onEdit={onEdit} />);
  fireEvent.change(screen.getByRole('textbox', { name: 'primaryCta label (VI)' }), {
    target: { value: 'Dự án' },
  });
  expect(onEdit).toHaveBeenCalledWith(
    expect.objectContaining({
      key: 'primaryCta',
      value: { label: { en: 'View case studies', vi: 'Dự án' }, href: '/projects' },
    }),
    true,
  );
});

it('offers valid optional bilingual heading for a host with empty defaults', () => {
  const onEdit = vi.fn();
  const host = newNode('cv-download', () => 'host') as Extract<TreeNode, { type: 'component' }>;
  const hostState: BuilderState = {
    selectedId: 'host',
    document: {
      ...state.document,
      root: {
        ...state.document.root,
        sections: [{ ...state.document.root.sections[0]!, content: [host] }],
      },
    },
  };
  render(<PropertiesPanel state={hostState} locale="en" onEdit={onEdit} />);
  fireEvent.click(screen.getByRole('button', { name: 'Add heading' }));
  expect(onEdit).toHaveBeenCalledWith(
    expect.objectContaining({
      key: 'heading',
      value: { title: { en: 'Section heading', vi: 'Tiêu đề mục' } },
    }),
  );
});

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
