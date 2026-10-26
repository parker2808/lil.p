import { cn } from '@portfolio/ui/lib/utils';
import type { ComponentProps } from 'react';

export function InputGroup({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="input-group"
      className={cn('relative flex w-full items-center', className)}
      {...props}
    />
  );
}

export function InputGroupAddon({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="input-group-addon"
      className={cn(
        'text-muted-foreground pointer-events-none absolute right-2 flex items-center gap-1',
        className,
      )}
      {...props}
    />
  );
}
