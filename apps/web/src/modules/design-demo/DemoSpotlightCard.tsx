'use client';

import type { PublicProjectListItem } from '@portfolio/contracts';
import { CaseCard } from '@portfolio/ui/components/CaseCard/CaseCard';
import type { PointerEvent } from 'react';

export function DemoSpotlightCard({
  project,
  locale,
  featured = false,
}: {
  project: PublicProjectListItem;
  locale: string;
  featured?: boolean;
}) {
  function move(event: PointerEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--spot-x', `${event.clientX - bounds.left}px`);
    event.currentTarget.style.setProperty('--spot-y', `${event.clientY - bounds.top}px`);
  }

  return (
    <div className="demo-spotlight" data-slug={project.slug} onPointerMove={move}>
      <CaseCard
        project={project}
        href={`/${locale}/projects/${project.slug}`}
        labels={{ nda: 'NDA' }}
        variant={featured ? 'featured' : 'default'}
      />
    </div>
  );
}
