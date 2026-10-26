'use client';

import { useInView } from '@portfolio/ui/hooks/use-in-view.hook';
import { cn } from '@portfolio/ui/lib/utils';
import type { ComponentProps } from 'react';
import { useEffect, useRef, useState } from 'react';

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  return reduced;
}

export function Reveal({ className, children, ...props }: ComponentProps<'div'>) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const reduced = usePrefersReducedMotion();
  const visible = reduced || inView;

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
