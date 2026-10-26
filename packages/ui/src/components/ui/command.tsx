'use client';

import { cn } from '@portfolio/ui/lib/utils';
import { Command as CommandPrimitive } from 'cmdk';
import type { ComponentProps } from 'react';

export function Command({ className, ...props }: ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        'bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden',
        className,
      )}
      {...props}
    />
  );
}

export function CommandInput({
  className,
  ...props
}: ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div className="border-border border-b px-2 py-1.5" data-slot="command-input-wrap">
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          'text-ui placeholder:text-muted-foreground flex h-8 w-full bg-transparent outline-none',
          className,
        )}
        {...props}
      />
    </div>
  );
}

export function CommandList({ className, ...props }: ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn('max-h-64 overflow-y-auto p-1', className)}
      {...props}
    />
  );
}

export function CommandEmpty({
  className,
  ...props
}: ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className={cn('text-meta text-muted-foreground px-2 py-4 text-center', className)}
      {...props}
    />
  );
}

export function CommandItem({ className, ...props }: ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        'text-ui data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground flex cursor-pointer items-center rounded-md px-2 py-1.5 outline-none',
        className,
      )}
      {...props}
    />
  );
}
