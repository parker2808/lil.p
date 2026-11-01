import { Atmosphere } from '@portfolio/ui/components/Atmosphere/Atmosphere';
import { Icon } from '@portfolio/ui/components/Icon/Icon';
import { cn } from '@portfolio/ui/lib/utils';
import type { ReactNode } from 'react';

export function CtaBand({
  title,
  intro,
  iconKey = 'sparkles',
  actions,
  className,
}: {
  title: string;
  intro?: string;
  iconKey?: string;
  actions?: ReactNode;
  className?: string;
}) {
  if (!title) {
    return null;
  }

  return (
    <div
      data-slot="cta-band"
      className={cn(
        'redesign-cta-band',
        'relative flex flex-col items-center gap-4 overflow-hidden px-6 py-16 text-center',
        className,
      )}
    >
      <Atmosphere variant="cta" enabled />
      <span className="bg-primary-subtle text-primary relative inline-flex size-7 items-center justify-center rounded-md">
        <Icon name={iconKey} className="size-4" />
      </span>
      <h2 className="font-heading text-heading relative font-semibold">{title}</h2>
      {intro ? (
        <p className="text-body text-muted-foreground relative max-w-prose">{intro}</p>
      ) : null}
      {actions ? (
        <div className="relative flex flex-wrap justify-center gap-3">{actions}</div>
      ) : null}
    </div>
  );
}
