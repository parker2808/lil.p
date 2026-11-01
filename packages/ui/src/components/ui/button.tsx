import { cn } from '@portfolio/ui/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';

import { Spinner } from './spinner';

export const buttonVariants = cva(
  [
    'relative inline-flex items-center justify-center gap-2 rounded-md font-medium',
    'text-ui whitespace-nowrap transition-colors',
    'disabled:pointer-events-none disabled:opacity-50',
    'pointer-coarse:min-h-11 pointer-coarse:min-w-11',
  ].join(' '),
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary-hover',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-accent',
        outline: 'border-border bg-background hover:border-border-strong hover:bg-accent border',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        link: 'text-primary hover:text-primary-hover underline underline-offset-4',
      },
      size: {
        sm: 'h-7 px-2.5',
        default: 'h-8 px-3',
        lg: 'text-body h-10 px-4',
      },
      surface: {
        default: '',
        public: 'min-h-10 motion-safe:hover:-translate-y-0.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      surface: 'default',
    },
  },
);

export function Button({
  className,
  variant,
  size,
  surface,
  loading = false,
  asChild = false,
  disabled,
  children,
  ...props
}: ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean;
    asChild?: boolean;
  }) {
  const classes = cn(buttonVariants({ variant, size, surface }), className);

  if (asChild) {
    return (
      <Slot data-slot="button" className={classes} {...props}>
        {children}
      </Slot>
    );
  }

  return (
    <button
      data-slot="button"
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      <span
        className={cn('pointer-events-none inline-flex items-center gap-2', loading && 'invisible')}
      >
        {children}
      </span>
      {loading ? <Spinner className="absolute" /> : null}
    </button>
  );
}
