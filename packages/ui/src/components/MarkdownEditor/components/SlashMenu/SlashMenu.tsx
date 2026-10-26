'use client';

import {
  Command,
  CommandEmpty,
  CommandItem,
  CommandList,
} from '@portfolio/ui/components/ui/command';
import { forwardRef, useImperativeHandle, useState } from 'react';

export type SlashItem = {
  id: string;
  label: string;
  command: string;
};

export const SlashMenu = forwardRef<
  { onKeyDown: (props: { event: KeyboardEvent }) => boolean },
  {
    items: SlashItem[];
    command: (item: SlashItem) => void;
    empty: string;
  }
>(function SlashMenu({ items, command, empty }, ref) {
  const [index, setIndex] = useState(0);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowDown') {
        setIndex((value) => (value + 1) % Math.max(items.length, 1));
        return true;
      }
      if (event.key === 'ArrowUp') {
        setIndex((value) => (value - 1 + items.length) % Math.max(items.length, 1));
        return true;
      }
      if (event.key === 'Enter' && items[index]) {
        command(items[index]);
        return true;
      }
      return false;
    },
  }));

  return (
    <div className="z-dropdown border-border bg-popover shadow-2 w-56 overflow-hidden rounded-lg border">
      <Command>
        <CommandList>
          {items.length === 0 ? <CommandEmpty>{empty}</CommandEmpty> : null}
          {items.map((item, itemIndex) => (
            <CommandItem
              key={item.id}
              data-selected={itemIndex === index || undefined}
              onMouseDown={(event) => {
                event.preventDefault();
                command(item);
              }}
            >
              {item.label}
            </CommandItem>
          ))}
        </CommandList>
      </Command>
    </div>
  );
});
