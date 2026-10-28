import { cn } from '@portfolio/ui/lib/utils';
import type { ComponentProps } from 'react';

export function Reveal({
  eager = false,
  className,
  ...props
}: ComponentProps<'div'> & { eager?: boolean }) {
  return (
    <div
      data-slot="reveal"
      data-eager={eager || undefined}
      className={cn(!eager && 'scroll-reveal', className)}
      {...props}
    />
  );
}
