import { cn } from '@portfolio/ui/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import type { ComponentProps } from 'react';

type SegmentedControlProps = ComponentProps<'div'> & {
  asChild?: boolean;
  variant?: 'default' | 'equal';
};

export function SegmentedControl({
  asChild = false,
  variant = 'default',
  className,
  ...props
}: SegmentedControlProps) {
  const Component = asChild ? Slot : 'div';
  return (
    <Component
      data-slot="segmented-control"
      data-variant={variant}
      className={cn(
        'w-fit self-start rounded-md border',
        variant === 'equal' ? 'grid auto-cols-fr grid-flow-col' : 'inline-flex',
        className,
      )}
      {...props}
    />
  );
}

export function SegmentedControlItem({
  asChild = false,
  className,
  ...props
}: ComponentProps<'button'> & { asChild?: boolean }) {
  const Component = asChild ? Slot : 'button';
  return (
    <Component
      data-slot="segmented-control-item"
      className={cn(
        'text-ui inline-flex h-8 cursor-pointer items-center justify-center px-3',
        'data-[state=on]:bg-primary data-[state=on]:text-primary-foreground',
        className,
      )}
      {...props}
    />
  );
}
