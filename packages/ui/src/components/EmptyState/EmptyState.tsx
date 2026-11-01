import { cn } from '@portfolio/ui/lib/utils';
import type { ReactNode } from 'react';

export function EmptyState({
  title,
  description,
  glyph,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  glyph?: ReactNode;
  action?: ReactNode;
  className?: string;
}): ReactNode {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        'redesign-empty-state flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center',
        className,
      )}
    >
      {glyph ? (
        <span aria-hidden className="redesign-empty-state-glyph">
          {glyph}
        </span>
      ) : null}
      <p className="text-body font-semibold">{title}</p>
      {description ? (
        <p className="text-ui text-muted-foreground max-w-[40ch]">{description}</p>
      ) : null}
      {action}
    </div>
  );
}
