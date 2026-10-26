import { cn } from '@portfolio/ui/lib/utils';
import type { ComponentProps, ReactNode } from 'react';

const PROMPT = '>_';

export function KickerPill({
  children,
  className,
  ...props
}: ComponentProps<'p'> & { children?: ReactNode }) {
  if (!children) {
    return null;
  }

  return (
    <p
      data-slot="kicker-pill"
      className={cn(
        'bg-primary-subtle text-primary-subtle-foreground text-eyebrow inline-flex h-7 items-center gap-2 rounded-full px-3 font-mono font-medium',
        className,
      )}
      {...props}
    >
      <span aria-hidden>{PROMPT}</span>
      <span>{children}</span>
    </p>
  );
}
