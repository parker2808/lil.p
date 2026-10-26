import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SortableList } from './SortableList';

const labels = {
  handle: 'Drag to reorder',
  instructions: 'Press Space to pick up, arrows to move, Space to drop, Escape to cancel.',
  pickedUp: 'Picked up {id}',
  movedOver: 'Moved {id} over {over}',
  dropped: 'Dropped {id} on {over}',
  cancelled: 'Cancelled {id}',
};

describe('SortableList', () => {
  it('exposes a drag handle only on unlocked rows', () => {
    render(
      <SortableList
        items={[{ id: 'hero', disabled: true }, { id: 'work' }]}
        labels={labels}
        onReorder={() => undefined}
      >
        {(item, handle) => (
          <div>
            {handle}
            <span>{item.id}</span>
          </div>
        )}
      </SortableList>,
    );
    expect(screen.getByLabelText(labels.handle)).toBeInTheDocument();
    expect(document.body.textContent).toContain(labels.instructions);
    expect(screen.getAllByLabelText(labels.handle)).toHaveLength(1);
  });
});
