import { cn } from '@portfolio/ui/lib/utils';

export function VersionTag({
  from,
  to,
  arrowLabel,
  className,
}: {
  from: string;
  to: string;
  arrowLabel: string;
  className?: string;
}) {
  return (
    <span
      data-slot="version-tag"
      className={cn('text-meta inline-flex items-center gap-1 font-mono', className)}
    >
      <span>{from}</span>
      <span aria-label={arrowLabel}>→</span>
      <span>{to}</span>
    </span>
  );
}
