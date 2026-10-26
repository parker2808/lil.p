import type { AdminNavItem } from '@portfolio/contracts';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { NavTable } from './NavTable';

const items: AdminNavItem[] = [
  {
    id: 1,
    location: 'HEADER',
    labelEn: 'Home',
    labelVi: '',
    href: '/',
    sortOrder: 0,
    isVisible: true,
    updatedAt: 't',
  },
  {
    id: 2,
    location: 'HEADER',
    labelEn: 'About',
    labelVi: '',
    href: '/about',
    sortOrder: 1,
    isVisible: true,
    updatedAt: 't',
  },
];

describe('NavTable', () => {
  it('asks the parent to move a row so the order endpoint can run', async () => {
    const onMove = vi.fn();
    render(
      <NavTable
        items={items}
        readOnly={false}
        labels={{
          label: 'Label',
          href: 'Href',
          custom: 'Custom URL',
          moveUp: 'Move up',
          moveDown: 'Move down',
        }}
        onLabelChange={vi.fn()}
        onHrefChange={vi.fn()}
        onMove={onMove}
      />,
    );
    await userEvent.click(screen.getAllByRole('button', { name: 'Move down' })[0]!);
    expect(onMove).toHaveBeenCalledWith(1, 1);
  });
});
