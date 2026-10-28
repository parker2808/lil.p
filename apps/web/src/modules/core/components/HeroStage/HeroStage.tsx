'use client';

import { useEffect, useRef } from 'react';

/** The CSS poster is always present; the optional shader loads after the page settles. */
export function HeroStage({ enabled }: { enabled: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection;
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    if (!enabled || media.matches || connection?.saveData) return;
    let disposed = false;
    let cleanup: (() => void) | undefined;
    const timer = window.setTimeout(() => {
      void import('./hero-shader').then(({ startHeroShader }) => {
        if (!disposed && ref.current) cleanup = startHeroShader(ref.current);
      });
    }, 1000);
    const stop = () => {
      if (media.matches) {
        disposed = true;
        cleanup?.();
      }
    };
    media.addEventListener('change', stop);
    return () => {
      disposed = true;
      clearTimeout(timer);
      cleanup?.();
      media.removeEventListener('change', stop);
    };
  }, [enabled]);
  return (
    <div className="hero-stage" aria-hidden>
      <canvas ref={ref} />
    </div>
  );
}
