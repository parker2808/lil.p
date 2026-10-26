'use client';

import type { AdminTag } from '@portfolio/contracts';
import { Badge } from '@portfolio/ui/components/ui/badge';
import { Button } from '@portfolio/ui/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@portfolio/ui/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@portfolio/ui/components/ui/popover';
import { useMemo, useState } from 'react';

export function TagPicker({
  tags,
  selectedIds,
  readOnly,
  labels,
  onChange,
  onCreate,
}: {
  tags: AdminTag[];
  selectedIds: number[];
  readOnly: boolean;
  labels: {
    open: string;
    search: string;
    empty: string;
    create: string;
    selected: string;
  };
  onChange: (ids: number[]) => void;
  onCreate: (name: string) => Promise<AdminTag | null>;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selected = new Set(selectedIds);
  const selectedTags = tags.filter((tag) => selected.has(tag.id));
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return tags;
    }
    return tags.filter(
      (tag) =>
        tag.nameEn.toLowerCase().includes(needle) ||
        tag.nameVi.toLowerCase().includes(needle) ||
        tag.slug.includes(needle),
    );
  }, [query, tags]);
  const canCreate =
    !readOnly &&
    query.trim().length > 0 &&
    !tags.some((tag) => tag.nameEn.toLowerCase() === query.trim().toLowerCase());

  function toggle(id: number) {
    if (readOnly) {
      return;
    }
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onChange([...next]);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {selectedTags.map((tag) => (
          <Badge key={tag.id} variant="primary" className="normal-case">
            {tag.nameEn}
          </Badge>
        ))}
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button type="button" size="sm" variant="outline" disabled={readOnly}>
            {labels.open}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-72 p-0">
          <Command>
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder={labels.search}
              aria-label={labels.search}
            />
            <CommandList>
              <CommandEmpty>{labels.empty}</CommandEmpty>
              {filtered.map((tag) => (
                <CommandItem key={tag.id} value={tag.nameEn} onSelect={() => toggle(tag.id)}>
                  {tag.nameEn}
                  {selected.has(tag.id) ? ` ${labels.selected}` : ''}
                </CommandItem>
              ))}
              {canCreate ? (
                <CommandItem
                  value={`create-${query}`}
                  onSelect={() => {
                    void onCreate(query.trim()).then((created) => {
                      if (created) {
                        onChange([...selectedIds, created.id]);
                        setQuery('');
                      }
                    });
                  }}
                >
                  {labels.create.replace('{name}', query.trim())}
                </CommandItem>
              ) : null}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
