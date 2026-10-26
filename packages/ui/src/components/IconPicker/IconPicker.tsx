'use client';

import { ICON_KEYS, type IconKey } from '@portfolio/contracts';
import { Icon } from '@portfolio/ui/components/Icon/Icon';
import { Button } from '@portfolio/ui/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@portfolio/ui/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@portfolio/ui/components/ui/popover';
import { useState } from 'react';

export function IconPicker({
  value,
  onChange,
  labels,
}: {
  value: IconKey | '';
  onChange: (value: IconKey) => void;
  labels: { open: string; search: string; empty: string };
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm" aria-label={labels.open}>
          {value ? <Icon name={value} className="size-4" /> : null}
          {value || labels.open}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <Command>
          <CommandInput placeholder={labels.search} />
          <CommandList>
            <CommandEmpty>{labels.empty}</CommandEmpty>
            {ICON_KEYS.map((key) => (
              <CommandItem
                key={key}
                value={key}
                onSelect={() => {
                  onChange(key);
                  setOpen(false);
                }}
              >
                <Icon name={key} className="size-4" />
                {key}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
