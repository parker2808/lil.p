'use client';

import { cn } from '@portfolio/ui/lib/utils';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import type { ComponentProps } from 'react';

export function RadioGroup({
  className,
  onKeyDown,
  ...props
}: ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn('flex flex-wrap gap-2', className)}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
        const group = event.currentTarget;
        setTimeout(() => {
          const active = group.ownerDocument.activeElement;
          if (
            active instanceof HTMLElement &&
            group.contains(active) &&
            active !== event.target &&
            active.getAttribute('role') === 'radio' &&
            active.getAttribute('aria-checked') === 'false'
          ) {
            active.click();
          }
        });
      }}
      {...props}
    />
  );
}

export function RadioGroupItem({
  className,
  children,
  ...props
}: ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        'border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground data-[state=checked]:border-primary data-[state=checked]:bg-primary-subtle data-[state=checked]:text-primary-subtle-foreground focus-visible:ring-ring inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      {children}
    </RadioGroupPrimitive.Item>
  );
}
