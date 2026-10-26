import { cn } from '@portfolio/ui/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';

export const alertVariants = cva('rounded-lg border px-4 py-3', {
  variants: {
    variant: {
      info: 'border-info/30 bg-info-subtle text-info',
      warning: 'border-warning/30 bg-warning-subtle text-warning',
      destructive: 'border-destructive/30 bg-destructive-subtle text-destructive',
    },
  },
  defaultVariants: { variant: 'info' },
});

export function Alert({
  className,
  variant,
  ...props
}: ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}
