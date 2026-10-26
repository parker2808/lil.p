import { cn } from '@portfolio/ui/lib/utils';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import type { ReactNode } from 'react';

export type StatCardDelta = {
  direction: 'up' | 'down' | 'flat';
  text: string;
};

const DELTA_ICON = {
  up: ArrowUp,
  down: ArrowDown,
  flat: Minus,
} as const;

export function StatCard({
  label,
  value,
  delta,
  sparkline,
  className,
}: {
  label: string;
  value: string | number;
  delta?: StatCardDelta;
  sparkline?: ReactNode;
  className?: string;
}): ReactNode {
  const Icon = delta ? DELTA_ICON[delta.direction] : null;

  return (
    <div
      data-slot="stat-card"
      className={cn('bg-card text-card-foreground rounded-lg border p-4', className)}
    >
      <p className="text-ui-meta text-muted-foreground">{label}</p>
      <p className="text-heading font-semibold tabular-nums">{value}</p>
      {delta && Icon ? (
        <p className="text-ui-meta text-muted-foreground mt-1 flex items-center gap-1">
          <Icon aria-hidden className="size-3.5 shrink-0" />
          <span>{delta.text}</span>
        </p>
      ) : null}
      {sparkline ? <div className="text-chart-1 mt-3">{sparkline}</div> : null}
    </div>
  );
}
