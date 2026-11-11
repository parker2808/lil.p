'use client';

import { cn } from '@portfolio/ui/lib/utils';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check, Minus } from 'lucide-react';
import type { ComponentProps } from 'react';

export function Checkbox({ className, ...props }: ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'group text-primary-foreground before:border-input before:bg-background hover:before:border-primary data-[state=checked]:before:border-primary data-[state=checked]:before:bg-primary data-[state=indeterminate]:before:border-primary data-[state=indeterminate]:before:bg-primary focus-visible:ring-ring aria-invalid:before:border-destructive relative inline-flex size-11 shrink-0 items-center justify-center rounded-md before:absolute before:size-4 before:rounded-sm before:border before:transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="relative flex items-center justify-center">
        <Check className="size-3 group-data-[state=indeterminate]:hidden" />
        <Minus className="hidden size-3 group-data-[state=indeterminate]:block" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
