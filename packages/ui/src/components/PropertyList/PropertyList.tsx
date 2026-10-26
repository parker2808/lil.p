import { cn } from '@portfolio/ui/lib/utils';
import type { ReactNode } from 'react';

export function PropertyList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div data-slot="property-list" className={cn('flex flex-col gap-4', className)}>
      {children}
    </div>
  );
}
