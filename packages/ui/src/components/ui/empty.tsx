import { cn } from '@portfolio/ui/lib/utils';
import type { ComponentProps, ReactNode } from 'react';

export function Empty({
  icon,
  action,
  className,
  children,
  ...props
}: ComponentProps<'div'> & { icon?: ReactNode; action?: ReactNode }) {
  return (
    <div
      data-slot="empty"
      className={cn('flex flex-col items-center gap-3 py-10 text-center', className)}
      {...props}
    >
      {icon ? <div aria-hidden>{icon}</div> : null}
      <p className="text-body text-muted-foreground">{children}</p>
      {action}
    </div>
  );
}
