import { cn } from '@portfolio/ui/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';

export const badgeVariants = cva(
  'text-eyebrow inline-flex items-center rounded-sm px-2 py-0.5 font-mono font-medium uppercase',
  {
    variants: {
      variant: {
        neutral: 'bg-muted text-foreground',
        primary: 'bg-primary-subtle text-primary-subtle-foreground',
        success: 'bg-success-subtle text-success',
        warning: 'bg-warning-subtle text-warning',
        destructive: 'bg-destructive-subtle text-destructive',
        info: 'bg-info-subtle text-info',
        outline: 'border-border text-foreground border bg-transparent',
      },
      hue: {
        jade: 'bg-hue-jade-subtle text-hue-jade',
        amber: 'bg-hue-amber-subtle text-hue-amber',
        blue: 'bg-hue-blue-subtle text-hue-blue',
        violet: 'bg-hue-violet-subtle text-hue-violet',
        rose: 'bg-hue-rose-subtle text-hue-rose',
      },
      appearance: {
        subtle: '',
        outline: 'border bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'neutral',
      appearance: 'subtle',
    },
  },
);

export function Badge({
  className,
  variant,
  hue,
  appearance,
  ...props
}: ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      data-hue={hue ?? undefined}
      className={cn(
        badgeVariants({ variant: hue ? undefined : variant, hue, appearance }),
        className,
      )}
      {...props}
    />
  );
}
