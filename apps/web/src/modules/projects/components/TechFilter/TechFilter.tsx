'use client';

import type { PublicSkillChip } from '@portfolio/contracts';
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@portfolio/ui/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@portfolio/ui/components/ui/popover';
import { useRouter } from '@i18n/navigation';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

import { projectsHref } from '../../utils/projects-query.util';

export function TechFilter({
  skills,
  activeSlug,
  domain,
  labels,
}: {
  skills: PublicSkillChip[];
  activeSlug?: string;
  domain?: string;
  labels: { tech: string; any: string; empty: string; search: string };
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const selected = skills.find((skill) => skill.slug === activeSlug);
  const current = selected?.name ?? labels.any;

  function go(skill?: string) {
    router.push(projectsHref({ domain, skill }));
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        type="button"
        className="border-border bg-card text-meta hover:border-border-strong inline-flex shrink-0 items-center gap-2 rounded-md border px-2.5 py-1"
      >
        <span>{labels.tech}</span>
        <ChevronDown aria-hidden className="size-3.5" />
        <span>{current}</span>
      </PopoverTrigger>
      <PopoverContent>
        <Command>
          <CommandInput placeholder={labels.search} />
          <CommandList>
            <CommandEmpty>{labels.empty}</CommandEmpty>
            <CommandItem onSelect={() => go(undefined)}>{labels.any}</CommandItem>
            {skills.map((skill) => (
              <CommandItem key={skill.slug} onSelect={() => go(skill.slug)}>
                {skill.name}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
