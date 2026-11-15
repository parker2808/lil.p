import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import type { BuilderState } from '../canvas/commands';
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
