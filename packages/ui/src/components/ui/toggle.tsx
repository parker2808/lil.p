'use client';

import { cn } from '@portfolio/ui/lib/utils';
import * as TogglePrimitive from '@radix-ui/react-toggle';
import type { ComponentProps } from 'react';

export function Toggle({ className, ...props }: ComponentProps<typeof TogglePrimitive.Root>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(
        'text-ui inline-flex size-7 items-center justify-center rounded-md',
        'hover:bg-accent hover:text-accent-foreground',
        'data-[state=on]:bg-accent data-[state=on]:text-accent-foreground',
        'disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}
