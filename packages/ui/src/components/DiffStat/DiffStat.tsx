import { cn } from '@portfolio/ui/lib/utils';

const PLUS = '+';
const MINUS = '−';

export function DiffStat({
  value,
  label,
  before,
  after,
  className,
}: {
  value?: string;
  label?: string;
  before?: string | null;
  after?: string | null;
  className?: string;
}) {
  const isDiff = Boolean(before || after);

  if (!isDiff && !value && !label) {
    return null;
  }

  return (
    <p data-slot="diff-stat" className={cn('text-meta font-mono tabular-nums', className)}>
      {isDiff ? (
        <span className="inline-flex flex-wrap items-baseline gap-2">
          {before ? (
            <span className="inline-flex items-baseline gap-1">
              <span aria-hidden className="text-destructive">
                {MINUS}
              </span>
              <span>{before}</span>
            </span>
          ) : null}
          {before && after ? <span aria-hidden>→</span> : null}
          {after ? (
            <span className="inline-flex items-baseline gap-1">
              <span aria-hidden className="text-success">
                {PLUS}
              </span>
              <span>{after}</span>
            </span>
          ) : null}
          {label ? <span className="text-subtle-foreground">{label}</span> : null}
        </span>
      ) : (
        <span className="inline-flex items-baseline gap-1">
          {value ? <span className="text-foreground">{value}</span> : null}
          {label ? <span className="text-subtle-foreground">{label}</span> : null}
        </span>
      )}
    </p>
  );
}
