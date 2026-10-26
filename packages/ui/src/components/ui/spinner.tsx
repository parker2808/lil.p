import { cn } from '@portfolio/ui/lib/utils';
import { Loader2 } from 'lucide-react';
import type { ComponentProps } from 'react';

export function Spinner({ className, ...props }: ComponentProps<typeof Loader2>) {
  return (
    <Loader2
      aria-hidden
      className={cn('size-4 animate-spin motion-reduce:animate-none', className)}
      {...props}
    />
  );
}
