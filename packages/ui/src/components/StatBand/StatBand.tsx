'use client';

import type { PublicProfileStat } from '@portfolio/contracts';
import { Icon } from '@portfolio/ui/components/Icon/Icon';
import { useInView } from '@portfolio/ui/hooks/use-in-view.hook';
import { usePrefersReducedMotion } from '@portfolio/ui/hooks/use-prefers-reduced-motion.hook';
import { cn } from '@portfolio/ui/lib/utils';
import { parseStatValue } from '@portfolio/ui/utils/parse-stat-value.util';
import { useEffect, useRef, useState } from 'react';

function StatItem({ stat, compact }: { stat: PublicProfileStat; compact: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const reduced = usePrefersReducedMotion();
  const { amount, display } = parseStatValue(stat.value, stat.suffix);
  const [shown, setShown] = useState(reduced || amount === null ? display : '0');

  useEffect(() => {
    if (amount === null || reduced) {
      setShown(display);
      return;
    }
    if (!inView) {
      return;
    }

    const rest = display.slice(String(amount).length);
    const started = performance.now();
    const duration = 800;
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - started) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      const current = Math.round(amount * eased);
      setShown(`${current}${rest}`);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [amount, display, inView, reduced]);

  const name = `${display} ${stat.label}`;

  return (
    <div
      ref={ref}
      data-slot="stat-item"
      role="group"
      aria-label={name}
      className="flex flex-col gap-2"
    >
      <span className="bg-muted text-primary inline-flex size-10 items-center justify-center rounded-md">
        <Icon name={stat.iconKey} className={compact ? 'size-4' : 'size-5'} />
      </span>
      <span
        aria-hidden
        className={cn(
          'font-heading text-primary font-bold tabular-nums',
          compact ? 'text-heading' : 'text-title',
        )}
        style={{ minWidth: `${display.length}ch` }}
      >
        {shown}
      </span>
      <span aria-hidden className="text-eyebrow text-muted-foreground font-mono uppercase">
        {stat.label}
      </span>
    </div>
  );
}

export function StatBand({
  stats,
  variant = 'default',
  className,
}: {
  stats: PublicProfileStat[];
  variant?: 'default' | 'compact';
  className?: string;
}) {
  if (stats.length < 2) {
    return null;
  }

  return (
    <div
      data-slot="stat-band"
      data-variant={variant}
      className={cn(
        'grid grid-cols-2 gap-x-4 gap-y-6',
        variant === 'compact' ? 'md:grid-cols-4' : 'md:grid-cols-4 md:gap-6',
        className,
      )}
    >
      {stats.map((stat) => (
        <StatItem key={stat.id} stat={stat} compact={variant === 'compact'} />
      ))}
    </div>
  );
}
