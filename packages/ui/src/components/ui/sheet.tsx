'use client';

import { cn } from '@portfolio/ui/lib/utils';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import type { ComponentProps } from 'react';

export function Sheet(props: ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="sheet" {...props} />;
}

export function SheetTrigger(props: ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

export function SheetClose(props: ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="sheet-close" {...props} />;
}

export function SheetContent({
  className,
  side = 'right',
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> & { side?: 'right' | 'left' }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="z-overlay bg-background/80 fixed inset-0 backdrop-blur-sm" />
      <DialogPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          'z-modal bg-popover text-popover-foreground shadow-3 fixed inset-y-0 flex w-full max-w-sm flex-col gap-6 p-6',
          side === 'right' ? 'right-0 border-l' : 'left-0 border-r',
          className,
        )}
        {...props}
      />
    </DialogPrimitive.Portal>
  );
}

export function SheetTitle({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title className={cn('text-ui-title font-semibold', className)} {...props} />
  );
}
