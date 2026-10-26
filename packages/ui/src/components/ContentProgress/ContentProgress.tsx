'use client';

import { usePrefersReducedMotion } from '@portfolio/ui/hooks/use-prefers-reduced-motion.hook';
import { cn } from '@portfolio/ui/lib/utils';
import { useEffect, useState } from 'react';

export function ContentProgress({ className }: { className?: string }) {
  const reduced = usePrefersReducedMotion();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (reduced) {
      return;
    }
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? window.scrollY / max : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [reduced]);

  if (reduced) {
    return null;
  }

  return (
    <div
      aria-hidden
      data-slot="content-progress"
      className={cn('bg-primary z-header pointer-events-none fixed top-0 left-0 h-0.5', className)}
      style={{ width: `${Math.min(progress, 1) * 100}%` }}
    />
  );
}
