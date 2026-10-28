import type { PublicProfileStat } from '@portfolio/contracts';
import { Icon } from '@portfolio/ui/components/Icon/Icon';
import { cn } from '@portfolio/ui/lib/utils';
import { parseStatValue } from '@portfolio/ui/utils/parse-stat-value.util';

function StatItem({ stat, compact }: { stat: PublicProfileStat; compact: boolean }) {
  const { display } = parseStatValue(stat.value, stat.suffix);
  const name = `${display} ${stat.label}`;

  return (
    <div data-slot="stat-item" role="group" aria-label={name} className="flex flex-col gap-2">
      <span className="bg-muted text-primary inline-flex size-10 items-center justify-center rounded-md">
        <Icon name={stat.iconKey} className={compact ? 'size-4' : 'size-5'} />
      </span>
      <span
        aria-hidden
        className={cn(
          'font-heading text-primary font-bold tabular-nums',
          compact ? 'text-heading' : 'text-title',
        )}
        style={{ minWidth: `${display.length}ch` }}
      >
        {display}
      </span>
      <span aria-hidden className="text-eyebrow text-muted-foreground font-mono uppercase">
        {stat.label}
      </span>
    </div>
  );
}

export function StatBand({
  stats,
  variant = 'default',
  className,
}: {
  stats: PublicProfileStat[];
  variant?: 'default' | 'compact';
  className?: string;
}) {
  stats = stats.filter((stat) => !/^0(?:[.,]0+)?$/.test(String(stat.value).trim()));
  if (stats.length < 2) {
    return null;
  }

  return (
    <div
      data-slot="stat-band"
      data-variant={variant}
      className={cn(
        'grid grid-cols-2 gap-x-4 gap-y-6',
        variant === 'compact' ? 'md:grid-cols-4' : 'md:grid-cols-4 md:gap-6',
        className,
      )}
    >
      {stats.map((stat) => (
        <StatItem key={stat.id} stat={stat} compact={variant === 'compact'} />
      ))}
    </div>
  );
}
