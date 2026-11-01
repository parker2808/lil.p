'use client';

import type { PublicSkillChip } from '@portfolio/contracts';
import { usePrefersReducedMotion } from '@portfolio/ui/hooks/use-prefers-reduced-motion.hook';
import { cn } from '@portfolio/ui/lib/utils';
import { Pause, Play } from 'lucide-react';
import { useEffect, useState } from 'react';

export function TechMarquee({
  items,
  enabled = true,
  labels,
  className,
}: {
  items: PublicSkillChip[];
  enabled?: boolean;
  labels: { pause: string; play: string };
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const staticRow = !enabled || items.length < 6 || reduced;
  const trackPaused = paused || hovered || focused || tabHidden;

  useEffect(() => {
    const syncVisibility = () => setTabHidden(document.hidden);
    syncVisibility();
    document.addEventListener('visibilitychange', syncVisibility);
    return () => document.removeEventListener('visibilitychange', syncVisibility);
  }, []);

  if (items.length < 1) {
    return null;
  }

  const chips = items.map((item) => (
    <span
      key={item.slug}
      className="text-eyebrow text-muted-foreground border-border bg-card inline-flex h-7 items-center rounded-full border px-3 font-mono whitespace-nowrap"
    >
      {item.name}
    </span>
  ));

  if (staticRow) {
    return (
      <div
        data-slot="tech-marquee"
        data-static=""
        className={cn('flex flex-wrap gap-2', className)}
      >
        {chips}
      </div>
    );
  }

  return (
    <div
      data-slot="tech-marquee"
      className={cn('flex items-center gap-3', className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
    >
      <div
        className="min-w-0 flex-1 overflow-hidden"
        style={{
          maskImage: 'linear-gradient(90deg, transparent, black 6%, black 94%, transparent)',
        }}
      >
        <div
          className={cn('marquee-track flex w-max gap-2', trackPaused && 'marquee-paused')}
          data-paused={trackPaused || undefined}
        >
          <div className="flex gap-2">{chips}</div>
          <div className="flex gap-2" aria-hidden>
            {chips}
          </div>
        </div>
      </div>
      <button
        type="button"
        aria-pressed={paused}
        aria-label={paused ? labels.play : labels.pause}
        onClick={() => setPaused((value) => !value)}
        className="border-border bg-card text-muted-foreground hover:text-foreground inline-flex size-8 shrink-0 items-center justify-center rounded-md border"
      >
        {paused ? (
          <Play className="size-3.5" aria-hidden />
        ) : (
          <Pause className="size-3.5" aria-hidden />
        )}
      </button>
    </div>
  );
}
