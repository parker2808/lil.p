import { cn } from '@portfolio/ui/lib/utils';
import type { ComponentProps } from 'react';

export function Eyebrow({
  tone = 'primary',
  className,
  ...props
}: ComponentProps<'p'> & { tone?: 'primary' | 'subtle' }) {
  return (
    <p
      data-slot="eyebrow"
      className={cn(
        'text-eyebrow font-mono font-medium uppercase',
        tone === 'primary' ? 'text-primary' : 'text-subtle-foreground',
        className,
      )}
      {...props}
    />
  );
}
