import type { PublicBlock } from '@portfolio/contracts';
import { CaseCard } from '@portfolio/ui/components/CaseCard/CaseCard';
import { Reveal } from '@portfolio/ui/components/Reveal/Reveal';
import { Skeleton } from '@portfolio/ui/components/ui/skeleton';
import { getTranslations } from 'next-intl/server';

import { listCaseProjects } from '@/modules/projects/services/projects.service';

import type { BlockHeadingProps } from '../../types/entities/block-heading.type';
import type { BlockContext } from '../../types/entities/block-context.type';
import { renderAppLink } from '../../utils/render-app-link.util';
import { BlockHeading } from '../BlockHeading/BlockHeading';

export async function CaseGridBlock({
  block,
  context,
}: {
  block: PublicBlock;
  context: BlockContext;
}) {
  const props = block.props as {
    heading?: BlockHeadingProps;
    source?: 'latest' | 'featured' | 'manual';
    projectIds?: number[];
    domainSlug?: string;
    limit?: number;
  };
  const [projects, t] = await Promise.all([
    listCaseProjects(context.locale, {
      source: props.source ?? 'latest',
      projectIds: props.projectIds ?? [],
      domainSlug: props.domainSlug,
      limit: props.limit ?? 3,
    }),
    getTranslations('blocks'),
  ]);
  if (projects.length < 1) {
    return null;
  }

  return (
    <>
      <Reveal className="col-span-full">
        <BlockHeading heading={props.heading} />
      </Reveal>
      {projects.map((project) => (
        <Reveal key={project.id} lang={block.lang}>
          <CaseCard
            project={project}
            href={`/projects/${project.slug}`}
            labels={{ nda: t('nda') }}
            renderLink={renderAppLink}
          />
        </Reveal>
      ))}
    </>
  );
}

export function CaseGridSkeleton() {
  return <Skeleton className="col-span-full h-56 w-full" />;
}
