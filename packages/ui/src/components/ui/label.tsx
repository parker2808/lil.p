import { cn } from '@portfolio/ui/lib/utils';
import * as LabelPrimitive from '@radix-ui/react-label';
import type { ComponentProps } from 'react';

export function Label({ className, ...props }: ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn('text-ui font-medium', className)}
      {...props}
    />
  );
}
