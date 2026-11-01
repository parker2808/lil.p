'use client';

import { Badge } from '@portfolio/ui/components/ui/badge';
import { Button } from '@portfolio/ui/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@portfolio/ui/components/ui/dropdown-menu';
import { Input } from '@portfolio/ui/components/ui/input';
import type { FormEvent } from 'react';

export type FilterChip = {
  id: string;
  label: string;
};

export type FilterOption = {
  id: string;
  label: string;
};

export function FilterBar({
  q,
  onQChange,
  placeholder,
  chips,
  onRemoveChip,
  filters,
  onAddFilter,
  labels,
}: {
  q: string;
  onQChange: (value: string) => void;
  placeholder: string;
  chips: FilterChip[];
  onRemoveChip: (id: string) => void;
  filters: FilterOption[];
  onAddFilter: (id: string) => void;
  labels: { add: string; remove: string };
}) {
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onQChange(String(data.get('q') ?? ''));
  }

  return (
    <div data-slot="filter-bar" className="flex flex-wrap items-center gap-2">
      <form onSubmit={onSubmit}>
        <Input
          name="q"
          aria-label={placeholder}
          defaultValue={q}
          placeholder={placeholder}
          className="w-56"
          onBlur={(event) => onQChange(event.target.value)}
        />
      </form>
      {chips.map((chip) => (
        <Badge key={chip.id} variant="outline" className="normal-case">
          {chip.label}
          <button type="button" className="text-ui-meta ml-1" onClick={() => onRemoveChip(chip.id)}>
            {labels.remove}
          </button>
        </Badge>
      ))}
      {filters.length > 0 ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="sm">
              {labels.add}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {filters.map((filter) => (
              <DropdownMenuItem key={filter.id} onSelect={() => onAddFilter(filter.id)}>
                {filter.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  );
}
