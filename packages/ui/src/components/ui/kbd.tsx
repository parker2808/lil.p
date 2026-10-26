import { cn } from '@portfolio/ui/lib/utils';
import type { ComponentProps } from 'react';

export function Kbd({ className, ...props }: ComponentProps<'kbd'>) {
  return (
    <kbd
      data-slot="kbd"
      className={cn('bg-muted text-ui-meta rounded-sm border px-1.5 py-0.5 font-mono', className)}
      {...props}
    />
  );
}
