import type { LayoutPreset } from '@portfolio/contracts';
import { cn } from '@portfolio/ui/lib/utils';
import type { ComponentProps } from 'react';

const LAYOUT_CLASS: Record<LayoutPreset, string> = {
  ONE: 'grid-cols-1',
  TWO: 'grid-cols-1 md:grid-cols-2',
  THREE: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  FOUR: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  SPLIT_8_4: 'grid-cols-1 lg:grid-cols-12',
  SPLIT_4_8: 'grid-cols-1 lg:grid-cols-12',
  SPLIT_7_5: 'grid-cols-1 lg:grid-cols-12',
};

export function BlockLayout({
  layout,
  labelledBy,
  className,
  ...props
}: ComponentProps<'div'> & { layout: LayoutPreset; labelledBy?: string }) {
  return (
    <div
      data-slot="block-layout"
      aria-labelledby={labelledBy}
      className={cn('grid gap-6', LAYOUT_CLASS[layout], className)}
      {...props}
    />
  );
}
