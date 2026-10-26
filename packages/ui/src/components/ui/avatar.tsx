import { cn } from '@portfolio/ui/lib/utils';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import type { ComponentProps } from 'react';

export function Avatar({ className, ...props }: ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        'bg-muted relative flex size-16 shrink-0 overflow-hidden rounded-full',
        className,
      )}
      {...props}
    />
  );
}

export function AvatarImage({ className, ...props }: ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn('aspect-square size-full', className)}
      {...props}
    />
  );
}

export function AvatarFallback({
  className,
  ...props
}: ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        'bg-primary-subtle text-primary text-title flex size-full items-center justify-center font-mono font-semibold',
        className,
      )}
      {...props}
    />
  );
}
