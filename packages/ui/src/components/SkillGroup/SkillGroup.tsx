import type { PublicSkillsGrouped } from '@portfolio/contracts';
import { Badge } from '@portfolio/ui/components/ui/badge';
import { cn } from '@portfolio/ui/lib/utils';

const DEPTHS = ['daily', 'shipped', 'growing'] as const;

export function SkillGroup({
  groups,
  labels,
  className,
}: {
  groups: PublicSkillsGrouped;
  labels: Record<(typeof DEPTHS)[number], string>;
  className?: string;
}) {
  const columns = DEPTHS.map((depth) => ({ depth, skills: groups[depth], heading: labels[depth] }));
  if (columns.every((column) => column.skills.length < 1)) {
    return null;
  }

  return (
    <div data-slot="skill-group" className={cn('grid gap-6 md:grid-cols-3 md:gap-8', className)}>
      {columns.map((column) =>
        column.skills.length ? (
          <div key={column.depth}>
            <h3 className="text-eyebrow text-subtle-foreground mb-3 font-mono font-medium uppercase">
              {column.heading}
            </h3>
            <ul className="flex flex-wrap gap-1.5">
              {column.skills.map((skill) => (
                <li key={skill.slug}>
                  <Badge
                    variant={column.depth === 'daily' ? 'primary' : 'neutral'}
                    className="normal-case"
                  >
                    {skill.name}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        ) : null,
      )}
    </div>
  );
}
