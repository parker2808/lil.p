import type { PublicBlock } from '@portfolio/contracts';
import { DomainCard } from '@portfolio/ui/components/DomainCard/DomainCard';
import { Reveal } from '@portfolio/ui/components/Reveal/Reveal';
import { Skeleton } from '@portfolio/ui/components/ui/skeleton';
import { getTranslations } from 'next-intl/server';

import { listDomains } from '@/modules/projects/services/domains.service';

import type { BlockHeadingProps } from '../../types/entities/block-heading.type';
import type { BlockContext } from '../../types/entities/block-context.type';
import { renderAppLink } from '../../utils/render-app-link.util';
import { BlockHeading } from '../BlockHeading/BlockHeading';

export async function DomainGridBlock({
  block,
  context,
}: {
  block: PublicBlock;
  context: BlockContext;
}) {
  const props = block.props as { heading?: BlockHeadingProps };
  const [domains, t] = await Promise.all([listDomains(context.locale), getTranslations('blocks')]);
  const visible = domains.filter((domain) => domain.projectCount > 0);
  if (visible.length < 1) {
    return null;
  }

  return (
    <>
      <Reveal className="col-span-full">
        <BlockHeading heading={props.heading} />
      </Reveal>
      {visible.map((domain) => (
        <Reveal key={domain.id} lang={block.lang}>
          <DomainCard
            domain={domain}
            href={`/projects?domain=${domain.slug}`}
            labels={{ projects: t('projects') }}
            renderLink={renderAppLink}
          />
        </Reveal>
      ))}
    </>
  );
}

export function DomainGridSkeleton() {
  return <Skeleton className="col-span-full h-40 w-full" />;
}
