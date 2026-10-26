import { Icon } from '@portfolio/ui/components/Icon/Icon';
import { cn } from '@portfolio/ui/lib/utils';
import type { ReactNode } from 'react';

export function Callout({
  kind,
  title,
  children,
  className,
}: {
  kind: 'NOTE' | 'WARNING';
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <aside
      data-slot="callout"
      data-kind={kind}
      className={cn(
        'border-border bg-card my-6 flex gap-3 rounded-lg border p-4',
        kind === 'WARNING' && 'border-warning/40 bg-warning-subtle',
        className,
      )}
    >
      <span className="bg-muted text-primary inline-flex size-7 shrink-0 items-center justify-center rounded-md">
        <Icon name={kind === 'WARNING' ? 'shield' : 'lightbulb'} className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-eyebrow font-mono uppercase">{title}</p>
        <div className="text-body mt-1">{children}</div>
      </div>
    </aside>
  );
}
