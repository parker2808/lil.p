import { Prose } from '@portfolio/ui/components/Prose/Prose';
import { cn } from '@portfolio/ui/lib/utils';
import type { ReactNode } from 'react';

export function DecisionCard({
  id,
  title,
  children,
  className,
}: {
  id?: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <article
      data-slot="decision-card"
      className={cn('bg-card border-border my-4 rounded-lg border px-4 py-4', className)}
    >
      <h3 id={id} className="text-body mb-2 font-semibold">
        {title}
      </h3>
      <Prose compact>{children}</Prose>
    </article>
  );
}
