import { cn } from '@portfolio/ui/lib/utils';
import type { ElementType } from 'react';

export function AccentHeadline({
  text,
  accent,
  as: Comp = 'h1',
  className,
}: {
  text: string;
  accent?: string | null;
  as?: ElementType;
  className?: string;
}) {
  const index = accent ? text.indexOf(accent) : -1;
  if (!accent || index < 0) {
    return <Comp className={cn('font-heading text-display font-bold', className)}>{text}</Comp>;
  }

  return (
    <Comp className={cn('font-heading text-display font-bold', className)}>
      {text.slice(0, index)}
      <span className="text-primary">{accent}</span>
      {text.slice(index + accent.length)}
    </Comp>
  );
}
