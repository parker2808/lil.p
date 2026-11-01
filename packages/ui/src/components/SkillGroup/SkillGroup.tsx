import type { PublicSkill, PublicSkillsGrouped } from '@portfolio/contracts';
import { cn } from '@portfolio/ui/lib/utils';

export type SkillCategoryGroup = { id: number; name: string; skills: PublicSkill[] };

/** Category groups in category id order; skills inside keep daily, shipped, growing order. */
export function groupSkillsByCategory(groups: PublicSkillsGrouped): SkillCategoryGroup[] {
  const byCategory = new Map<number, SkillCategoryGroup>();
  for (const skill of [...groups.daily, ...groups.shipped, ...groups.growing]) {
    const group = byCategory.get(skill.category.id);
    if (group) {
      group.skills.push(skill);
      continue;
    }
    byCategory.set(skill.category.id, {
      id: skill.category.id,
      name: skill.category.name,
      skills: [skill],
    });
  }
  return [...byCategory.values()].sort((a, b) => a.id - b.id);
}

export function SkillGroup({
  groups,
  labels,
  className,
}: {
  groups: PublicSkillsGrouped;
  labels: { other: string };
  className?: string;
}) {
  const categories = groupSkillsByCategory(groups);
  if (categories.length < 1) {
    return null;
  }

  return (
    <div
      data-slot="skill-group"
      className={cn('grid gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3', className)}
    >
      {categories.map((category) => (
        <section key={category.id} data-slot="skill-category">
          <h3 className="text-eyebrow text-subtle-foreground mb-2 font-mono font-medium uppercase">
            {category.name || labels.other}
          </h3>
          <ul className="text-body flex flex-wrap gap-x-3 gap-y-1">
            {category.skills.map((skill) => (
              <li
                key={skill.slug}
                className={
                  skill.depth === 'DAILY' ? 'text-foreground font-medium' : 'text-muted-foreground'
                }
              >
                {skill.name}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
