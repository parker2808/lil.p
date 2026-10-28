'use client';

import { usePrefersReducedMotion } from '@portfolio/ui/hooks/use-prefers-reduced-motion.hook';
import { cn } from '@portfolio/ui/lib/utils';
import { useEffect, useState } from 'react';

export function ContentProgress({
  className,
  scrollTargetId,
}: {
  className?: string;
  scrollTargetId?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (reduced) {
      return;
    }
    const pane = scrollTargetId ? document.getElementById(scrollTargetId) : null;
    const usePane = pane && pane.scrollHeight > pane.clientHeight;
    const source = usePane ? pane : window;
    const onScroll = () => {
      const max = usePane
        ? pane.scrollHeight - pane.clientHeight
        : document.documentElement.scrollHeight - window.innerHeight;
      const position = usePane ? pane.scrollTop : window.scrollY;
      setProgress(max > 0 ? position / max : 0);
    };
    onScroll();
    source.addEventListener('scroll', onScroll, { passive: true });
    return () => source.removeEventListener('scroll', onScroll);
  }, [reduced, scrollTargetId]);

  if (reduced) {
    return null;
  }

  return (
    <div
      aria-hidden
      data-slot="content-progress"
      className={cn(
        'bg-primary z-header pointer-events-none fixed top-0 left-0 h-0.5 w-full origin-left',
        className,
      )}
      style={{ transform: `scaleX(${Math.min(progress, 1)})` }}
    />
  );
}
