'use client';

import { cn } from '@portfolio/ui/lib/utils';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import type { ComponentProps } from 'react';

export function Switch({ className, ...props }: ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'data-[state=checked]:before:bg-primary data-[state=unchecked]:before:bg-muted hover:before:ring-primary focus-visible:ring-ring aria-invalid:before:ring-destructive relative inline-flex size-11 shrink-0 items-center justify-center rounded-full before:absolute before:h-5 before:w-8 before:rounded-full before:transition-colors hover:before:ring-1 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:before:ring-2',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="bg-background pointer-events-none relative block size-4 rounded-full shadow-sm transition-transform data-[state=checked]:translate-x-1.5 data-[state=unchecked]:-translate-x-1.5"
      />
    </SwitchPrimitive.Root>
  );
}
