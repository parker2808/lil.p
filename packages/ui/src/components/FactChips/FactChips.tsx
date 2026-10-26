import { cn } from '@portfolio/ui/lib/utils';

export function FactChips({ chips, className }: { chips: string[]; className?: string }) {
  if (chips.length < 1) {
    return null;
  }

  return (
    <ul data-slot="fact-chips" className={cn('flex flex-wrap gap-2', className)}>
      {chips.map((chip) => (
        <li
          key={chip}
          className="text-meta text-muted-foreground bg-muted inline-flex h-7 items-center rounded-md px-2.5 font-mono"
        >
          {chip}
        </li>
      ))}
    </ul>
  );
}
