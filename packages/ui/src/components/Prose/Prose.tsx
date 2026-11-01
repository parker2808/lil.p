import { cn } from '@portfolio/ui/lib/utils';
import type { ComponentProps } from 'react';

export function Prose({
  compact = false,
  className,
  ...props
}: ComponentProps<'div'> & { compact?: boolean }) {
  return (
    <div
      data-slot="prose"
      data-compact={compact || undefined}
      className={cn(
        'redesign-prose',
        'max-w-measure text-foreground [&_a]:text-primary [&_h2]:text-heading [&_h3]:text-subheading [&_li]:before:text-primary [&_a]:underline [&_code]:font-mono [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:font-semibold [&_li]:relative [&_li]:pl-4 [&_li]:before:absolute [&_li]:before:left-0 [&_ol]:my-4 [&_p]:my-4 [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto [&_ul]:my-4',
        compact ? 'text-body' : 'text-prose',
        className,
      )}
      {...props}
    />
  );
}
