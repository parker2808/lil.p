import type { PublicProcessStep } from '@portfolio/contracts';
import { Icon } from '@portfolio/ui/components/Icon/Icon';
import { cn } from '@portfolio/ui/lib/utils';
import { ArrowDown } from 'lucide-react';

function stepNumber(index: number): string {
  return String(index + 1).padStart(2, '0');
}

export function ProcessFlow({
  steps,
  className,
}: {
  steps: PublicProcessStep[];
  className?: string;
}) {
  if (steps.length < 3) {
    return null;
  }

  const active = Math.floor((steps.length - 1) / 2);

  return (
    <ol
      data-slot="process-flow"
      className={cn('redesign-process-flow', 'flex flex-col', className)}
    >
      {steps.map((step, index) => {
        const highlighted = index === active;
        return (
          <li key={step.id} data-active={highlighted || undefined}>
            {index > 0 ? (
              <div aria-hidden className="text-border flex h-4 items-center pl-7">
                <ArrowDown className="size-3" />
              </div>
            ) : null}
            <div
              className={cn(
                'border-border bg-card flex items-center gap-2.5 rounded-lg border px-3.5 py-3',
                highlighted && 'bg-primary-subtle border-primary/30',
              )}
            >
              <span
                className={cn(
                  'bg-muted text-primary inline-flex size-7 items-center justify-center rounded-md',
                  highlighted && 'shadow-glow',
                )}
              >
                <Icon name={step.iconKey} className="size-3.5" />
              </span>
              <span className="text-eyebrow text-subtle-foreground font-mono">
                {stepNumber(index)}
              </span>
              <span className="text-meta">
                {step.title}
                {step.caption ? (
                  <span className="text-muted-foreground inline-flex items-center gap-1">
                    <span aria-hidden>·</span>
                    <span>{step.caption}</span>
                  </span>
                ) : null}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
