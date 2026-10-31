'use client';

import { useEffect, useRef, useState } from 'react';

/** The CSS poster is always present; the optional shader loads after the page settles. */
export function HeroStage({ enabled }: { enabled: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection;
    const media = [
      matchMedia('(max-width: 1023px)'),
      matchMedia('(pointer: coarse)'),
      matchMedia('(prefers-reduced-motion: reduce)'),
    ];
    const update = () =>
      setActive(enabled && !connection?.saveData && media.every((item) => !item.matches));
    update();
    media.forEach((item) => item.addEventListener('change', update));
    return () => media.forEach((item) => item.removeEventListener('change', update));
  }, [enabled]);

  useEffect(() => {
    if (!active) return;
    let disposed = false;
    let cleanup: (() => void) | undefined;
    const load = () => {
      void import('./hero-shader').then(({ startHeroShader }) => {
        if (!disposed && ref.current) cleanup = startHeroShader(ref.current);
      });
    };
    const idle = window.requestIdleCallback?.(load);
    const timer = idle === undefined ? window.setTimeout(load, 1000) : undefined;
    return () => {
      disposed = true;
      if (idle !== undefined) window.cancelIdleCallback(idle);
      if (timer !== undefined) clearTimeout(timer);
      cleanup?.();
    };
  }, [active]);

  return (
    <div className="hero-stage" aria-hidden>
      {active ? <canvas ref={ref} /> : null}
    </div>
  );
}
