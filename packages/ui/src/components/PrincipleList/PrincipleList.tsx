import type { PublicPrinciple } from '@portfolio/contracts';
import { cn } from '@portfolio/ui/lib/utils';

function principleNumber(index: number): string {
  return String(index + 1).padStart(2, '0');
}

export function PrincipleList({
  principles,
  className,
}: {
  principles: PublicPrinciple[];
  className?: string;
}) {
  if (principles.length < 1) {
    return null;
  }

  return (
    <ol data-slot="principle-list" className={cn('grid gap-6 md:grid-cols-2', className)}>
      {principles.map((principle, index) => (
        <li key={principle.id} className="flex gap-3">
          <span className="text-eyebrow text-subtle-foreground inline-flex shrink-0 gap-1 font-mono">
            <span>{principleNumber(index)}</span>
            <span aria-hidden>—</span>
          </span>
          <div>
            <p className="text-body font-semibold">{principle.title}</p>
            <p className="text-meta text-muted-foreground clamp-marks mt-1 line-clamp-3">
              {principle.body}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
