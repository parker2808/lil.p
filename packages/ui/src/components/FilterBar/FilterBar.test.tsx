import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { FilterBar } from './FilterBar';

describe('FilterBar', () => {
  it('removes a chip and offers add-filter options', async () => {
    const onRemoveChip = vi.fn();
    const onAddFilter = vi.fn();
    render(
      <FilterBar
        q=""
        onQChange={vi.fn()}
        placeholder="Filter projects"
        chips={[{ id: 'status', label: 'Status is Published' }]}
        onRemoveChip={onRemoveChip}
        filters={[{ id: 'status', label: 'Status' }]}
        onAddFilter={onAddFilter}
        labels={{ add: '+ Filter', remove: '×' }}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: '×' }));
    expect(onRemoveChip).toHaveBeenCalledWith('status');

    await userEvent.click(screen.getByRole('button', { name: '+ Filter' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Status' }));
    expect(onAddFilter).toHaveBeenCalledWith('status');
  });
});
