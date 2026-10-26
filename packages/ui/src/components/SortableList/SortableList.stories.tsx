import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { SortableList } from './SortableList';

const labels = {
  handle: 'Drag to reorder',
  instructions:
    'Press Space to pick up an item, use the arrow keys to move it, then Space to drop. Escape cancels.',
  pickedUp: 'Picked up {id}',
  movedOver: 'Moved {id} over {over}',
  dropped: 'Dropped {id} on {over}',
  cancelled: 'Cancelled moving {id}',
};

function Demo({ locked }: { locked?: boolean }) {
  const [items, setItems] = useState([
    { id: 'hero', disabled: locked ?? true },
    { id: 'featured' },
    { id: 'work' },
  ]);
  return (
    <div className="max-w-md">
      <p className="text-ui-meta text-muted-foreground mb-3">{labels.instructions}</p>
      <SortableList
        items={items}
        labels={labels}
        onReorder={(ids) =>
          setItems((current) => ids.map((id) => current.find((item) => item.id === id) ?? { id }))
        }
      >
        {(item, handle) => (
          <div className="border-border flex items-center gap-2 rounded-md border p-2">
            {handle}
            <span className="text-ui">{item.id}</span>
          </div>
        )}
      </SortableList>
    </div>
  );
}

const meta = {
  title: 'Admin/SortableList',
  component: Demo,
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const KeyboardInstructions: Story = { args: {} };
export const Unlocked: Story = { args: { locked: false } };
