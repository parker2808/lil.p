import type { PublicProjectListItem } from '@portfolio/contracts';
import { CaseCard } from '@portfolio/ui/components/CaseCard/CaseCard';

import { renderAppLink } from '@/modules/blocks/utils/render-app-link.util';

export function RelatedProjects({
  heading,
  projects,
  nda,
}: {
  heading: string;
  projects: PublicProjectListItem[];
  nda: string;
}) {
  if (projects.length < 1) {
    return null;
  }

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-heading font-semibold">{heading}</h2>
      <div className="grid gap-6 md:grid-cols-2">
        {projects.map((project) => (
          <CaseCard
            key={project.id}
            project={project}
            href={`/projects/${project.slug}`}
            labels={{ nda }}
            renderLink={renderAppLink}
          />
        ))}
      </div>
    </section>
  );
}
