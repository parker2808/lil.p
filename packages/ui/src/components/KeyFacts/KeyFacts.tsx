import type { Hue } from '@portfolio/contracts';
import { cn } from '@portfolio/ui/lib/utils';
import { HUE_DOT } from '@portfolio/ui/utils/hue.util';

export function KeyFacts({
  facts,
  hue = 'AMBER',
  className,
}: {
  facts: string[];
  hue?: Hue;
  className?: string;
}) {
  if (facts.length < 2) {
    return null;
  }

  return (
    <ul data-slot="key-facts" className={cn('grid gap-3 sm:grid-cols-2', className)}>
      {facts.map((fact) => (
        <li key={fact} className="bg-card border-border flex gap-2.5 rounded-lg border px-4 py-3.5">
          <i aria-hidden className={cn('mt-1.5 size-2 shrink-0 rounded-full', HUE_DOT[hue])} />
          <span className="text-meta clamp-marks">{fact}</span>
        </li>
      ))}
    </ul>
  );
}
