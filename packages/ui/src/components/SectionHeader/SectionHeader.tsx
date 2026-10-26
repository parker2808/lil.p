import { Icon } from '@portfolio/ui/components/Icon/Icon';
import { cn } from '@portfolio/ui/lib/utils';
import type { ReactNode } from 'react';

export function SectionHeader({
  id,
  title,
  intro,
  iconKey,
  action,
  className,
}: {
  id?: string;
  title: string;
  intro?: string;
  iconKey?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn('flex flex-col gap-3 md:flex-row md:items-end md:justify-between', className)}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          {iconKey ? (
            <span className="bg-muted text-primary inline-flex size-7 items-center justify-center rounded-md">
              <Icon name={iconKey} className="size-4" />
            </span>
          ) : null}
          <h2 id={id} className="font-heading text-heading font-semibold">
            {title}
          </h2>
        </div>
        {intro ? <p className="text-body text-muted-foreground max-w-prose">{intro}</p> : null}
      </div>
      {action}
    </div>
  );
}
