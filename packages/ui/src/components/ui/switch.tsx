'use client';

import { cn } from '@portfolio/ui/lib/utils';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import type { ComponentProps } from 'react';

export function Switch({ className, ...props }: ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'focus-visible:ring-ring data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted inline-flex h-5 w-8 shrink-0 items-center rounded-full border border-transparent transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="bg-background pointer-events-none block size-4 rounded-full shadow-sm transition-transform data-[state=checked]:translate-x-3 data-[state=unchecked]:translate-x-0"
      />
    </SwitchPrimitive.Root>
  );
}
