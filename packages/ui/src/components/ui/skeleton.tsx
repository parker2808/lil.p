import { cn } from '@portfolio/ui/lib/utils';
import type { ComponentProps } from 'react';

export function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden
      className={cn('redesign-skeleton', 'bg-muted rounded-md', className)}
      {...props}
    />
  );
}
