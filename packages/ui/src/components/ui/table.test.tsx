import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';

const redesignCss = resolve(dirname(fileURLToPath(import.meta.url)), '../../styles/redesign.css');

function renderTable(head: ReactNode, cell: ReactNode) {
  render(
    <Table>
      <TableHeader>
        <TableRow>{head}</TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>{cell}</TableRow>
      </TableBody>
    </Table>,
  );
}

describe('Table variants', () => {
  it('keeps the plain head and default cell padding without variants', () => {
    renderTable(<TableHead>Name</TableHead>, <TableCell>Row</TableCell>);

    const head = screen.getByRole('columnheader', { name: 'Name' });
    expect(head).toHaveClass('text-ui-meta');
    expect(head).not.toHaveClass('uppercase');
    expect(head).not.toHaveClass('bg-muted');
    const cell = screen.getByRole('cell', { name: 'Row' });
    expect(cell).toHaveClass('px-3');
    expect(cell).not.toHaveClass('py-3');
  });

  it('applies the muted surface and comfortable density', () => {
    renderTable(
      <TableHead surface="muted">Name</TableHead>,
      <TableCell density="comfortable">Row</TableCell>,
    );

    const head = screen.getByRole('columnheader', { name: 'Name' });
    expect(head).toHaveClass('bg-muted', 'uppercase', 'text-[11px]', 'tracking-[0.06em]');
    expect(head).not.toHaveClass('text-ui-meta');
    expect(screen.getByRole('cell', { name: 'Row' })).toHaveClass('px-3', 'py-3');
  });

  it('lets a flush cell drop padding and className override density padding', () => {
    renderTable(
      <TableHead>Name</TableHead>,
      <>
        <TableCell density="flush">Linked</TableCell>
        <TableCell density="comfortable" className="px-4 py-8">
          Status
        </TableCell>
      </>,
    );

    const linked = screen.getByRole('cell', { name: 'Linked' });
    expect(linked).toHaveClass('p-0');
    expect(linked).not.toHaveClass('px-3');
    const status = screen.getByRole('cell', { name: 'Status' });
    expect(status).toHaveClass('px-4', 'py-8');
    expect(status).not.toHaveClass('px-3');
    expect(status).not.toHaveClass('py-3');
  });

  it('leaves no table or input slot overrides in redesign.css', () => {
    const css = readFileSync(redesignCss, 'utf8');
    expect(css).not.toMatch(/\[data-slot=['"]?(table|table-[a-z-]+|input)['"]?\]/);
  });
});
