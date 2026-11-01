import { cn } from '@portfolio/ui/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';

export const cardVariants = cva('bg-card text-card-foreground rounded-lg border', {
  variants: { surface: { default: '', admin: 'rounded-[14px] shadow-none' } },
  defaultVariants: { surface: 'default' },
});

export function Card({
  className,
  surface,
  ...props
}: ComponentProps<'div'> & VariantProps<typeof cardVariants>) {
  return <div data-slot="card" className={cn(cardVariants({ surface }), className)} {...props} />;
}

export const cardHeaderVariants = cva('flex flex-col gap-1.5 p-6', {
  variants: { surface: { default: '', admin: 'border-border border-b py-3.5' } },
  defaultVariants: { surface: 'default' },
});

export function CardHeader({
  className,
  surface,
  ...props
}: ComponentProps<'div'> & VariantProps<typeof cardHeaderVariants>) {
  return (
    <div
      data-slot="card-header"
      className={cn(cardHeaderVariants({ surface }), className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: ComponentProps<'h3'>) {
  return (
    <h3
      data-slot="card-title"
      className={cn('text-ui-title font-semibold', className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      data-slot="card-description"
      className={cn('text-ui text-muted-foreground', className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn('p-6 pt-0', className)} {...props} />;
}
