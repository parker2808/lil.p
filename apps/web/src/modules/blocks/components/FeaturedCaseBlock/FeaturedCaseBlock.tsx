import type { PublicBlock } from '@portfolio/contracts';
import { CaseCard } from '@portfolio/ui/components/CaseCard/CaseCard';
import { Reveal } from '@portfolio/ui/components/Reveal/Reveal';
import { Skeleton } from '@portfolio/ui/components/ui/skeleton';
import { getTranslations } from 'next-intl/server';

import { getFeaturedProject } from '@/modules/projects/services/projects.service';

import type { BlockHeadingProps } from '../../types/entities/block-heading.type';
import type { BlockContext } from '../../types/entities/block-context.type';
import { renderAppLink } from '../../utils/render-app-link.util';
import { BlockHeading } from '../BlockHeading/BlockHeading';

export async function FeaturedCaseBlock({
  block,
  context,
}: {
  block: PublicBlock;
  context: BlockContext;
}) {
  const props = block.props as { heading?: BlockHeadingProps; projectId?: number | null };
  const [project, t] = await Promise.all([
    getFeaturedProject(context.locale, props.projectId),
    getTranslations('blocks'),
  ]);
  if (!project) {
    return null;
  }

  return (
    <Reveal className="col-span-full flex flex-col gap-8" lang={block.lang}>
      <BlockHeading heading={props.heading} />
      <CaseCard
        project={project}
        href={`/projects/${project.slug}`}
        labels={{ nda: t('nda') }}
        variant="featured"
        renderLink={renderAppLink}
      />
    </Reveal>
  );
}

export function FeaturedCaseSkeleton() {
  return <Skeleton className="col-span-full h-64 w-full" />;
}
