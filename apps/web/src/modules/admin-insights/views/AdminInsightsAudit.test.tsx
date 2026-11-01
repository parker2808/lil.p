import type { AdminAuditLog } from '@portfolio/contracts';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ComponentProps } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import en from '../../../../i18n/locales/en.json';
import { AuditTable } from './AdminInsightsAudit';

function item(id: number): AdminAuditLog {
  return {
    id,
    userId: 1,
    userName: 'Admin',
    action: 'UPDATE',
    entityType: 'project',
    entityId: String(id),
    summary: `Updated project ${id}`,
    createdAt: '2026-10-26T12:00:00.000Z',
  };
}

function renderTable(props: Partial<ComponentProps<typeof AuditTable>> = {}) {
  const handlers = { onLoadMore: vi.fn(), onRetry: vi.fn() };
  render(
    <NextIntlClientProvider locale="en" messages={en}>
      <AuditTable items={[item(1), item(2)]} {...handlers} {...props} />
    </NextIntlClientProvider>,
  );
  return handlers;
}

afterEach(cleanup);

describe('AuditTable', () => {
  it('renders audit entries in the shared admin table', () => {
    renderTable();
    const table = screen.getByRole('table', { name: 'Audit log' });
    expect(table.closest('[data-slot="admin-table"]')).not.toBeNull();
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((cell) => cell.textContent),
    ).toEqual(['Action', 'Summary', 'User', 'When']);
    expect(within(table).getByText('Updated project 2')).toBeInTheDocument();
    expect(within(table).queryAllByRole('link')).toHaveLength(0);
  });

  it('keeps the scroll region keyboard focusable although rows have no links', () => {
    renderTable();
    expect(screen.getByRole('region', { name: 'Audit log' })).toHaveAttribute('tabindex', '0');
  });

  it('loads the next page from a button', () => {
    const { onLoadMore } = renderTable({ hasNextPage: true });
    fireEvent.click(screen.getByRole('button', { name: 'Load more' }));
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it('shows the empty and error states inside the table', () => {
    renderTable({ items: [] });
    expect(screen.getByText('No activity yet.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Load more' })).not.toBeInTheDocument();
    cleanup();

    const { onRetry } = renderTable({ isError: true });
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
