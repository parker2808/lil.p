import { cn } from '@portfolio/ui/lib/utils';
import type { ComponentProps } from 'react';

export function Band({
  labelledBy,
  className,
  ...props
}: ComponentProps<'section'> & { labelledBy?: string }) {
  return (
    <section
      data-slot="band"
      aria-labelledby={labelledBy}
      className={cn('bg-band border-y', className)}
      {...props}
    />
  );
}
