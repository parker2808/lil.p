'use client';

import { useInView } from '@portfolio/ui/hooks/use-in-view.hook';
import { usePrefersReducedMotion } from '@portfolio/ui/hooks/use-prefers-reduced-motion.hook';
import { cn } from '@portfolio/ui/lib/utils';
import type { ComponentProps } from 'react';
import { useRef } from 'react';

export function Reveal({
  eager = false,
  className,
  children,
  ...props
}: ComponentProps<'div'> & { eager?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const reduced = usePrefersReducedMotion();
  const visible = eager || reduced || inView;

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all ease-out',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
        className,
      )}
      style={{ transitionDuration: 'var(--dur-slow)' }}
      {...props}
    >
      {children}
    </div>
  );
}
