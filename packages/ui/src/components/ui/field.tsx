import { cn } from '@portfolio/ui/lib/utils';
import type { ComponentProps, ReactNode } from 'react';

import { Label } from './label';

export function Field({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="field" className={cn('flex flex-col gap-1.5', className)} {...props} />;
}

export function FieldLabel({ className, ...props }: ComponentProps<typeof Label>) {
  return <Label data-slot="field-label" className={className} {...props} />;
}

export function FieldDescription({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      data-slot="field-description"
      className={cn('text-ui-meta text-muted-foreground', className)}
      {...props}
    />
  );
}

export function FieldError({
  className,
  children,
  ...props
}: ComponentProps<'p'> & { children?: ReactNode }) {
  if (!children) {
    return null;
  }

  return (
    <p
      data-slot="field-error"
      role="alert"
      className={cn('text-ui-meta text-destructive', className)}
      {...props}
    >
      {children}
    </p>
  );
}
